import React, { useState, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { API_CONFIG } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';


/**
 * PDF content generator
 * @param {Object} data - Report data
 * @param {Array} analysisSections - Analysis sections with images and charts
 */
const generatePDFContent = (data, analysisSections = []) => {
  const issueTypeNames = {
    posture: 'Problemas de Postura',
    overstride: 'Problemas de Overstride',
    visibility: 'Problemas de Visibilidade'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Relatório de Análise - MovUp</title>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.6;
          color: #333;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding-bottom: 20px;
          border-bottom: 3px solid #4A90E2;
        }
        .header h1 { 
          color: #4A90E2; 
          margin-bottom: 5px;
        }
        .summary { 
          margin-bottom: 40px; 
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .metrics-container {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
        }
        .metric { 
          margin: 10px; 
          text-align: center;
          min-width: 120px;
        }
        .metric-value { 
          font-size: 32px; 
          font-weight: bold; 
          color: #4A90E2;
        }
        .metric-label { 
          font-size: 13px; 
          color: #666; 
          margin-top: 5px;
        }
        .analysis-section { 
          margin-bottom: 40px; 
          page-break-inside: avoid;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
        }
        .analysis-section h2 {
          color: #2c3e50;
          border-bottom: 2px solid #4A90E2;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .description-box {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .description-box p {
          margin: 10px 0;
        }
        .stats-container {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
        }
        .stat-box {
          text-align: center;
          padding: 15px;
          background-color: #e3f2fd;
          border-radius: 5px;
          min-width: 150px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1976d2;
        }
        .stat-label {
          font-size: 12px;
          color: #555;
          margin-top: 5px;
        }
        .images-section {
          margin: 30px 0;
          text-align: center;
        }
        .image-container {
          display: inline-block;
          margin: 10px;
          vertical-align: top;
        }
        .image-container img {
          max-width: 400px;
          height: auto;
          border: 2px solid #ddd;
          border-radius: 5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .image-caption {
          font-size: 14px;
          font-weight: bold;
          margin-top: 10px;
          color: #555;
        }
        .chart-placeholder {
          background-color: #f0f0f0;
          padding: 30px;
          border-radius: 5px;
          text-align: center;
          margin: 20px 0;
          color: #666;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #ddd;
          text-align: center;
          color: #888;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Análise Biomecânica</h1>
        <p><strong>MovUp - Análise de Corrida</strong></p>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      </div>
      
      <div class="summary">
        <h2 style="text-align: center; margin-top: 0;">Resumo Geral</h2>
        <div class="metrics-container">
          <div class="metric">
            <div class="metric-value">${data?.summary?.total_frames || data?.total_frames || 0}</div>
            <div class="metric-label">Total de Frames</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data?.summary?.fps || data?.fps || 0}</div>
            <div class="metric-label">FPS</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data?.summary?.posture_issues_count || 0}</div>
            <div class="metric-label">Problemas de Postura</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data?.summary?.overstride_issues_count || 0}</div>
            <div class="metric-label">Problemas de Overstride</div>
          </div>
        </div>
      </div>
      
      ${analysisSections.map(section => `
        <div class="analysis-section">
          <h2>${section.title}</h2>
          
          <div class="description-box">
            <p><strong>O que é:</strong> ${section.description}</p>
            <p><strong>Impacto:</strong> ${section.impact}</p>
          </div>
          
          <div class="stats-container">
            <div class="stat-box">
              <div class="stat-value">${section.frameCount}</div>
              <div class="stat-label">Frames com Erro</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${section.totalSeconds?.toFixed(1)}s</div>
              <div class="stat-label">Tempo Total Afetado</div>
            </div>
          </div>
          
          ${section.worstFrameImage || section.successFrameImage ? `
            <div class="images-section">
              <h3 style="text-align: center;">Comparação de Frames</h3>
              ${section.worstFrameImage ? `
                <div class="image-container">
                  <img src="${section.worstFrameImage}" alt="Frame com Erro" />
                  <div class="image-caption">Frame com Erro ${section.worstFrameNumber ? `(#${section.worstFrameNumber})` : ''}</div>
                </div>
              ` : ''}
              ${section.successFrameImage ? `
                <div class="image-container">
                  <img src="${section.successFrameImage}" alt="Frame de Sucesso" />
                  <div class="image-caption">Frame de Sucesso</div>
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          <div class="chart-placeholder">
            <p><strong>📊 Gráfico de ${section.issueType === 'posture' ? 'Ângulo da Postura por Segundo' : 'Detecção de Overstride'}</strong></p>
            <p style="font-size: 12px; margin-top: 10px;">
              ${section.issueType === 'posture' 
                ? 'Mostra a média do ângulo da postura ao longo do tempo' 
                : 'Mostra os momentos de contato com o solo onde overstride foi detectado'}
            </p>
            <p style="font-size: 11px; color: #999; margin-top: 10px;">
              Visualize o gráfico interativo na versão online do relatório
            </p>
          </div>
        </div>
      `).join('')}
      
      <div class="footer">
        <p><strong>MovUp</strong> - Sistema de Análise Biomecânica de Corrida</p>
        <p>Este relatório foi gerado automaticamente. Para mais informações, acesse a plataforma MovUp.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Export options component
 * Handles PDF generation and JSON saving
 */
const ExportOptions = ({ reportData, analysisSections = [] }) => {
  const { user } = useAuth();
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
      const htmlContent = generatePDFContent(reportData, analysisSections);
      
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
  }, [reportData, analysisSections]);

  /**
   * Handles JSON save to backend
   */
  const handleJSONSave = useCallback(async () => {
    if (!user?.id) {
      setExportMessage({
        severity: 'error',
        text: 'Usuário não autenticado. Faça login para salvar análises.'
      });
      return;
    }

    setIsSavingJSON(true);
    setExportMessage(null);
    console.log(user.id)
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.saveReport}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: reportData,
          userId: user.id
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
  }, [reportData, user]);

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
          label="Salvar Análise"
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