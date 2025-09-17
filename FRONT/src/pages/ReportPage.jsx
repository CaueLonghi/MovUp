import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import 'primeicons/primeicons.css';
import '../styles/record-page.css';

const ReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get data from location state or localStorage
    const data = location.state?.reportData || JSON.parse(localStorage.getItem('postureReport') || 'null');
    
    if (data) {
      setReportData(data);
    } else {
      // If no data, redirect back to video page
      navigate('/video');
    }
    setLoading(false);
  }, [location.state, navigate]);

  const handleBackToVideo = () => {
    navigate('/video');
  };

  const handleNewAnalysis = () => {
    navigate('/video');
  };

  const getAngleSeverity = (angle) => {
    if (angle < 90) return 'success';
    if (angle < 110) return 'warning';
    return 'danger';
  };

  const getAngleSeverityLabel = (angle) => {
    if (angle < 90) return 'Good';
    if (angle < 110) return 'Fair';
    return 'Poor';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatPercentage = (percentage) => {
    return `${percentage.toFixed(1)}%`;
  };

  const formatDirection = (direction) => {
    const directionMap = {
      'para frente': 'Forward',
      'para trás': 'Backward',
      'para esquerda': 'Left',
      'para direita': 'Right'
    };
    return directionMap[direction] || direction;
  };

  const angleBodyTemplate = (rowData) => {
    const severity = getAngleSeverity(rowData.angle);
    const label = getAngleSeverityLabel(rowData.angle);
    
    return (
      <div className="flex align-items-center gap-2">
        <span className="font-semibold">{rowData.angle.toFixed(1)}°</span>
        <Tag 
          value={label} 
          severity={severity}
          className="text-xs"
        />
      </div>
    );
  };

  const directionBodyTemplate = (rowData) => {
    return (
      <span className="capitalize">
        {formatDirection(rowData.direcao)}
      </span>
    );
  };

  const timeBodyTemplate = (rowData) => {
    return formatTime(rowData.second);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-400 flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="loading-spinner mb-3"></div>
          <h2>Carregando relatório...</h2>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-yellow-400 flex align-items-center justify-content-center">
        <div className="text-center">
          <h2>Nenhum relatório encontrado</h2>
          <Button 
            label="Voltar" 
            onClick={handleBackToVideo}
            className="p-button-outlined mt-3"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex justify-content-between align-items-center mb-4">
        <Button
          icon="pi pi-arrow-left"
          className="p-button-text p-button-rounded"
          onClick={handleBackToVideo}
          tooltip="Voltar"
        />
        <h1 className="text-xl font-bold text-black">Relatório de Postura</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <Card className="summary-card">
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {reportData.total_frames}
            </div>
            <div className="text-sm text-black-alpha-70">
              Total de Frames
            </div>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {reportData.fps}
            </div>
            <div className="text-sm text-black-alpha-70">
              FPS (Quadros por Segundo)
            </div>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {formatTime(reportData.tempo_total_errado_segundos)}
            </div>
            <div className="text-sm text-black-alpha-70">
              Tempo com Postura Incorreta
            </div>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="text-center">
            <div className="text-2xl font-bold text-black mb-1">
              {formatPercentage(reportData.percentual_errado)}
            </div>
            <div className="text-sm text-black-alpha-70">
              % da Corrida com Postura Incorreta
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Visualization */}
      <Card className="mb-4">
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-black mb-2">
            Qualidade da Postura
          </h3>
          <div className="flex align-items-center justify-content-center gap-3 mb-3">
            <div className="text-sm text-black-alpha-70">
              Boa: {formatPercentage(100 - reportData.percentual_errado)}
            </div>
            <div className="text-sm text-red-600">
              Incorreta: {formatPercentage(reportData.percentual_errado)}
            </div>
          </div>
        </div>
        
        <div className="progress-container">
          <ProgressBar 
            value={100 - reportData.percentual_errado} 
            className="posture-progress"
            showValue={false}
          />
          <div className="progress-labels">
            <span className="text-xs text-green-600">Boa Postura</span>
            <span className="text-xs text-red-600">Postura Incorreta</span>
          </div>
        </div>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-black mb-2">
            Análise Detalhada
          </h3>
          <p className="text-sm text-black-alpha-70">
            {reportData.posturas_erradas.length} momentos com postura incorreta detectados
          </p>
        </div>

        {reportData.posturas_erradas.length > 0 ? (
          <div className="table-container">
            <DataTable 
              value={reportData.posturas_erradas}
              paginator 
              rows={10}
              rowsPerPageOptions={[5, 10, 20]}
              className="p-datatable-sm"
              emptyMessage="Nenhuma postura incorreta detectada"
            >
              <Column 
                field="frame" 
                header="Frame" 
                sortable 
                className="text-center"
                style={{ width: '80px' }}
              />
              <Column 
                field="second" 
                header="Tempo" 
                body={timeBodyTemplate}
                sortable 
                className="text-center"
                style={{ width: '100px' }}
              />
              <Column 
                field="angle" 
                header="Ângulo" 
                body={angleBodyTemplate}
                sortable 
                className="text-center"
                style={{ width: '120px' }}
              />
              <Column 
                field="direcao" 
                header="Direção" 
                body={directionBodyTemplate}
                sortable 
                className="text-center"
                style={{ width: '100px' }}
              />
            </DataTable>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-green-600 font-semibold mb-2">
              🎉 Excelente!
            </div>
            <p className="text-black-alpha-70">
              Nenhuma postura incorreta foi detectada durante sua corrida.
            </p>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-content-center gap-3 mt-4">
        <Button
          label="Nova Análise"
          icon="pi pi-refresh"
          className="p-button-raised p-button-primary"
          onClick={handleNewAnalysis}
        />
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          className="p-button-outlined"
          onClick={handleBackToVideo}
        />
      </div>
    </div>
  );
};

export default ReportPage;
