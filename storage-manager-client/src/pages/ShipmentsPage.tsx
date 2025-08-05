import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentApi, resourceApi, measureApi, clientApi } from '../services/api';
import { ShipmentDocument, Resource, Measure, Client } from '../types';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import './Page.css';

const ShipmentsPage: React.FC = () => {
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

  useEffect(() => {
    console.log('ShipmentsPage useEffect triggered');
    loadFilters();
  }, []);

  const loadFilters = async () => {
    console.log('Loading filters...');
    try {
      const [resourcesResponse, measuresResponse, clientsResponse, numbersResponse] = await Promise.all([
        resourceApi.getResources(false),
        measureApi.getMeasures(false),
        clientApi.getClients(false),
        shipmentApi.getShipmentNumbers()
      ]);
      console.log('Filters loaded:', { 
        resources: resourcesResponse.data, 
        measures: measuresResponse.data,
        clients: clientsResponse.data,
        numbers: numbersResponse.data 
      });
      setResources(resourcesResponse.data);
      setMeasures(measuresResponse.data);
      setClients(clientsResponse.data);
      setNumbers(numbersResponse.data);
      
      await loadShipments();
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadShipments = async () => {
    console.log('Loading shipments with filters:', {
      selectedResources,
      selectedMeasures,
      selectedClients,
      selectedNumbers,
      dateFrom,
      dateTo
    });
    
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
      console.log('Shipments API response:', response);
      console.log('Shipments data:', response.data);
      setShipments(response.data || []);
    } catch (error) {
      console.error('Error loading shipments:', error);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  // Flatten shipments data for table display with safety checks
  const tableData = shipments?.flatMap(shipment => {
    console.log('Processing shipment:', shipment);
    console.log('Shipment resources:', shipment.resources);
    
    return shipment.resources?.map(resource => ({
      number: shipment.number,
      shipmentDate: new Date(shipment.shipmentDate).toLocaleDateString('en-GB', { timeZone: 'UTC' }),
      clientName: shipment.clientName,
      isSigned: shipment.isSigned ? 'подписан' : 'не подписан',
      resourceName: resource.resourceName,
      measureName: resource.measureName,
      amount: resource.amount,
      shipmentId: shipment.id,
      resourceId: resource.id,
    })) || [];
  }) || [];

  console.log('Final tableData:', tableData);

  const columns = [
    { key: 'number', header: 'Номер' },
    { key: 'shipmentDate', header: 'Дата' },
    { key: 'clientName', header: 'Клиент' },
    { key: 'isSigned', header: 'Статус' },
    { key: 'resourceName', header: 'Ресурс' },
    { key: 'measureName', header: 'Единица измерения' },
    { key: 'amount', header: 'Количество' },
  ];

  const handleRowClick = (item: any) => {
    navigate(`/shipments/${item.shipmentId}`);
  };

  const handleAddClick = () => {
    navigate('/shipments/new');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Отгрузки</h1>
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
          Добавить
        </button>
      </div>

      {loading ? (
        <div className="loading">Загрузка...</div>
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