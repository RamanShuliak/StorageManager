import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { shipmentApi, resourceApi, measureApi, clientApi } from '../services/api';
import { ShipmentDocument, Resource, Measure, Client } from '../types';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import './Page.css';
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const ShipmentsPage: React.FC = () => {
  const { t } = useTranslation('shipments');

  useFaviconAndTitle(t('title'), '/icons/logo-icon.png');
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<ShipmentDocument[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotification();

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [resourcesResponse, measuresResponse, clientsResponse, numbersResponse] = await Promise.all([
        resourceApi.getResources(false),
        measureApi.getMeasures(false),
        clientApi.getClients(false),
        shipmentApi.getShipmentNumbers()
      ]);

      setResources(resourcesResponse.data);
      setMeasures(measuresResponse.data);
      setClients(clientsResponse.data);
      setNumbers(numbersResponse.data);
      
      await loadShipments();
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const loadShipments = async () => {
    setLoading(true);
    try {
      const filters = {
        resourceIds: selectedResources.length > 0 ? selectedResources : undefined,
        measureIds: selectedMeasures.length > 0 ? selectedMeasures : undefined,
        clientIds: selectedClients.length > 0 ? selectedClients : undefined,
        numbers: selectedNumbers.length > 0 ? selectedNumbers : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const response = await shipmentApi.getShipments(filters);
      setShipments(response.data || []);
    } catch (error) {
      await handleServerExceptions(error);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const tableData = shipments?.flatMap(shipment =>
    shipment.resources?.map(resource => ({
      number: shipment.number,
      shipmentDate: new Date(shipment.shipmentDate).toLocaleDateString('en-GB', { timeZone: 'UTC' }),
      clientName: shipment.clientName,
      isSigned: shipment.isSigned ? t('status.signed') : t('status.unsigned'),
      resourceName: resource.resourceName,
      measureName: resource.measureName,
      amount: resource.amount,
      shipmentId: shipment.id,
      resourceId: resource.id,
    })) || []
  ) || [];

  const handleRowClick = (item: any) => {
    navigate(`/shipments/${item.shipmentId}`);
  };

  const handleAddClick = () => {
    navigate('/shipments/new');
  };

  const handleServerExceptions = async (err: unknown) => {
    const error = err as AxiosError;
    if (error.response?.status === 400) {
      addNotification("warning", t('errors.badRequest'));
    }
    if (error.response?.status === 500) {
      const payload = error.response.data as { message: string };
      addNotification("error", t('errors.serverError'));
      console.error(payload.message);
    }
  };

  const columns = [
    { key: 'number', header: t('columns.number') },
    { key: 'shipmentDate', header: t('columns.date') },
    { key: 'clientName', header: t('columns.client') },
    { key: 'isSigned', header: t('columns.status') },
    { key: 'resourceName', header: t('columns.resource') },
    { key: 'measureName', header: t('columns.measure') },
    { key: 'amount', header: t('columns.amount') },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('title')}</h1>
      </div>

      <FilterPanel
        resources={resources}
        measures={measures}
        clients={clients}
        numbers={numbers}
        selectedResources={selectedResources}
        selectedMeasures={selectedMeasures}
        selectedClients={selectedClients}
        selectedNumbers={selectedNumbers}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onResourceChange={setSelectedResources}
        onMeasureChange={setSelectedMeasures}
        onClientChange={setSelectedClients}
        onNumberChange={setSelectedNumbers}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onSearch={loadShipments}
        showClientFilter={true}
        showNumberFilter={true}
        showDateFilters={true}
      />

      <div className="page-actions">
        <button className="btn btn-success" onClick={handleAddClick}>
          {t('buttons.add')}
        </button>
      </div>

      {loading ? (
        <div className="loading">{t('loading')}</div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default ShipmentsPage;
