import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clientApi } from '../services/api';
import { Client } from '../types';
import './Page.css';
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const ClientEditPage: React.FC = () => {
  const { t } = useTranslation('clientEdit');

  useFaviconAndTitle(t('title'), '/icons/logo-icon.png');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === undefined;

  const [client, setClient] = useState<Client>({
    id: '',
    name: '',
    address: '',
    isArchived: false
  });
  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotification();

  useEffect(() => {
    if (!isNew) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      const response = await clientApi.getClient(id!);
      setClient(response.data);
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const handleSave = async () => {
    if (client.name === '') {
      addNotification("info", t('messages.emptyName'));
      return;
    }
    setLoading(true);
    try {
      if (isNew) {
        await clientApi.createClient({ name: client.name, address: client.address });
        addNotification("success", t('messages.created', { name: client.name }));
      } else {
        await clientApi.updateClient({
          id: client.id,
          name: client.name,
          address: client.address
        });
        addNotification("success", t('messages.updated', { name: client.name }));
      }
      navigate('/clients');
    } catch (error) {
      await handleServerExceptions(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (window.confirm(t('confirmDelete') as string)) {
      try {
        await clientApi.deleteClient(client.id);
        addNotification("success", t('messages.deleted', { name: client.name }));
        navigate('/clients');
      } catch (error) {
        await handleServerExceptions(error);
      }
    }
  };

  const handleArchiveToggle = async () => {
    try {
      if (client.isArchived) {
        await clientApi.unarchiveClient(client.id);
        addNotification("info", t('messages.unarchived', { name: client.name }));
      } else {
        await clientApi.archiveClient(client.id);
        addNotification("info", t('messages.archived', { name: client.name }));
      }
      setClient(prev => ({ ...prev, isArchived: !prev.isArchived }));
      navigate('/clients');
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const handleServerExceptions = async (err: unknown) => {
    const error = err as AxiosError;
    if (error.response?.status === 409) {
      const payload = error.response.data as { paramValue: string; message: string; };
      addNotification("warning", t('errors.exists', { name: payload.paramValue }));
    }
    if (error.response?.status === 404) {
      addNotification("warning", t('errors.notFound', { name: client.name }));
    }
    if (error.response?.status === 423) {
      addNotification("warning", t('errors.locked'));
    }
    if (error.response?.status === 400) {
      addNotification("warning", t('errors.badRequest'));
    }
    if (error.response?.status === 500) {
      const payload = error.response.data as { message: string };
      addNotification("error", t('errors.serverError'));
      console.error(payload.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('title')}</h1>
      </div>

      <div className="form-container">
        <div className="form-actions">
          <button className="btn btn-success" onClick={handleSave} disabled={loading}>
            {t('buttons.save')}
          </button>
          {!isNew && (
            <>
              <button className="btn btn-warning" onClick={handleArchiveToggle} disabled={loading}>
                {client.isArchived ? t('buttons.toWork') : t('buttons.toArchive')}
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                {t('buttons.delete')}
              </button>
            </>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('form.name')}</label>
            <input
              type="text"
              value={client.name}
              onChange={(e) => setClient(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>{t('form.address')}</label>
            <input
              type="text"
              value={client.address}
              onChange={(e) => setClient(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientEditPage;
