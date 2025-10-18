import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: 'pi pi-home', label: 'Home' },
    { path: '/video', icon: 'pi pi-video', label: 'Video' },
    { path: '/profile', icon: 'pi pi-user', label: 'Profile' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-yellow-400 nav-main" >
      <div className="flex justify-content-around align-items-center">
        {navItems.map((item) => (
          <Button
            key={item.path}
            icon={item.icon}
            className={`p-button-text p-button-rounded ${
              isActive(item.path) ? 'text-black font-bold' : 'text-black-alpha-70'
            }`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            style={{
              fontSize: isActive(item.path) ? '1.8rem' : '1.5rem',
              fontWeight: isActive(item.path) ? 'bold' : 'normal',
              transition: 'all 0.2s ease',
              minWidth: '40px',
              height: '60px'
            }}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
