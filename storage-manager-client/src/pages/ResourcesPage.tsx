import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resourceApi } from '../services/api';
import { Resource } from '../types';
import DataTable from '../components/DataTable';
import './Page.css';
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const ResourcesPage: React.FC = () => {
  const { t } = useTranslation('resourcesPage');

  useFaviconAndTitle(t('title'), '/icons/logo-icon.png');
  const navigate = useNavigate();
  const location = useLocation();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const isArchived = location.pathname.includes('/archive');

  const { addNotification } = useNotification();

  useEffect(() => {
    loadResources();
  }, [isArchived]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const response = await resourceApi.getResources(isArchived);
      setResources(response.data);
    } catch (error) {
      await handleServerExceptions(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (resource: Resource) => {
    navigate(`/resources/${resource.id}`);
  };

  const handleAddClick = () => {
    navigate('/resources/new');
  };

  const handleArchiveClick = () => {
    navigate(isArchived ? '/resources' : '/resources/archive');
  };

  const handleServerExceptions = async (err: unknown) => {
    const error = err as AxiosError;
    if (error.response?.status === 400) {
      addNotification("warning", t('errors.badRequest'));
    }
    if (error.response?.status === 500) {
      const payload = error.response.data as { message: string };
      addNotification("error", t('errors.serverError'));
      console.error(payload.message);
    }
  };

  const columns = [
    { key: 'name', header: t('columns.name') }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('title')}</h1>
      </div>

      <div className="page-actions">
        {!isArchived && (
          <button className="btn btn-success" onClick={handleAddClick}>
            {t('buttons.add')}
          </button>
        )}
        <button className="btn btn-warning" onClick={handleArchiveClick}>
          {isArchived ? t('buttons.toActive') : t('buttons.archive')}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t('loading')}</div>
      ) : (
        <DataTable
          columns={columns}
          data={resources}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default ResourcesPage;
