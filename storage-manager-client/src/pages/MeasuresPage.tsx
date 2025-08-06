import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { measureApi } from '../services/api';
import { Measure } from '../types';
import DataTable from '../components/DataTable';
import './Page.css';
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const MeasuresPage: React.FC = () => {
  useFaviconAndTitle('Единицы измерения', '/icons/logo-icon.png');
  const navigate = useNavigate();
  const location = useLocation();
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [loading, setLoading] = useState(false);
  const isArchived = location.pathname.includes('/archive');

  const { addNotification } = useNotification();

  useEffect(() => {
    loadMeasures();
  }, [isArchived]);

  const loadMeasures = async () => {
    setLoading(true);
    try {
      const response = await measureApi.getMeasures(isArchived);
      setMeasures(response.data);
    } catch (error) {
      await handleServerExceptions(error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleServerExceptions = async (err: unknown) => {
    const error = err as AxiosError;
    if (error.response?.status === 400){
      addNotification(
        "warning",
        `Некорректный запрос к серверу. Обратитесь в техподдержку`
      );
    }
    if (error.response?.status === 500){
      const payload = error.response.data as {
        message: string;
      };
      addNotification(
        "error",
        `Произошла ошибка на сервере. Повторите попытку позже или обратитесь в техподдержку`
      );
      console.error(payload.message);
    }
  }

  const columns = [
    { key: 'name', header: 'Наименование' },
  ];

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