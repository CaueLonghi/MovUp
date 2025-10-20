/**
 * Application constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000',
  endpoints: {
    analyze: '/analisar-video/',
    saveReport: '/api/save_report',
    worstFrame: '/api/worst_frame'
  },
  timeout: 30000 // 30 seconds
};

// Error Messages
export const ERROR_MESSAGES = {
  NO_FILE: 'Nenhum arquivo de vídeo selecionado',
  INVALID_FILE: 'Por favor, selecione um arquivo de vídeo válido.',
  UPLOAD_FAILED: 'Erro ao enviar o vídeo. Tente novamente.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  ANALYSIS_FAILED: 'Erro na análise do vídeo. Tente novamente.',
  REPORT_LOAD_FAILED: 'Erro ao carregar relatório.',
  EXPORT_FAILED: 'Erro ao exportar relatório.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: 'Vídeo enviado com sucesso!',
  ANALYSIS_COMPLETE: 'Análise concluída com sucesso!',
  REPORT_SAVED: 'Relatório salvo com sucesso!',
  PDF_GENERATED: 'PDF gerado com sucesso!'
};

// Issue Type Configuration
export const ISSUE_TYPE_CONFIG = {
  posture: {
    title: 'Problemas de Postura',
    description: 'Detecção de postura incorreta durante a corrida, caracterizada por ângulos inadequados entre ombro, quadril e joelho.',
    impact: 'Pode causar dores nas costas, redução da eficiência da corrida e aumento do risco de lesões.',
    severity: 'medium',
    color: 'orange'
  },
  overstride: {
    title: 'Problemas de Overstride',
    description: 'Detecção de passadas excessivamente longas, onde o pé aterrissa muito à frente do centro de massa.',
    impact: 'Aumenta o impacto nas articulações, reduz a eficiência energética e pode causar lesões por overuse.',
    severity: 'low',
    color: 'blue'
  },
  visibility: {
    title: 'Problemas de Visibilidade',
    description: 'Frames onde a detecção de landmarks corporais foi comprometida devido a baixa qualidade da imagem.',
    impact: 'Pode resultar em análises menos precisas e dados incompletos para avaliação biomecânica.',
    severity: 'low',
    color: 'purple'
  }
};

// Severity Configuration
export const SEVERITY_CONFIG = {
  high: {
    label: 'Alto',
    color: 'danger',
    threshold: 0.8
  },
  medium: {
    label: 'Médio',
    color: 'warning',
    threshold: 0.5
  },
  low: {
    label: 'Baixo',
    color: 'info',
    threshold: 0.2
  }
};

// File Configuration
export const FILE_CONFIG = {
  maxSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  maxDuration: 300 // 5 minutes in seconds
};

// UI Configuration
export const UI_CONFIG = {
  animationDuration: 300,
  debounceDelay: 500,
  progressUpdateInterval: 200
};

// Local Storage Keys
export const STORAGE_KEYS = {
  REPORT_DATA: 'postureReport',
  USER_PREFERENCES: 'userPreferences',
  ANALYSIS_HISTORY: 'analysisHistory'
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  VIDEO: '/video',
  RECORDING: '/recording',
  REPORT: '/report',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile'
};
