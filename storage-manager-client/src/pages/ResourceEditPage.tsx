import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resourceApi } from '../services/api';
import { Resource } from '../types';
import './Page.css';
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const ResourceEditPage: React.FC = () => {
  const { t } = useTranslation('resourceEdit');

  useFaviconAndTitle(t('title'), '/icons/logo-icon.png');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === undefined;
  
  const [resource, setResource] = useState<Resource>({
    id: '',
    name: '',
    isArchived: false
  });
  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotification();

  useEffect(() => {
    if (!isNew) {
      loadResource();
    }
  }, [id]);

  const loadResource = async () => {
    try {
      const response = await resourceApi.getResource(id!);
      setResource(response.data);
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const handleSave = async () => {
    if (resource.name.trim() === '') {
      addNotification("info", t('messages.emptyName'));
      return;
    }
    setLoading(true);
    try {
      if (isNew) {
        await resourceApi.createResource({ name: resource.name });
        addNotification("success", t('messages.created', { name: resource.name }));
      } else {
        await resourceApi.updateResource({ id: resource.id, name: resource.name });
        addNotification("success", t('messages.updated', { name: resource.name }));
      }
      navigate('/resources');
    } catch (error) {
      await handleServerExceptions(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (window.confirm(t('messages.confirmDelete') as string)) {
      try {
        await resourceApi.deleteResource(resource.id);
        addNotification("success", t('messages.deleted', { name: resource.name }));
        navigate('/resources');
      } catch (error) {
        await handleServerExceptions(error);
      }
    }
  };

  const handleArchiveToggle = async () => {
    try {
      if (resource.isArchived) {
        await resourceApi.unarchiveResource(resource.id);
        addNotification("info", t('messages.unarchived', { name: resource.name }));
      } else {
        await resourceApi.archiveResource(resource.id);
        addNotification("info", t('messages.archived', { name: resource.name }));
      }
      setResource(prev => ({ ...prev, isArchived: !prev.isArchived }));
      navigate('/resources');
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const handleServerExceptions = async (err: unknown) => {
    const error = err as AxiosError;
    if (error.response?.status === 409) {
      const payload = error.response.data as { paramValue: string };
      addNotification("warning", t('messages.exists', { name: payload.paramValue }));
    }
    if (error.response?.status === 404) {
      addNotification("warning", t('messages.notFound', { name: resource.name }));
    }
    if (error.response?.status === 423) {
      addNotification("warning", t('messages.inUse'));
    }
    if (error.response?.status === 400) {
      addNotification("warning", t('messages.badRequest'));
    }
    if (error.response?.status === 500) {
      const payload = error.response.data as { message: string };
      addNotification("error", t('messages.serverError'));
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
                {resource.isArchived ? t('buttons.unarchive') : t('buttons.archive')}
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                {t('buttons.delete')}
              </button>
            </>
          )}
        </div>

        <div className="form-group">
          <label>{t('labels.name')}</label>
          <input
            type="text"
            value={resource.name}
            onChange={(e) => setResource(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
};

export default ResourceEditPage;
