import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resourceApi } from '../services/api';
import { Resource } from '../types';
import DataTable from '../components/DataTable';
import './Page.css';

const ResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const isArchived = location.pathname.includes('/archive');

  useEffect(() => {
    loadResources();
  }, [isArchived]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const response = await resourceApi.getResources(isArchived);
      setResources(response.data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Наименование' },
  ];

  const handleRowClick = (resource: Resource) => {
    navigate(`/resources/${resource.id}`);
  };

  const handleAddClick = () => {
    navigate('/resources/new');
  };

  const handleArchiveClick = () => {
    if (isArchived) {
      navigate('/resources');
    } else {
      navigate('/resources/archive');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Ресурсы</h1>
      </div>

      <div className="page-actions">
        {!isArchived && (
          <button className="btn btn-success" onClick={handleAddClick}>
            Добавить
          </button>
        )}
        <button className="btn btn-warning" onClick={handleArchiveClick}>
          {isArchived ? 'К рабочим' : 'Архив'}
        </button>
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
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