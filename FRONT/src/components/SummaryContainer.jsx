import React from 'react';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';

/**
 * Utility functions for data formatting
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

const formatPercentage = (percentage) => {
  return `${percentage.toFixed(1)}%`;
};

/**
 * Metric card component for displaying individual metrics
 */
const MetricCard = ({ value, label, color, icon }) => (
  <Card className="summary-metric-card p-2">
    <div className="text-center">
      <div className={`text-2xl font-bold text-${color}-600 mb-1`}>
        {value}
      </div>
      <div className={`text-xs text-${color}-700`}>
        {label}
      </div>
    </div>
  </Card>
);

/**
 * Quality progress section component
 */
const QualityProgress = ({ errorPercentage }) => (
  <div className="quality-progress-section">
    <div className="mb-2">
      <h4 className="text-lg font-semibold text-black m-0">
        Qualidade Geral
      </h4>
      <div className="flex gap-3 justify-content-center">
        <span className="text-sm text-green-600">
          Boa: {formatPercentage(100 - errorPercentage)}
        </span>
        <span className="text-sm text-red-600">
          Com Erro: {formatPercentage(errorPercentage)}
        </span>
      </div>
    </div>
    
    <ProgressBar 
      value={100 - errorPercentage} 
      className="quality-progress-bar"
      showValue={false}
    />
    
    <div className="flex justify-content-between mt-1">
      <span className="text-xs text-red-600">Precisa Melhorar</span>
      <span className="text-xs text-orange-600">Regular</span>
      <span className="text-xs text-yellow-600">Bom</span>
      <span className="text-xs text-green-600">Excelente</span>
    </div>
  </div>
);

/**
 * Main summary container component
 * Displays overall analysis metrics and quality assessment
 */
const SummaryContainer = ({ reportData }) => {
  // Calculate metrics
  const getTotalErrorFrames = () => {
    if (!reportData?.analysis_summary) return 0;
    return reportData.analysis_summary.posture_issues + 
           reportData.analysis_summary.overstride_issues + 
           reportData.analysis_summary.visibility_issues;
  };

  const getTotalErrorSeconds = () => {
    if (!reportData?.analysis) return 0;
    return reportData.analysis.reduce((total, issue) => {
      return total + (issue.time_seconds || 0);
    }, 0);
  };

  const getErrorPercentage = () => {
    const totalFrames = reportData?.total_frames || 0;
    const errorFrames = getTotalErrorFrames();
    return totalFrames > 0 ? (errorFrames / totalFrames) * 100 : 0;
  };

  const totalErrorFrames = getTotalErrorFrames();
  const totalErrorSeconds = getTotalErrorSeconds();
  const errorPercentage = getErrorPercentage();

  return (
    <Card className="mb-4 summary-container p-3">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-black mb-2">
          Resumo da Análise
        </h2>
        <p className="text-sm text-black-alpha-70">
          Resultados gerais da análise biomecânica do vídeo
        </p>
      </div>

      {/* Main Metrics Grid */}
      <div className="flex gap-2 flex-wrap justify-content-center mb-2">
        <MetricCard
          value={reportData?.total_frames || 0}
          label="Total de Frames"
          color="blue"
        />
        <MetricCard
          value={reportData?.fps || 0}
          label="FPS"
          color="green"
        />
        <MetricCard
          value={totalErrorFrames}
          label="Frames com Erro"
          color="red"
        />
        <MetricCard
          value={formatTime(totalErrorSeconds)}
          label="Tempo com Erro"
          color="orange"
        />
        <MetricCard
          value={formatPercentage(errorPercentage)}
          label="% com Erro"
          color="purple"
        />
      </div>

      {/* Quality Progress Bar */}
      <QualityProgress errorPercentage={errorPercentage} />
    </Card>
  );
};

export default SummaryContainer;