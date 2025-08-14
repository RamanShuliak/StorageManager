import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { balanceApi, resourceApi, measureApi } from '../services/api';
import { Balance, Resource, Measure } from '../types';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import './Page.css';
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const BalancePage: React.FC = () => {
  const { t } = useTranslation('balance');

  useFaviconAndTitle(t('title'), '/icons/logo-icon.png');

  const [balances, setBalances] = useState<Balance[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotification();

  useEffect(() => {
    loadFilters();
    loadBalances();
  }, []);

  const loadFilters = async () => {
    try {
      const [resourcesResponse, measuresResponse] = await Promise.all([
        resourceApi.getResources(false),
        measureApi.getMeasures(false)
      ]);
      setResources(resourcesResponse.data);
      setMeasures(measuresResponse.data);
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const loadBalances = async () => {
    setLoading(true);
    try {
      const filters = {
        resourceIds: selectedResources.length > 0 ? selectedResources : undefined,
        measureIds: selectedMeasures.length > 0 ? selectedMeasures : undefined,
      };
      const response = await balanceApi.getBalances(filters);
      setBalances(response.data);
    } catch (error) {
      await handleServerExceptions(error);
    } finally {
      setLoading(false);
    }
  };

  const handleServerExceptions = async (err: unknown) => {
    const error = err as AxiosError;

    if (error.response?.status === 404){
      const payload = error.response.data as {
        entityType: string;
        paramName: string;
        paramValue: string;
        message: string;
      };
      if(payload.entityType === "Measure"){
        const measureName = measures.find(m => m.id === payload.paramValue)?.name;
        addNotification("warning", t('errors.measureNotFound', { name: measureName }));
      }
      if(payload.entityType === "Resource"){
        const resourceName = resources.find(r => r.id === payload.paramValue)?.name;
        addNotification("warning", t('errors.resourceNotFound', { name: resourceName }));
      }
    }
    if (error.response?.status === 400){
      addNotification("warning", t('errors.badRequest'));
    }
    if (error.response?.status === 500){
      const payload = error.response.data as { message: string };
      addNotification("error", t('errors.serverError'));
      console.error(payload.message);
    }
  };

  const columns = [
    { key: 'resourceName', header: t('columns.resourceName') },
    { key: 'measureName', header: t('columns.measureName') },
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
        selectedResources={selectedResources}
        selectedMeasures={selectedMeasures}
        selectedClients={selectedClients}
        selectedNumbers={selectedNumbers}
        dateFrom=""
        dateTo=""
        onResourceChange={setSelectedResources}
        onMeasureChange={setSelectedMeasures}
        onClientChange={setSelectedClients}
        onNumberChange={setSelectedNumbers}
        onDateFromChange={() => {}}
        onDateToChange={() => {}}
        onSearch={loadBalances}
      />

      {loading ? (
        <div className="loading">{t('loading')}</div>
      ) : (
        <DataTable
          columns={columns}
          data={balances}
        />
      )}
    </div>
  );
};

export default BalancePage;
