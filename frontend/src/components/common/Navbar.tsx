import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useLanguage } from '../../contexts/LanguageContext.tsx';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!user) return null; // Hide on login/register pages

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-xl text-primary"
          >
            ☰
          </button>
        )}
        <Link to="/dashboard" className="text-xl font-bold text-primary">
          {t('app.title')}
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-700 hidden sm:block">{t('welcome')} {user.username}</span>
        <button 
          onClick={handleLogout} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          {t('logout')}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
