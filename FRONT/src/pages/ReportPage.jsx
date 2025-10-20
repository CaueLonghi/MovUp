import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import 'primeicons/primeicons.css';
import '../styles/record-page.css';
import '../styles/report-page.css';

// Import custom components
import SummaryContainer from '../components/SummaryContainer';
import AnalysisSection from '../components/AnalysisSection';
import ExportOptions from '../components/ExportOptions';
import useReportData from '../hooks/useReportData';

/**
 * Loading screen component
 */
const LoadingScreen = () => (
  <div className="min-h-screen bg-yellow-400 flex align-items-center justify-content-center">
    <div className="text-center">
      <ProgressSpinner 
        style={{ width: '50px', height: '50px' }} 
        strokeWidth="5"
      />
      <h2 className="text-xl font-bold text-black mt-3">Carregando relatório...</h2>
      <p className="text-black-alpha-80 mt-2">Processando dados da análise</p>
    </div>
  </div>
);

/**
 * Error screen component
 */
const ErrorScreen = ({ error, onBack }) => (
  <div className="min-h-screen bg-yellow-400 flex align-items-center justify-content-center">
    <div className="text-center max-w-md">
      <div className="text-red-600 text-6xl mb-3">⚠️</div>
      <h2 className="text-xl font-bold text-black mb-3">Erro ao carregar relatório</h2>
      <Message 
        severity="error" 
        text={error}
        className="mb-3"
      />
      <Button 
        label="Voltar" 
        onClick={onBack}
        className="p-button-outlined"
      />
    </div>
  </div>
);

/**
 * No data screen component
 */
const NoDataScreen = ({ onBack }) => (
  <div className="min-h-screen bg-yellow-400 flex align-items-center justify-content-center">
    <div className="text-center">
      <div className="text-gray-600 text-6xl mb-3">📄</div>
      <h2 className="text-xl font-bold text-black mb-3">Nenhum relatório encontrado</h2>
      <p className="text-black-alpha-70 mb-4">
        Não foi possível encontrar dados de análise para exibir.
      </p>
      <Button 
        label="Voltar" 
        onClick={onBack}
        className="p-button-outlined"
      />
    </div>
  </div>
);

/**
 * Success screen component (no errors detected)
 */
const SuccessScreen = () => (
  <Card className="mb-4">
    <div className="text-center py-6">
      <div className="text-green-600 text-6xl mb-3">🎉</div>
      <h3 className="text-xl font-semibold text-green-600 mb-2">
        Excelente Performance!
      </h3>
      <p className="text-black-alpha-70 mb-3">
        Nenhum problema biomecânico significativo foi detectado durante sua corrida.
      </p>
      <p className="text-sm text-black-alpha-60">
        Continue mantendo essa boa técnica de corrida!
      </p>
    </div>
  </Card>
);

/**
 * Analysis sections component
 */
const AnalysisSections = ({ analysisSections }) => (
  <div className="mb-4">
    <div className="text-center mb-4">
      <h2 className="text-xl font-semibold text-black mb-2">
        Análise Detalhada por Tipo de Problema
      </h2>
      <p className="text-sm text-black-alpha-70">
        Detalhes específicos dos problemas detectados durante a análise
      </p>
    </div>
    
    {analysisSections.map((section, index) => (
      <AnalysisSection
        key={`${section.issueType}-${index}`}
        title={section.title}
        description={section.description}
        impact={section.impact}
        frameCount={section.frameCount}
        totalSeconds={section.totalSeconds}
        worstFrameImage={section.worstFrameImage}
        worstFrameNumber={section.worstFrameNumber}
        worstFrameSeverity={section.worstFrameSeverity}
        worstFrameDescription={section.worstFrameDescription}
        issueType={section.issueType}
        severity={section.severity}
      />
    ))}
  </div>
);

/**
 * Action buttons component
 */
const ActionButtons = ({ onNewAnalysis, onBack }) => (
  <div className="flex justify-content-center gap-3 mt-4">
    <Button
      label="Nova Análise"
      icon="pi pi-refresh"
      className="p-button-raised p-button-primary p-2 gap-1"
      onClick={onNewAnalysis}
    />
    <Button
      label="Voltar"
      icon="pi pi-arrow-left"
      className="p-button-outlined p-2 gap-1"
      onClick={onBack}
    />
  </div>
);

/**
 * Main Report page component
 */
const ReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rawReportData, setRawReportData] = useState(null);

  // Use custom hook for data processing
  const { 
    processedData, 
    analysisSections, 
    loading, 
    error, 
    hasErrors
  } = useReportData(rawReportData);

  /**
   * Loads report data from location state or localStorage
   */
  const loadReportData = useCallback(() => {
    const locationData = location.state?.reportData;
    const localStorageData = JSON.parse(localStorage.getItem('postureReport') || 'null');
    const data = locationData || localStorageData;
    
    if (data && data !== 'null') {
      setRawReportData(data);
    } else {
      navigate('/video');
    }
  }, [location.state, navigate]);

  /**
   * Handles navigation back to video page
   */
  const handleBackToVideo = useCallback(() => {
    navigate('/video');
  }, [navigate]);

  /**
   * Handles new analysis navigation
   */
  const handleNewAnalysis = useCallback(() => {
    navigate('/video');
  }, [navigate]);

  // Load data on component mount
  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Error state
  if (error) {
    return <ErrorScreen error={error} onBack={handleBackToVideo} />;
  }

  // No data state
  if (!processedData) {
    return <NoDataScreen onBack={handleBackToVideo} />;
  }

  return (
    <div className="page-container">
      <div className="flex justify-content-between align-items-center mb-4">
        <Button
          icon="pi pi-arrow-left"
          className="p-button-text p-button-rounded"
          onClick={handleBackToVideo}
          tooltip="Voltar"
        />
        <h1 className="text-xl font-bold text-black">Relatório de Análise Biomecânica</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      <SummaryContainer reportData={processedData} />

      {hasErrors ? (
        <AnalysisSections analysisSections={analysisSections} />
      ) : (
        <SuccessScreen />
      )}

      <ExportOptions reportData={processedData} />

      <ActionButtons 
        onNewAnalysis={handleNewAnalysis}
        onBack={handleBackToVideo}
      />
    </div>
  );
};

export default ReportPage;