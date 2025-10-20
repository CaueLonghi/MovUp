/**
 * Utility functions for data validation
 */

import { FILE_CONFIG } from '../config/constants';

/**
 * Validates video file
 * @param {File} file - File to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateVideoFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'Nenhum arquivo selecionado' };
  }

  if (!file.type.startsWith('video/')) {
    return { isValid: false, error: 'Por favor, selecione um arquivo de vídeo válido' };
  }

  if (file.size > FILE_CONFIG.maxSize) {
    return { 
      isValid: false, 
      error: `Arquivo muito grande. Tamanho máximo: ${formatFileSize(FILE_CONFIG.maxSize)}` 
    };
  }

  if (!FILE_CONFIG.allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Tipo de arquivo não suportado. Use MP4, AVI, MOV ou WMV' 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates analysis data structure
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
export const validateAnalysisData = (data) => {
  if (!data) {
    return { isValid: false, error: 'Dados de análise não encontrados' };
  }

  if (!data.analysis || !Array.isArray(data.analysis)) {
    return { isValid: false, error: 'Dados de análise inválidos' };
  }

  if (!data.summary || typeof data.summary !== 'object') {
    return { isValid: false, error: 'Resumo da análise não encontrado' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates report data structure
 * @param {Object} data - Report data to validate
 * @returns {Object} Validation result
 */
export const validateReportData = (data) => {
  if (!data) {
    return { isValid: false, error: 'Dados do relatório não encontrados' };
  }

  const requiredFields = ['total_frames', 'fps', 'analysis'];
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    return { 
      isValid: false, 
      error: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates severity score
 * @param {number} score - Score to validate
 * @returns {boolean} True if valid score
 */
export const isValidSeverityScore = (score) => {
  return typeof score === 'number' && score >= 0 && score <= 1;
};

// Helper function for file size formatting (imported from formatters)
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
