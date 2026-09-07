import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/ERPHomepage');
  };

  return (
    <header className="h-16 bg-[#DFD0B8] border-b border-[#393E46] flex items-center justify-between px-10 shrink-0 shadow-sm z-10">
      <h1 className="text-lg font-bold text-[#222831] tracking-wide uppercase">
        Patel Industries
      </h1>

      <div className="flex items-center gap-6">
        {user && (
          <div className="flex items-center gap-2 text-[#393E46]">
            <FaUserCircle size={22} className="text-[#948979]" />
            <span className="text-sm font-bold">{user.name}</span>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#ebe2cd] text-[#222831] border border-[#393E46] hover:bg-[#393E46] hover:text-[#ebe2cd] transition-colors shadow-sm"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
