import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null; // Hide on login/register pages

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/dashboard" className="text-xl font-bold text-primary">
        Trello Clone
      </Link>
      <div className="flex items-center space-x-4">
        <span className="text-gray-700 hidden sm:block">Welcome, {user.username}</span>
        <button 
          onClick={handleLogout} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
