import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { measureApi } from '../services/api';
import { Measure } from '../types';
import DataTable from '../components/DataTable';
import './Page.css';

const MeasuresPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [loading, setLoading] = useState(false);
  const isArchived = location.pathname.includes('/archive');

  useEffect(() => {
    loadMeasures();
  }, [isArchived]);

  const loadMeasures = async () => {
    setLoading(true);
    try {
      const response = await measureApi.getMeasures(isArchived);
      setMeasures(response.data);
    } catch (error) {
      console.error('Error loading measures:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Наименование' },
  ];

  const handleRowClick = (measure: Measure) => {
    navigate(`/measures/${measure.id}`);
  };

  const handleAddClick = () => {
    navigate('/measures/new');
  };

  const handleArchiveClick = () => {
    if (isArchived) {
      navigate('/measures');
    } else {
      navigate('/measures/archive');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Единицы измерения</h1>
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
          data={measures}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default MeasuresPage; 