import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Управление складом</h2>
      </div>
      
      <div className="sidebar-section">
        <h3>Склад</h3>
        <nav>
          <Link 
            to="/balance" 
            className={isActive('/balance') ? 'active' : ''}
          >
            Баланс
          </Link>
          <Link 
            to="/receipts" 
            className={isActive('/receipts') ? 'active' : ''}
          >
            Поступления
          </Link>
          <Link 
            to="/shipments" 
            className={isActive('/shipments') ? 'active' : ''}
          >
            Отгрузки
          </Link>
        </nav>
      </div>
      
      <div className="sidebar-section">
        <h3>Справочники</h3>
        <nav>
          <Link 
            to="/clients" 
            className={isActive('/clients') ? 'active' : ''}
          >
            Клиенты
          </Link>
          <Link 
            to="/resources" 
            className={isActive('/resources') ? 'active' : ''}
          >
            Ресурсы
          </Link>
          <Link 
            to="/measures" 
            className={isActive('/measures') ? 'active' : ''}
          >
            Единицы измерения
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 