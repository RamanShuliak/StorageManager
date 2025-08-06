import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../services/api';
import { Client } from '../types';
import './Page.css';
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const ClientEditPage: React.FC = () => {
  useFaviconAndTitle('Клиент', '/icons/logo-icon.png');
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
    if(client.name === ''){
      addNotification(
        "info",
        `Имя клиента не может быть пустым`
      );
      return;
    }
    setLoading(true);
    try {
      if (isNew) {
        await clientApi.createClient({
          name: client.name,
          address: client.address
        });
        addNotification(
          "success",
          `Клиент с именем "${client.name}" успешно создан`
        );
      } else {
        await clientApi.updateClient({
          id: client.id,
          name: client.name,
          address: client.address
        });
        addNotification(
          "success",
          `Клиент с именем "${client.name}" успешно изменён`
        );
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
    
    if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      try {
        await clientApi.deleteClient(client.id);
        addNotification(
          "success",
          `Клиент с именем "${client.name}" успешно удалён`
        );
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
        addNotification(
          "info",
          `Клиент с именем "${client.name}" успешно разархивирован`
        );
      } else {
        await clientApi.archiveClient(client.id);
        addNotification(
          "info",
          `Клиент с именем "${client.name}" успешно архивирован`
        );
      }
      setClient(prev => ({ ...prev, isArchived: !prev.isArchived }));
      navigate('/clients');
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
        `Клиент с именем "${payload.paramValue}" уже существует`
      );
    }
    if (error.response?.status === 404){
      const payload = error.response.data as {
        message: string;
      };
      addNotification(
        "warning",
        `Клиент с именем "${client.name}" не найден`
      );
      console.warn(payload.message);
    }
    if (error.response?.status === 423){
      addNotification(
        "warning",
        `Невозможно удалить используемого клиента из системы`
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
        <h1>Клиент</h1>
      </div>

      <div className="form-container">
        <div className="form-actions">
          <button className="btn btn-success" onClick={handleSave} disabled={loading}>
            Сохранить
          </button>
          {!isNew && (
            <>
              <button className="btn btn-warning" onClick={handleArchiveToggle} disabled={loading}>
                {client.isArchived ? 'В работу' : 'В архив'}
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                Удалить
              </button>
            </>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Наименование</label>
            <input
              type="text"
              value={client.name}
              onChange={(e) => setClient(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Адрес</label>
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