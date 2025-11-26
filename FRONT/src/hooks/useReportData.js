import { useState, useEffect, useMemo, useCallback } from 'react';

// Issue type configurations
const ISSUE_TYPE_CONFIG = {
  posture: {
    title: 'Problemas de Postura',
    description: 'Detecção de postura incorreta durante a corrida, caracterizada por ângulos inadequados entre ombro, quadril e joelho.',
    impact: 'Pode causar dores nas costas, redução da eficiência da corrida e aumento do risco de lesões.',
    severity: 'medium'
  },
  overstride: {
    title: 'Problemas de Overstride',
    description: 'Detecção de passadas excessivamente longas, onde o pé aterrissa muito à frente do centro de massa.',
    impact: 'Aumenta o impacto nas articulações, reduz a eficiência energética e pode causar lesões por overuse.',
    severity: 'low'
  },
  visibility: {
    title: 'Problemas de Visibilidade',
    description: 'Frames onde a detecção de landmarks corporais foi comprometida devido a baixa qualidade da imagem.',
    impact: 'Pode resultar em análises menos precisas e dados incompletos para avaliação biomecânica.',
    severity: 'low'
  }
};

// Backend configuration
const BACKEND_CONFIG = {
  baseUrls: [
    'http://127.0.0.1:8000',
    'http://localhost:8000',
    'http://127.0.0.1:5000',
    'http://localhost:5000'
  ]
};

/**
 * Custom hook for processing and managing report data
 * Handles data transformation, analysis section creation, and image URL construction
 */
const useReportData = (rawData) => {
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logging
  console.log('useReportData: Hook called', {
    hasRawData: !!rawData,
    rawDataType: typeof rawData,
    rawDataKeys: rawData ? Object.keys(rawData) : 'N/A'
  });

  /**
   * Constructs image URL from backend path
   * @param {string} imagePath - Relative image path from backend
   * @returns {string} Full image URL
   */
  const constructImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;
    
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Construct full URL using backend static file mount
    const baseUrl = BACKEND_CONFIG.baseUrls[0];
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${baseUrl}/${cleanPath}`;
  }, []);

  /**
   * Gets worst frame data for a specific issue type
   * @param {string} issueType - The issue type to find
   * @param {Object} data - The processed data object
   * @returns {Object|null} Worst frame data or null
   */
  const getWorstFrameData = useCallback((issueType, data) => {
    if (!data?.worst_frames) return null;
    
    // Handle array format (new)
    if (Array.isArray(data.worst_frames)) {
      return data.worst_frames.find(frame => frame.error_type === issueType);
    }
    
    // Handle object format (legacy)
    if (typeof data.worst_frames === 'object') {
      return data.worst_frames[issueType];
    }
    
    return null;
  }, []);

  /**
   * Creates analysis section data for a specific issue type from aggregated data
   * @param {string} issueType - The issue type
   * @param {Object} issueData - Aggregated issue data
   * @param {Object} data - The processed data object
   * @returns {Object|null} Analysis section data
   */
  const createAnalysisSection = useCallback((issueType, issueData, data) => {
    const config = ISSUE_TYPE_CONFIG[issueType];
    if (!config) return null;

    const frameCount = issueData['Número de frames com erro'] || 0;
    
    // Calculate total seconds based on fps and frame count
    const fps = data.fps || 1;
    const totalSeconds = frameCount / fps;
    
    // Get worst frame data
    const worstFrameData = getWorstFrameData(issueType, data);
    
    // Use worst frame from aggregated data or from worst_frames array
    const worstFrame = worstFrameData || {
      frame_number: issueData.worst_frame_number,
      image_path: issueData.image_path
    };

    // Get frame-level data for charts
    let frameData = null;
    let chartTitle = '';
    
    if (issueType === 'posture') {
      frameData = issueData.angles || [];
      chartTitle = 'Ângulo da Postura por Frame';
    } else if (issueType === 'overstride') {
      frameData = issueData.frames || [];
      chartTitle = 'Detecção de Overstride por Frame';
    }

    // Get success image path
    const successImagePath = issueData.success_image_path ? constructImageUrl(issueData.success_image_path) : null;

    return {
      ...config,
      frameCount,
      totalSeconds,
      worstFrameImage: worstFrame?.image_path ? constructImageUrl(worstFrame.image_path) : null,
      successFrameImage: successImagePath,
      worstFrameNumber: worstFrame?.frame_number,
      worstFrameSeverity: worstFrame?.severity_score,
      worstFrameDescription: worstFrame?.description,
      issueType,
      frameData,
      chartTitle,
      fps: data.fps || 30
    };
  }, [getWorstFrameData, constructImageUrl]);

  /**
   * Processes raw data and creates analysis sections from aggregated format
   */
  const analysisSections = useMemo(() => {
    if (!processedData?.analysis) return [];

    console.log('🔍 Creating analysis sections from aggregated data');

    // NEW FORMAT: analysis is an array of objects like [{ posture: {...} }, { overstride: {...} }, ...]
    const sections = [];
    
    processedData.analysis.forEach(item => {
      // Always show posture section (even with 0 errors)
      if (item.posture) {
        const section = createAnalysisSection('posture', item.posture, processedData);
        if (section) sections.push(section);
      }
      
      // Always show overstride section (even with 0 errors)
      if (item.overstride) {
        const section = createAnalysisSection('overstride', item.overstride, processedData);
        if (section) sections.push(section);
      }
      
      // Only show visibility if there are errors
      if (item.baixa_visibilidade && item.baixa_visibilidade['Número de frames com erro'] > 0) {
        const section = createAnalysisSection('visibility', item.baixa_visibilidade, processedData);
        if (section) sections.push(section);
      }
    });

    console.log('✅ Analysis sections created:', sections.length);
    return sections;
  }, [processedData, createAnalysisSection]);

  /**
   * Processes and validates raw data
   */
  useEffect(() => {
    console.log('📊 useReportData: useEffect triggered', { 
      hasRawData: !!rawData,
      rawDataKeys: rawData ? Object.keys(rawData) : []
    });
    
    const processData = async () => {
      try {
        console.log('🔄 useReportData: Starting data processing');
        setLoading(true);
        setError(null);

        if (!rawData) {
          console.log('⚠️ useReportData: No raw data, setting processed data to null');
          setProcessedData(null);
          return;
        }

        // NEW FORMAT: Backend sends analysis in aggregated format
        // analysis = [{ posture: {...} }, { overstride: {...} }, { baixa_visibilidade: {...} }]
        let analysisData = rawData.analysis || [];
        
        console.log('📋 Analysis data:', {
          hasAnalysis: !!rawData.analysis,
          analysisLength: analysisData.length,
          hasWorstFrames: !!rawData.worst_frames,
          hasSummary: !!rawData.analysis_summary
        });

        const processed = {
          ...rawData,
          analysis: analysisData,
          analysis_summary: rawData.analysis_summary || {
            posture_issues: 0,
            overstride_issues: 0,
            visibility_issues: 0
          }
        };

        console.log('✅ Data processed successfully:', {
          totalFrames: processed.total_frames,
          analysisItems: processed.analysis?.length,
          hasSummary: !!processed.analysis_summary,
          hasWorstFrames: !!processed.worst_frames
        });

        setProcessedData(processed);
      } catch (err) {
        console.error('❌ Error processing report data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    processData();
  }, [rawData]);

  const hasErrors = analysisSections.length > 0;

  return {
    processedData,
    analysisSections,
    loading,
    error,
    hasErrors
  };
};

export default useReportData;