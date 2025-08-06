import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { measureApi } from '../services/api';
import { Measure } from '../types';
import './Page.css';
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const MeasureEditPage: React.FC = () => {
  useFaviconAndTitle('Единица измерения', '/icons/logo-icon.png');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === undefined;
  
  const [measure, setMeasure] = useState<Measure>({
    id: '',
    name: '',
    isArchived: false
  });
  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotification();

  useEffect(() => {
    if (!isNew) {
      loadMeasure();
    }
  }, [id]);

  const loadMeasure = async () => {
    try {
      const response = await measureApi.getMeasure(id!);
      setMeasure(response.data);
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const handleSave = async () => {
    if(measure.name === ''){
      addNotification(
        "info",
        `Имя единицы измерения не может быть пустым`
      );
      return;
    }
    setLoading(true);
    try {
      if (isNew) {
        await measureApi.createMeasure({
          name: measure.name
        });
        addNotification(
          "success",
          `Единица измерения с именем "${measure.name}" успешно создана`
        );
      } else {
        await measureApi.updateMeasure({
          id: measure.id,
          name: measure.name
        });
        addNotification(
          "success",
          `Единица измерения с именем "${measure.name}" успешно изменена`
        );
      }
      navigate('/measures');
    } catch (error) {
      await handleServerExceptions(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту единицу измерения?')) {
      try {
        await measureApi.deleteMeasure(measure.id);
        addNotification(
          "success",
          `Единица измерения с именем "${measure.name}" успешно удалена`
        );
        navigate('/measures');
      } catch (error) {
        await handleServerExceptions(error);
      }
    }
  };

  const handleArchiveToggle = async () => {
    try {
      if (measure.isArchived) {
        await measureApi.unarchiveMeasure(measure.id);
        addNotification(
          "info",
          `Единица измерения с именем "${measure.name}" разархивирована`
        );
      } else {
        await measureApi.archiveMeasure(measure.id);
        addNotification(
          "info",
          `Единица измерения с именем "${measure.name}" архивирована`
        );
      }
      setMeasure(prev => ({ ...prev, isArchived: !prev.isArchived }));
      navigate('/measures');
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const handleServerExceptions = async (err: unknown) => {
    const error = err as AxiosError;
    if (error.response?.status === 409){
      const payload = error.response.data as {
        paramValue: string;
        message: string;
      };
      addNotification(
        "warning",
        `Единица измерения с именем "${payload.paramValue}" уже существует`
      );
    }
    if (error.response?.status === 404){
      const payload = error.response.data as {
        message: string;
      };
      addNotification(
        "warning",
        `Единица измерения с именем "${measure.name}" не найдена`
      );
      console.warn(payload.message);
    }
    if (error.response?.status === 423){
      addNotification(
        "warning",
        `Невозможно удалить используемую единицу измерения из системы`
      );
    }
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

  return (
    <div className="page">
      <div className="page-header">
        <h1>Единица измерения</h1>
      </div>

      <div className="form-container">
        <div className="form-actions">
          <button className="btn btn-success" onClick={handleSave} disabled={loading}>
            Сохранить
          </button>
          {!isNew && (
            <>
              <button className="btn btn-warning" onClick={handleArchiveToggle} disabled={loading}>
                {measure.isArchived ? 'В работу' : 'В архив'}
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
            value={measure.name}
            onChange={(e) => setMeasure(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
};

export default MeasureEditPage; 