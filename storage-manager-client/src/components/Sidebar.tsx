import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n, { type SupportedLng } from '../i18n';
import { DropdownSelect } from '../components/DropdownSelect';
import './Sidebar.css';

import ruFlag from '../locales/icons/ru.svg';
import enFlag from '../locales/icons/en.svg';

const languages: { code: SupportedLng; label: string; flag: string }[] = [
  { code: 'RU', label: 'Русский', flag: ruFlag },
  { code: 'EN', label: 'English', flag: enFlag }
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const changeLanguage = (lng: SupportedLng) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    localStorage.setItem('lng', lng);
  };

  const currentLng: SupportedLng = languages.some(l => l.code === (i18n.language as SupportedLng))
    ? (i18n.language as SupportedLng)
    : 'RU';

    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>{t('header')}</h2>
        </div>
        
        <div className="sidebar-section">
          <h3>{t('sections.warehouse')}</h3>
          <nav>
            <Link to="/balance" className={isActive('/balance') ? 'active' : ''}>
              {t('links.balance')}
            </Link>
            <Link to="/receipts" className={isActive('/receipts') ? 'active' : ''}>
              {t('links.receipts')}
            </Link>
            <Link to="/shipments" className={isActive('/shipments') ? 'active' : ''}>
              {t('links.shipments')}
            </Link>
          </nav>
        </div>
        
        <div className="sidebar-section">
          <h3>{t('sections.directories')}</h3>
          <nav>
            <Link to="/clients" className={isActive('/clients') ? 'active' : ''}>
              {t('links.clients')}
            </Link>
            <Link to="/resources" className={isActive('/resources') ? 'active' : ''}>
              {t('links.resources')}
            </Link>
            <Link to="/measures" className={isActive('/measures') ? 'active' : ''}>
              {t('links.measures')}
            </Link>
          </nav>
        </div>
  
        <div className="sidebar-section sidebar-language">
          <h3>{t('sections.language')}</h3>
          <div className="language-select">
            <span className="flag" aria-hidden="true">
              <img 
                src={languages.find(l => l.code === currentLng)?.flag} 
                alt="" 
              />
            </span>
            <select
              value={currentLng}
              onChange={(e) => changeLanguage(e.target.value as SupportedLng)}
              aria-label={t('sections.language').toString()}
            >
              {languages.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
};

export default Sidebar; 