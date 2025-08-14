import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { receiptApi, resourceApi, measureApi } from '../services/api';
import { ReceiptDocument, Resource, Measure } from '../types';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import './Page.css';
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const ReceiptsPage: React.FC = () => {
  const { t } = useTranslation('receipts');

  useFaviconAndTitle(t('title'), '/icons/logo-icon.png');
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

  const { addNotification } = useNotification();
  
  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [resourcesResponse, measuresResponse, numbersResponse] = await Promise.all([
        resourceApi.getResources(false),
        measureApi.getMeasures(false),
        receiptApi.getReceiptNumbers()
      ]);
      setResources(resourcesResponse.data);
      setMeasures(measuresResponse.data);
      setNumbers(numbersResponse.data);
      
      await loadReceipts();
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const loadReceipts = async () => {
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
      setReceipts(response.data || []);
    } catch (error) {
      await handleServerExceptions(error);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const tableData = receipts.flatMap(receipt => {
    const common = {
      number: receipt.number,
      receiptDate: new Date(receipt.receiptDate)
        .toLocaleDateString('en-GB', { timeZone: 'UTC' }),
      receiptId: receipt.id
    };
  
    if (receipt.resources && receipt.resources.length > 0) {
      return receipt.resources.map(resource => ({
        ...common,
        resourceName: resource.resourceName,
        measureName: resource.measureName,
        amount: resource.amount,
        resourceId: resource.id
      }));
    }
  
    return [{
      ...common,
      resourceName: '-',
      measureName: '-',
      amount: 0,
      resourceId: ''
    }];
  });

  const handleRowClick = (item: any) => {
    navigate(`/receipts/${item.receiptId}`);
  };

  const handleAddClick = () => {
    navigate('/receipts/new');
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
    { key: 'receiptDate', header: t('columns.date') },
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

export default ReceiptsPage;
