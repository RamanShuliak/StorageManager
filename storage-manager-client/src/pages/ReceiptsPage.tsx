import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { receiptApi, resourceApi, measureApi } from '../services/api';
import { ReceiptDocument, Resource, Measure } from '../types';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import './Page.css';

const ReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<ReceiptDocument[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('ReceiptsPage useEffect triggered');
    loadFilters();
  }, []);

  const loadFilters = async () => {
    console.log('Loading filters...');
    try {
      const [resourcesResponse, measuresResponse, numbersResponse] = await Promise.all([
        resourceApi.getResources(false),
        measureApi.getMeasures(false),
        receiptApi.getReceiptNumbers()
      ]);
      console.log('Filters loaded:', { 
        resources: resourcesResponse.data, 
        measures: measuresResponse.data,
        numbers: numbersResponse.data });
      setResources(resourcesResponse.data);
      setMeasures(measuresResponse.data);
      setNumbers(numbersResponse.data);
      
      // Load initial receipts after filters are loaded
      await loadReceipts();
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadReceipts = async () => {
    console.log('Loading receipts with filters:', {
      selectedResources,
      selectedMeasures,
      selectedNumbers,
      dateFrom,
      dateTo
    });
    
    setLoading(true);
    try {
      const filters = {
        resourceIds: selectedResources.length > 0 ? selectedResources : undefined,
        measureIds: selectedMeasures.length > 0 ? selectedMeasures : undefined,
        numbers: selectedNumbers.length > 0 ? selectedNumbers : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const response = await receiptApi.getReceipts(filters);
      console.log('Receipts API response:', response);
      console.log('Receipts data:', response.data);
      setReceipts(response.data || []);
    } catch (error) {
      console.error('Error loading receipts:', error);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  // Flatten receipts data for table display with safety checks
  const tableData = receipts?.flatMap(receipt => {
    console.log('Processing receipt:', receipt);
    console.log('Receipt resources:', receipt.resources);
    
    return receipt.resources?.map(resource => ({
      number: receipt.number,
      receiptDate: new Date(receipt.receiptDate).toLocaleDateString('en-GB', { timeZone: 'UTC' }),
      resourceName: resource.resourceName,
      measureName: resource.measureName,
      amount: resource.amount,
      receiptId: receipt.id,
      resourceId: resource.id,
    })) || [];
  }) || [];

  console.log('Final tableData:', tableData);

  const columns = [
    { key: 'number', header: 'Номер' },
    { key: 'receiptDate', header: 'Дата' },
    { key: 'resourceName', header: 'Ресурс' },
    { key: 'measureName', header: 'Единица измерения' },
    { key: 'amount', header: 'Количество' },
  ];

  const handleRowClick = (item: any) => {
    navigate(`/receipts/${item.receiptId}`);
  };

  const handleAddClick = () => {
    navigate('/receipts/new');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Поступления</h1>
      </div>

      <FilterPanel
        resources={resources}
        measures={measures}
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
        onSearch={loadReceipts}
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

export default ReceiptsPage; 