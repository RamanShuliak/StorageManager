import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clientApi } from '../services/api';
import { Client } from '../types';
import DataTable from '../components/DataTable';
import './Page.css';
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const ClientsPage: React.FC = () => {
  const { t } = useTranslation('clients');

  useFaviconAndTitle(t('title'), '/icons/logo-icon.png');
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const isArchived = location.pathname.includes('/archive');

  const { addNotification } = useNotification();

  useEffect(() => {
    loadClients();
  }, [isArchived]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await clientApi.getClients(isArchived);
      setClients(response.data);
    } catch (error) {
      await handleServerExceptions(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleAddClick = () => {
    navigate('/clients/new');
  };

  const handleArchiveClick = () => {
    if (isArchived) {
      navigate('/clients');
    } else {
      navigate('/clients/archive');
    }
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
    { key: 'name', header: t('columns.name') },
    { key: 'address', header: t('columns.address') },
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
          data={clients}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default ClientsPage;
