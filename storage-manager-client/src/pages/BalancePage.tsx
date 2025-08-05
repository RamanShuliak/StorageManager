import React, { useState, useEffect } from 'react';
import { balanceApi, resourceApi, measureApi } from '../services/api';
import { Balance, Resource, Measure } from '../types';
import FilterPanel from '../components/FilterPanel';
import DataTable from '../components/DataTable';
import './Page.css';

const BalancePage: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
      console.error('Error loading filters:', error);
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
      console.error('Error loading balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'resourceName', header: 'Ресурс' },
    { key: 'measureName', header: 'Единица измерения' },
    { key: 'amount', header: 'Количество' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Баланс</h1>
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
        <div className="loading">Загрузка...</div>
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