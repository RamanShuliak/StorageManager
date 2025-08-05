import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientApi } from '../services/api';
import { Client } from '../types';
import './Page.css';

const ClientEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [client, setClient] = useState<Client>({
    id: '',
    name: '',
    address: '',
    isArchived: false
  });
  const [loading, setLoading] = useState(false);

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
      console.error('Error loading client:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isNew) {
        await clientApi.createClient({
          name: client.name,
          address: client.address
        });
      } else {
        await clientApi.updateClient({
          id: client.id,
          name: client.name,
          address: client.address
        });
      }
      navigate('/clients');
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    
    if (window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      try {
        await clientApi.deleteClient(client.id);
        navigate('/clients');
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleArchiveToggle = async () => {
    try {
      if (client.isArchived) {
        await clientApi.unarchiveClient(client.id);
      } else {
        await clientApi.archiveClient(client.id);
      }
      setClient(prev => ({ ...prev, isArchived: !prev.isArchived }));
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };

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
  );
};

export default ClientEditPage; 