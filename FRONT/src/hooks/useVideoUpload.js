import { useState, useCallback } from 'react';

// API Configuration
const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000',
  endpoints: {
    analyze: '/analisar-video/',
    saveReport: '/api/save_report'
  }
};

// Error messages
const ERROR_MESSAGES = {
  NO_FILE: 'Nenhum arquivo de vídeo selecionado',
  UPLOAD_FAILED: 'Erro ao enviar o vídeo. Tente novamente.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.'
};

/**
 * Custom hook for video upload and analysis
 * Handles file upload, API communication, and data transformation
 */
const useVideoUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  /**
   * Transforms API response to frontend format
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Transformed data
   */
  const transformApiResponse = useCallback((apiResponse) => {
    const { analysis = [], summary = {}, worst_frames = [] } = apiResponse;
    
    // Calculate metrics
    const totalIssues = analysis.length;
    const totalFrames = summary.total_frames || 0;
    const errorPercentage = totalFrames > 0 ? (totalIssues / totalFrames) * 100 : 0;
    
    const totalErrorSeconds = analysis.reduce((total, issue) => {
      return total + (issue.time_seconds || 0);
    }, 0);

    // Transform legacy format for backward compatibility
    const legacyPosturasErradas = analysis.map(issue => ({
      frame: issue.frame,
      second: issue.time_seconds || 0,
      angle: issue.issue_type === 'posture' ? 95 : 120,
      direcao: 'para frente'
    }));

    return {
      // Core data
      status: apiResponse.status,
      analysis,
      worst_frames,
      
      // Summary metrics
      total_frames: totalFrames,
      fps: summary.fps || 0,
      tempo_total_errado_segundos: totalErrorSeconds,
      percentual_errado: errorPercentage,
      
      // Legacy format for backward compatibility
      posturas_erradas: legacyPosturasErradas,
      
      // Analysis summary
      analysis_summary: {
        posture_issues: summary.posture_issues_count || 0,
        overstride_issues: summary.overstride_issues_count || 0,
        visibility_issues: summary.visibility_issues_count || 0
      }
    };
  }, []);

  /**
   * Handles API errors with proper error messages
   * @param {Error} error - The error object
   * @returns {string} User-friendly error message
   */
  const handleApiError = useCallback((error) => {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.includes('500')) {
      return ERROR_MESSAGES.SERVER_ERROR;
    }
    return error.message || ERROR_MESSAGES.UPLOAD_FAILED;
  }, []);

  /**
   * Uploads video file for analysis
   * @param {File} videoFile - The video file to upload
   * @returns {Promise<Object>} Analysis results
   */
  const uploadVideo = useCallback(async (videoFile) => {
    if (!videoFile) {
      const errorMsg = ERROR_MESSAGES.NO_FILE;
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!videoFile.type.startsWith('video/')) {
      const errorMsg = 'Por favor, selecione um arquivo de vídeo válido.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('file', videoFile);

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analyze}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const transformedResult = transformApiResponse(result);
      
      return transformedResult;
      
    } catch (error) {
      console.error('Video upload error:', error);
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [transformApiResponse, handleApiError]);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Resets hook state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setProgress(0);
  }, []);

  return {
    uploadVideo,
    isLoading,
    error,
    progress,
    clearError,
    reset
  };
};

export default useVideoUpload;