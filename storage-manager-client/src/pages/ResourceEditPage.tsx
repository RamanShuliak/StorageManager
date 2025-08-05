import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resourceApi } from '../services/api';
import { Resource } from '../types';
import './Page.css';

const ResourceEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [resource, setResource] = useState<Resource>({
    id: '',
    name: '',
    isArchived: false
  });
  const [loading, setLoading] = useState(false);

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
      console.error('Error loading resource:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isNew) {
        await resourceApi.createResource({
          name: resource.name
        });
      } else {
        await resourceApi.updateResource({
          id: resource.id,
          name: resource.name
        });
      }
      navigate('/resources');
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    
    if (window.confirm('Вы уверены, что хотите удалить этот ресурс?')) {
      try {
        await resourceApi.deleteResource(resource.id);
        navigate('/resources');
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const handleArchiveToggle = async () => {
    try {
      if (resource.isArchived) {
        await resourceApi.unarchiveResource(resource.id);
      } else {
        await resourceApi.archiveResource(resource.id);
      }
      setResource(prev => ({ ...prev, isArchived: !prev.isArchived }));
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Ресурс</h1>
      </div>

      <div className="form-container">
        <div className="form-actions">
          <button className="btn btn-success" onClick={handleSave} disabled={loading}>
            Сохранить
          </button>
          {!isNew && (
            <>
              <button className="btn btn-warning" onClick={handleArchiveToggle} disabled={loading}>
                {resource.isArchived ? 'В работу' : 'В архив'}
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                Удалить
              </button>
            </>
          )}
        </div>

        <div className="form-group">
          <label>Наименование</label>
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