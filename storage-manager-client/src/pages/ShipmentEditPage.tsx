import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { shipmentApi, resourceApi, measureApi, clientApi } from '../services/api';
import {
  ShipmentDocument,
  ShipmentResource,
  Resource,
  Measure,
  Client,
  CreateShipmentResourceRequest,
  UpdateShipmentResourceRequest,
  UpdateShipmentDocumentRequest
} from '../types';
import './Page.css';
import { useNotification } from '../components/notifications/NotificationContext';
import { AxiosError } from 'axios';
import { DropdownSelect } from '../components/DropdownSelect';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const ShipmentEditPage: React.FC = () => {
  const { t } = useTranslation('shipmentEdit');

  useFaviconAndTitle(t('title'), '/icons/logo-icon.png');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === undefined;

  const [shipment, setShipment] = useState<ShipmentDocument>({
    id: '',
    number: '',
    shipmentDate: new Date(),
    clientId: '',
    clientName: '',
    isSigned: false,
    resources: []
  });
  const [resources, setResources] = useState<Resource[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [deleteResourceIds, setDeletedResourceIds] = useState<string[]>([]);
  const [originalResources, setOriginalResources] = useState<ShipmentResource[]>([]);
  const createResources: CreateShipmentResourceRequest[] = [];
  const updateResources: UpdateShipmentResourceRequest[] = [];
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateInput, setDateInput] = useState<string>('');

  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setDeletedResourceIds([]);
      const [resourcesResponse, measuresResponse, clientsResponse] = await Promise.all([
        resourceApi.getResources(false),
        measureApi.getMeasures(false),
        clientApi.getClients(false)
      ]);
      setResources(resourcesResponse.data);
      setMeasures(measuresResponse.data);
      setClients(clientsResponse.data);

      if (!isNew && id) {
        const shipmentResp = await shipmentApi.getShipment(id);
        const rawDate = new Date(shipmentResp.data.shipmentDate);
        setShipment({
          ...shipmentResp.data,
          shipmentDate: rawDate
        });
        setOriginalResources(shipmentResp.data.resources);
        setDateInput(rawDate.toISOString().slice(0, 16));
      }
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const handleSave = async () => {
    if (shipment.number === '') {
      addNotification('info', t('notifications.emptyNumber'));
      return;
    }
    if (shipment.clientId === '' || shipment.clientId === undefined) {
      addNotification('info', t('notifications.emptyClient'));
      return;
    }
    setLoading(true);
    try {
      if (isNew) {
        await shipmentApi.createShipment({
          number: shipment.number,
          shipmentDate: shipment.shipmentDate,
          clientId: shipment.clientId,
          resources: shipment.resources.map<CreateShipmentResourceRequest>(r => ({
            resourceId: r.resourceId,
            measureId: r.measureId,
            amount: r.amount
          }))
        });
        addNotification('success', t('notifications.createSuccess', { number: shipment.number }));
      } else {
        const { createResources, updateResources } = buildUpdateArrays();

        const updateReq: UpdateShipmentDocumentRequest = {
          id: shipment.id,
          number: shipment.number,
          shipmentDate: shipment.shipmentDate,
          clientId: shipment.clientId,
          isSigned: shipment.isSigned,
          createResources,
          updateResources,
          deleteResourceIds
        };

        await shipmentApi.updateShipment(updateReq);
        addNotification('success', t('notifications.updateSuccess', { number: shipment.number }));
      }
      navigate('/shipments');
    } catch (error) {
      await handleServerExceptions(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;

    if (window.confirm(t('confirm.delete') as string)) {
      try {
        await shipmentApi.deleteShipment(shipment.id);
        addNotification('success', t('notifications.deleteSuccess', { number: shipment.number }));
        navigate('/shipments');
      } catch (error) {
        await handleServerExceptions(error);
      }
    }
  };

  const buildUpdateArrays = () => {
    shipment.resources.forEach(r => {
      if (r.id.startsWith('temp-')) {
        createResources.push({
          resourceId: r.resourceId,
          measureId: r.measureId,
          amount: r.amount
        });
      } else {
        const orig = originalResources.find(o => o.id === r.id);
        const changed =
          orig &&
          (orig.resourceId !== r.resourceId ||
            orig.measureId !== r.measureId ||
            orig.amount !== r.amount);

        if (changed) {
          updateResources.push({
            id: r.id,
            resourceId: r.resourceId,
            measureId: r.measureId,
            amount: r.amount
          });
        }
      }
    });

    return { createResources, updateResources };
  };

  const addResource = () => {
    const tempId = `temp-${Date.now()}`;
    const newResource: ShipmentResource = {
      id: tempId,
      resourceId: resources[0]?.id || '',
      resourceName: resources[0]?.name || '',
      measureId: measures[0]?.id || '',
      measureName: measures[0]?.name || '',
      amount: 0
    };
    setShipment(prev => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }));
  };

  const removeResource = (index: number) => {
    setShipment(prev => {
      const toRemove = prev.resources[index];
      if (!toRemove.id.startsWith('temp-')) {
        setDeletedResourceIds(prevIds => (prevIds.includes(toRemove.id) ? prevIds : [...prevIds, toRemove.id]));
      }
      return {
        ...prev,
        resources: prev.resources.filter((_, i) => i !== index)
      };
    });
  };

  const updateResource = (index: number, field: keyof ShipmentResource, value: any) => {
    setShipment(prev => {
      const updatedResources = [...prev.resources];
      const resource = { ...updatedResources[index] };

      if (field === 'resourceId') {
        const selectedResource = resources.find(r => r.id === value);
        resource.resourceId = value;
        resource.resourceName = selectedResource?.name || '';
      } else if (field === 'measureId') {
        const selectedMeasure = measures.find(m => m.id === value);
        resource.measureId = value;
        resource.measureName = selectedMeasure?.name || '';
      } else {
        (resource as any)[field] = value;
      }

      updatedResources[index] = resource;
      return { ...prev, resources: updatedResources };
    });
  };

  const updateClient = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setShipment(prev => ({
      ...prev,
      clientId,
      clientName: selectedClient?.name || ''
    }));
  };

  const handleServerExceptions = async (err: unknown) => {
    const error = err as AxiosError;

    if (error.response?.status === 409) {
      const payload = error.response.data as {
        paramValue: string;
        message: string;
      };
      addNotification('warning', t('errors.conflictNumber', { paramValue: payload.paramValue }));
    }

    if (error.response?.status === 404) {
      const payload = error.response.data as {
        entityType: string;
        paramName: string;
        paramValue: string;
        message: string;
      };

      if (payload.entityType === 'ShipmentResource') {
        addNotification(
          'warning',
          t('errors.notFound.shipmentResource', { paramName: payload.paramName, paramValue: payload.paramValue })
        );
      }
      if (payload.entityType === 'ShipmentDocument') {
        addNotification('warning', t('errors.notFound.shipmentDocument', { number: shipment.number }));
      }
      if (payload.entityType === 'Measure') {
        const measureName = measures.find(m => m.id === payload.paramValue)?.name;
        addNotification('warning', t('errors.notFound.measureByName', { measureName }));
      }
      if (payload.entityType === 'Resource') {
        const resourceName = resources.find(r => r.id === payload.paramValue)?.name;
        addNotification('warning', t('errors.notFound.resourceByName', { resourceName }));
      }
      if (payload.entityType === 'Client') {
        const clientName = clients.find(c => c.id === payload.paramValue)?.name;
        addNotification('warning', t('errors.notFound.clientByName', { clientName }));
      }
    }

    if (error.response?.status === 410) {
      const payload = error.response.data as {
        resourceId: string;
        measureId: string;
        message: string;
      };
      const measureName = measures.find(m => m.id === payload.measureId)?.name;
      const resourceName = resources.find(r => r.id === payload.resourceId)?.name;
      addNotification('warning', t('errors.balanceNotFound', { resourceName, measureName }));
    }

    if (error.response?.status === 422) {
      const payload = error.response.data as {
        resourceId: string;
        measureId: string;
        message: string;
      };
      const measureName = measures.find(m => m.id === payload.measureId)?.name;
      const resourceName = resources.find(r => r.id === payload.resourceId)?.name;
      addNotification('warning', t('errors.insufficient', { resourceName, measureName }));
    }

    if (error.response?.status === 412) {
      const payload = error.response.data as {
        documentNumber: string;
        message: string;
      };
      addNotification('warning', t('errors.noResources', { documentNumber: payload.documentNumber }));
    }

    if (error.response?.status === 400) {
      addNotification('warning', t('errors.badRequest'));
    }

    if (error.response?.status === 500) {
      const payload = error.response.data as { message: string };
      addNotification('error', t('errors.serverError'));
      console.error(payload.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>{t('title')}</h1>
      </div>

      <div className="form-container">
        <div className="form-actions">
          <button className="btn btn-success" onClick={handleSave} disabled={loading}>
            {t('buttons.save')}
          </button>
          {!isNew && (
            <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
              {t('buttons.delete')}
            </button>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('labels.number')}</label>
            <input
              type="text"
              value={shipment.number}
              onChange={e => setShipment(prev => ({ ...prev, number: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>{t('labels.dateTime')}</label>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={e => {
                const localStr = e.target.value;
                setDateInput(localStr);
                setShipment(prev => ({
                  ...prev,
                  shipmentDate: new Date(localStr)
                }));
              }}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('labels.client')}</label>
            <DropdownSelect
              placeholder={t('placeholders.selectClient')}
              options={clients}
              value={shipment.clientId}
              onChange={val => updateClient(val)}
              className="ds-wide"
            />
          </div>

          {!isNew && (
            <div className="form-group">
              <label>{t('labels.status')}</label>
              <DropdownSelect
                placeholder={t('placeholders.selectStatus')}
                options={[
                  { id: 'false', name: t('status.unsigned') },
                  { id: 'true', name: t('status.signed') }
                ]}
                value={String(shipment.isSigned)}
                onChange={val =>
                  setShipment(prev => ({
                    ...prev,
                    isSigned: val === 'true'
                  }))
                }
                className="ds-wide"
              />
            </div>
          )}
        </div>

        <div className="resource-table">
          <h3>{t('section.resources')}</h3>
          <table>
            <thead>
              <tr>
                <th className="action-cell">
                  <button className="action-btn add-btn" onClick={addResource}>
                    +
                  </button>
                </th>
                <th>{t('table.resource')}</th>
                <th>{t('table.measure')}</th>
                <th>{t('table.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {shipment.resources.map((resource, index) => (
                <tr key={resource.id}>
                  <td className="action-cell">
                    <button className="action-btn delete-btn" onClick={() => removeResource(index)}>
                      ×
                    </button>
                  </td>
                  <td>
                    <DropdownSelect
                      placeholder={t('placeholders.selectResource')}
                      options={resources}
                      value={resource.resourceId}
                      onChange={val => updateResource(index, 'resourceId', val)}
                    />
                  </td>
                  <td>
                    <DropdownSelect
                      placeholder={t('placeholders.selectMeasure')}
                      options={measures}
                      value={resource.measureId}
                      onChange={val => updateResource(index, 'measureId', val)}
                    />
                  </td>
                  <td>
                    <input
                      className="unset-border"
                      type="number"
                      value={resource.amount}
                      onChange={e => updateResource(index, 'amount', Number(e.target.value))}
                      min="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShipmentEditPage;
