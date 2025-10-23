import React from 'react';
import { Card } from 'primereact/card';
import IssueGraph from './IssueGraph';
import ImageCarousel from './ImageCarousel';

/**
 * Utility functions
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

/**
 * Statistics display component
 */
const StatisticsDisplay = ({ frameCount, totalSeconds }) => (
  <div className="flex justify-content-center gap-3">
    <div className="text-center p-3 bg-blue-50 border-round">
      <div className="text-xl font-bold text-blue-600 mb-1">
        {frameCount}
      </div>
      <div className="text-xs text-blue-700">
        Frames com Erro
      </div>
    </div>
    <div className="text-center p-3 bg-orange-50 border-round">
      <div className="text-xl font-bold text-orange-600 mb-1">
        {formatTime(totalSeconds)}
      </div>
      <div className="text-xs text-orange-700">
        Tempo Total Afetado
      </div>
    </div>
  </div>
);


/**
 * Main analysis section component
 * Displays detailed analysis for a specific issue type
 */
const AnalysisSection = ({ 
  title, 
  description, 
  impact, 
  frameCount, 
  totalSeconds, 
  worstFrameImage, 
  successFrameImage,
  worstFrameNumber,
  issueType,
  frameData,
  chartTitle,
  fps
}) => {
  return (
    <Card className="mb-4 analysis-section-card p-3">
      <div className="flex flex-column gap-3">
          <div className="flex justify-content-center">
            <h3 className="text-lg font-semibold text-black m-0">
              {title}
            </h3>
          </div>

        <div className="bg-gray-50 p-3 border-round">
          <p className="text-sm text-black-alpha-80 mb-2">
            <strong>O que é:</strong> {description}
          </p>
          <p className="text-sm text-black-alpha-80 m-0">
            <strong>Impacto:</strong> {impact}
          </p>
        </div>

        {/* Statistics */}
        <StatisticsDisplay 
          frameCount={frameCount} 
          totalSeconds={totalSeconds} 
        />

        {/* Image Carousel - shows both error and success frames */}
        <ImageCarousel
          errorImage={worstFrameImage}
          successImage={successFrameImage}
          errorFrameNumber={worstFrameNumber}
          title={title}
        />

        {/* Interactive Chart */}
        {issueType && frameData && (
          <IssueGraph 
            issueType={issueType}
            data={frameData}
            title={chartTitle}
            fps={fps}
          />
        )}
      </div>
    </Card>
  );
};

export default AnalysisSection;