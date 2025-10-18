import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import movup_logo from '../assets/movup_logo.png';
import poster from '../assets/poster.jpeg';
import 'primeicons/primeicons.css';

const Home = () => {
  const features = [
    { icon: 'pi pi-check-square', title: 'Análise'},
    { icon: 'pi pi-trophy', title: 'Performance'},
    { icon: 'pi pi-chart-line', title: 'Métricas'},
    { icon: 'pi pi-camera', title: 'Gravação'},
    { icon: 'pi pi-users', title: 'Comunidade' },
    { icon: 'pi pi-star', title: 'Avaliações'}
  ];

  return (
    <div className="page-container">

        {/* Feature Grid com Containers Amarelos - Galeria */}
        <div className="gallery-grid">
          {features.map((feature, index) => (
            <div key={index} className="icon-container">
              <i className={`${feature.icon} text-black`}></i>
              <h3 className="text-black">{feature.title}</h3>
            </div>
          ))}
        </div>

        {/* História do movUP */}
        <Card className="mb-4 bg-yellow-100 border-round-lg p-3">
          <div className="text-left">
            <h2 className="text-lg font-bold text-black mb-3">História do movUP</h2>
            <p className="text-black-alpha-80 line-height-3 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <br />
            <p className="text-black-alpha-80 line-height-3 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <div className="text-center mt-3">
              <img src={poster} alt="" className='image-poster' />
            </div>
          </div>
        </Card>
    </div>
  );
};

export default Home;
