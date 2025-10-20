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
   * Creates analysis section data for a specific issue type
   * @param {string} issueType - The issue type
   * @param {Array} issues - Array of issues for this type
   * @param {Object} data - The processed data object
   * @returns {Object|null} Analysis section data
   */
  const createAnalysisSection = useCallback((issueType, issues, data) => {
    const config = ISSUE_TYPE_CONFIG[issueType];
    if (!config) return null;

    const frameCount = issues.length;
    const totalSeconds = issues.reduce((total, issue) => total + (issue.time_seconds || 0), 0);
    
    // Get worst frame data
    const worstFrameData = getWorstFrameData(issueType, data);
    
    // Fallback: find worst frame from issues if backend data not available
    const worstFrame = worstFrameData || issues.reduce((worst, current) => {
      if (current.severity_score && worst.severity_score) {
        return current.severity_score > worst.severity_score ? current : worst;
      }
      return worst;
    }, issues[0]);

    return {
      ...config,
      frameCount,
      totalSeconds,
      worstFrameImage: worstFrame?.image_path ? constructImageUrl(worstFrame.image_path) : null,
      worstFrameNumber: worstFrame?.frame_number || worstFrame?.frame,
      worstFrameSeverity: worstFrame?.severity_score,
      worstFrameDescription: worstFrame?.description,
      issueType
    };
  }, [getWorstFrameData, constructImageUrl]);

  /**
   * Processes raw data and creates analysis sections
   */
  const analysisSections = useMemo(() => {
    if (!processedData?.analysis) return [];

    // Group analysis by issue type
    const groupedAnalysis = processedData.analysis.reduce((acc, issue) => {
      if (!acc[issue.issue_type]) {
        acc[issue.issue_type] = [];
      }
      acc[issue.issue_type].push(issue);
      return acc;
    }, {});

    // Create sections for each issue type
    const sections = [];
    Object.entries(groupedAnalysis).forEach(([issueType, issues]) => {
      const section = createAnalysisSection(issueType, issues, processedData);
      if (section) {
        sections.push(section);
      }
    });

    return sections;
  }, [processedData, createAnalysisSection]);

  /**
   * Processes and validates raw data
   */
  useEffect(() => {
    console.log('useReportData: useEffect triggered', { rawData: !!rawData });
    
    const processData = async () => {
      try {
        console.log('useReportData: Starting data processing');
        setLoading(true);
        setError(null);

        if (!rawData) {
          console.log('useReportData: No raw data, setting processed data to null');
          setProcessedData(null);
          return;
        }

        // Validate and process the raw data
        let analysisData = rawData.analysis || [];
        
        // Fallback: convert legacy posturas_erradas format
        if (!analysisData.length && rawData.posturas_erradas?.length) {
          analysisData = rawData.posturas_erradas.map(item => ({
            frame: item.frame,
            time_seconds: item.second,
            issue_type: 'posture',
            issue: 'Legacy posture issue',
            severity: 'medium'
          }));
        }

        const processed = {
          ...rawData,
          analysis: analysisData,
          analysis_summary: rawData.analysis_summary || {
            posture_issues: 0,
            overstride_issues: 0,
            visibility_issues: 0
          }
        };

        setProcessedData(processed);
      } catch (err) {
        console.error('Error processing report data:', err);
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