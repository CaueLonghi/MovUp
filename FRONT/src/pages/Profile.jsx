import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import profile from '../assets/profile.jpg'
import 'primeicons/primeicons.css';
import '../styles/profile-page.css'
import { API_CONFIG } from '../config/constants';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [analises, setAnalises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const features = [
    { icon: 'pi pi-check-square', title: 'Análise'},
    { icon: 'pi pi-trophy', title: 'Performance' },
    { icon: 'pi pi-chart-line', title: 'Métricas' }
  ];

  // Buscar análises do usuário
  useEffect(() => {
    const fetchAnalises = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.saveReport}/${user.id}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar análises');
        }

        const data = await response.json();
        // Backend já retorna ordenado por createdAt (mais recente primeiro)
        setAnalises(data || []);
      } catch (err) {
        console.error('Erro ao buscar análises:', err);
        setError('Erro ao carregar análises');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalises();
  }, [user?.id]);

  // Calcular segundos com erro e porcentagem
  const calculateAnalysisStats = (analysisData) => {
    if (!analysisData?.analysis_summary) {
      return { secondsWithError: 0, errorPercentage: 0 };
    }
 
    const summary = analysisData.analysis_summary;
    const totalErrorFrames = (summary.posture_issues || 0) + 
                            (summary.overstride_issues || 0) + 
                            (summary.visibility_issues || 0);
    const fps = analysisData.fps || 1;
    const secondsWithError = totalErrorFrames / fps;
    const totalFrames = analysisData.total_frames || 1;
    const errorPercentage = (totalErrorFrames / totalFrames) * 100;

    return {
      secondsWithError: secondsWithError.toFixed(1),
      errorPercentage: errorPercentage.toFixed(1)
    };
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data não disponível';
    }
  };

  // Navegar para página de análise
  const handleAnalysisClick = (analise) => {
    if (analise.data) {
      localStorage.setItem('postureReport', JSON.stringify(analise.data));
      navigate('/report', { state: { reportData: analise.data } });
    }
  };

  if (!user) {
    return (
      <div className="page-container">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-3">Por favor, faça login para ver seu perfil</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

        {/* User Profile */}
        <div className="text-center mb-4">
          <div className='avatar-border'>
            <Avatar 
              image={profile} 
              size="xlarge" 
              shape="circle"
              style={{ width: '120px', height: '120px' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">{user.nome || 'Usuário'}</h1>
          <Button 
            label="Sair" 
            icon="pi pi-sign-out"
            className="p-button-outlined p-button-secondary p-1 text-black gap-1"
            onClick={logout}
          />
        </div>

        {/* Feature Grid com Containers Amarelos - Galeria */}
        <div className="gallery-grid">
          {features.map((feature, index) => (
            <div key={index} className="icon-container">
              <i className={`${feature.icon} text-black`}></i>
              <h3 className="text-black">{feature.title}</h3>
            </div>
          ))}
        </div>

        {/* Análises History */}
        <h2 className="text-xl font-bold text-black mb-4 text-center">Histórico de Análises</h2>
        <div className="mb-4">
          {loading ? (
            <div className="text-center py-4">
              <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="4" />
              <p className="text-black-alpha-70 mt-2">Carregando análises...</p>
            </div>
          ) : error ? (
            <Card className="mb-3 bg-yellow-400 border-round p-3">
              <p className="text-black text-center">{error}</p>
            </Card>
          ) : analises.length === 0 ? (
            <Card className="mb-3 bg-yellow-400 border-round p-3">
              <p className="text-black text-center">Nenhuma análise encontrada</p>
            </Card>
          ) : (
            analises.map((analise) => {
              const stats = calculateAnalysisStats(analise.data);
              // Usar a data de criação retornada pela API
              const analysisDate = analise.createdAt;
              
              return (
                <Card
                  key={analise.id}
                  className="mb-3 bg-yellow-400 border-round cursor-pointer"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onClick={() => handleAnalysisClick(analise)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex justify-content-between align-items-center p-2">
                    <div className="flex flex-column">
                      <div className="text-lg font-bold text-black mb-1">
                        Análise - {formatDate(analysisDate)}
                      </div>
                      <div className="text-sm text-black-alpha-70">
                        {stats.secondsWithError}s com erro - {stats.errorPercentage}% de erro
                      </div>
                    </div>
                    <i className="pi pi-arrow-right text-black" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                </Card>
              );
            })
          )}
        </div>
    </div>
  );
};

export default Profile;
