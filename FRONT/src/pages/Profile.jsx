import { useAuth } from '../contexts/AuthContext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import profile from '../assets/profile.png'
import 'primeicons/primeicons.css';
import '../styles/profile-page.css'

const Profile = () => {
  const { user, logout } = useAuth();

  const scoreHistory = [
    { score: 80, color: 'green' },
    { score: 60, color: 'orange' },
    { score: 40, color: 'red' }
  ];

  const features = [
    { icon: 'pi pi-check-square', title: 'Análise'},
    { icon: 'pi pi-trophy', title: 'Performance' },
    { icon: 'pi pi-chart-line', title: 'Métricas' }
  ];

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
          <h1 className="text-2xl font-bold text-black mb-2">{user.name}</h1>
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

        {/* Score History */}
        <h2 className="text-xl font-bold text-black mb-4 text-center">Histórico de Testes</h2>
        <div className="mb-4">
          {scoreHistory.map((item, index) => (
            <Card key={index} className="mb-3 bg-gray-100 border-round">
              <div className="flex justify-content-between align-items-center">
                <div className="flex align-items-center">
                  <span className="text-black-alpha-70">Pontuação</span>
                  <i className="pi pi-eye text-black ml-2"></i>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold text-${item.color}-600`}>{item.score}%</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
    </div>
  );
};

export default Profile;
