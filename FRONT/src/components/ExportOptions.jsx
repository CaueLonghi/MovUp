import React, { useState, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

// API Configuration
const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000',
  endpoints: {
    saveReport: '/api/save_report'
  }
};

/**
 * PDF content generator
 */
const generatePDFContent = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relatório de Análise - MovUp</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px; text-align: center; }
        .analysis-section { margin-bottom: 20px; page-break-inside: avoid; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .metric-label { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Análise Biomecânica</h1>
        <p>MovUp - Análise de Corrida</p>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      </div>
      
      <div class="summary">
        <h2>Resumo Geral</h2>
        <div class="metric">
          <div class="metric-value">${data?.total_frames || 0}</div>
          <div class="metric-label">Total de Frames</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data?.fps || 0}</div>
          <div class="metric-label">FPS</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data?.analysis_summary?.posture_issues || 0}</div>
          <div class="metric-label">Problemas de Postura</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data?.analysis_summary?.overstride_issues || 0}</div>
          <div class="metric-label">Problemas de Overstride</div>
        </div>
      </div>
      
      ${data?.analysis?.map(issue => `
        <div class="analysis-section">
          <h3>Frame ${issue.frame} - ${issue.issue_type}</h3>
          <p><strong>Problema:</strong> ${issue.issue}</p>
          <p><strong>Tempo:</strong> ${issue.time_seconds?.toFixed(2)}s</p>
        </div>
      `).join('') || ''}
    </body>
    </html>
  `;
};

/**
 * Export options component
 * Handles PDF generation and JSON saving
 */
const ExportOptions = ({ reportData }) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isSavingJSON, setIsSavingJSON] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);

  /**
   * Handles PDF export
   */
  const handlePDFExport = useCallback(async () => {
    setIsExportingPDF(true);
    setExportMessage(null);

    try {
      const printWindow = window.open('', '_blank');
      const htmlContent = generatePDFContent(reportData);
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setExportMessage({
          severity: 'success',
          text: 'PDF gerado com sucesso!'
        });
      }, 1000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setExportMessage({
        severity: 'error',
        text: 'Erro ao gerar PDF. Tente novamente.'
      });
    } finally {
      setIsExportingPDF(false);
    }
  }, [reportData]);

  /**
   * Handles JSON save to backend
   */
  const handleJSONSave = useCallback(async () => {
    setIsSavingJSON(true);
    setExportMessage(null);

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.saveReport}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_data: reportData,
          timestamp: new Date().toISOString(),
          user_id: 'current_user'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setExportMessage({
        severity: 'success',
        text: `Relatório salvo com sucesso! ID: ${result.report_id}`
      });

    } catch (error) {
      console.error('Error saving JSON:', error);
      setExportMessage({
        severity: 'error',
        text: 'Erro ao salvar relatório. Verifique a conexão com o servidor.'
      });
    } finally {
      setIsSavingJSON(false);
    }
  }, [reportData]);

  /**
   * Clears export message
   */
  const clearMessage = useCallback(() => {
    setExportMessage(null);
  }, []);

  return (
    <Card className="export-options-card p-3">
      <div className="text-center mb-3">
        <h3 className="text-lg font-semibold text-black mb-2">
          Opções de Exportação
        </h3>
        <p className="text-sm text-black-alpha-70">
          Salve ou compartilhe seu relatório de análise
        </p>
      </div>

      {/* Export Message */}
      {exportMessage && (
        <div className="mb-3">
          <Message 
            severity={exportMessage.severity} 
            text={exportMessage.text}
            className="w-full"
            onClose={clearMessage}
          />
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex flex-wrap justify-content-center gap-2">
        <Button
          label="Exportar para PDF"
          icon="pi pi-file-pdf"
          className="p-button-raised p-button-danger p-2 gap-1 no-wrap-text"
          onClick={handlePDFExport}
          disabled={isExportingPDF || isSavingJSON}
          loading={isExportingPDF}
        />
        
        <Button
          label="Salvar JSON"
          icon="pi pi-save"
          className="p-button-raised p-button-primary p-2 gap-1"
          onClick={handleJSONSave}
          disabled={isExportingPDF || isSavingJSON}
          loading={isSavingJSON}
        />
      </div>

      {/* Loading States */}
      {(isExportingPDF || isSavingJSON) && (
        <div className="text-center mt-3">
          <ProgressSpinner 
            style={{ width: '30px', height: '30px' }} 
            strokeWidth="4"
          />
          <p className="text-sm text-black-alpha-70 mt-2">
            {isExportingPDF ? 'Gerando PDF...' : 'Salvando relatório...'}
          </p>
        </div>
      )}
    </Card>
  );
};

export default ExportOptions;