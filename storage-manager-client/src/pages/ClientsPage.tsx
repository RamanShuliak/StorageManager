import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clientApi } from '../services/api';
import { Client } from '../types';
import DataTable from '../components/DataTable';
import './Page.css';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const isArchived = location.pathname.includes('/archive');

  useEffect(() => {
    loadClients();
  }, [isArchived]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await clientApi.getClients(isArchived);
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Наименование' },
    { key: 'address', header: 'Адрес' },
  ];

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

  const handleArchiveToggle = async (client: Client) => {
    try {
      if (client.isArchived) {
        await clientApi.unarchiveClient(client.id);
      } else {
        await clientApi.archiveClient(client.id);
      }
      loadClients();
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Клиенты</h1>
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
          data={clients}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default ClientsPage; 