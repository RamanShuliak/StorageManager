import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentApi, resourceApi, measureApi, clientApi } from '../services/api';
import { 
  ShipmentDocument, 
  ShipmentResource, 
  Resource, 
  Measure, 
  Client,
  CreateShipmentResourceRequest,
  UpdateShipmentResourceRequest,
  UpdateShipmentDocumentRequest} from '../types';
import './Page.css';

const ShipmentEditPage: React.FC = () => {
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
      console.error('Error loading data:', error);
    }
  };

  const handleSave = async () => {
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
      }
      navigate('/shipments');
    } catch (error) {
      console.error('Error saving shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    
    if (window.confirm('Вы уверены, что хотите удалить эту отгрузку?')) {
      try {
        await shipmentApi.deleteShipment(shipment.id);
        navigate('/shipments');
      } catch (error) {
        console.error('Error deleting shipment:', error);
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
           orig.measureId   !== r.measureId   ||
           orig.amount      !== r.amount);
  
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
      id: tempId, // Temporary ID
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
        setDeletedResourceIds(prevIds =>
          prevIds.includes(toRemove.id)
            ? prevIds
            : [...prevIds, toRemove.id]
        );
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

  return (
    <div className="page">
      <div className="page-header">
        <h1>Отгрузка</h1>
      </div>

      <div className="form-container">
        <div className="form-actions">
          <button className="btn btn-success" onClick={handleSave} disabled={loading}>
            Сохранить
          </button>
          {!isNew && (
            <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
              Удалить
            </button>
          )}
        </div>

        <div className="form-group">
          <label>Номер</label>
          <input
            type="text"
            value={shipment.number}
            onChange={(e) => setShipment(prev => ({ ...prev, number: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label>Дата и время</label>
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

        <div className="form-group">
          <label>Клиент</label>
          <select
            value={shipment.clientId}
            onChange={(e) => updateClient(e.target.value)}
          >
            <option value="">Выберите клиента</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {isNew
          ? null
          : (
            <div className="form-group">
              <label>Статус</label>
              <select
                value={shipment.isSigned ? 'true' : 'false'}
                onChange={(e) => setShipment(prev => ({ ...prev, isSigned: e.target.value === 'true' }))}
              >
                <option value="false">не подписан</option>
                <option value="true">подписан</option>
              </select>
            </div>
          )
        }

        <div className="resource-table">
          <h3>Ресурсы</h3>
          <table>
            <thead>
              <tr>
                <th className="action-cell">
                  <button className="action-btn add-btn" onClick={addResource}>+</button>
                </th>
                <th>Ресурс</th>
                <th>Единица измерения</th>
                <th>Количество</th>
              </tr>
            </thead>
            <tbody>
              {shipment.resources.map((resource, index) => (
                <tr key={resource.id}>
                  <td className="action-cell">
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => removeResource(index)}
                    >
                      ×
                    </button>
                  </td>
                  <td>
                    <select
                      value={resource.resourceId}
                      onChange={(e) => updateResource(index, 'resourceId', e.target.value)}
                    >
                      {resources.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={resource.measureId}
                      onChange={(e) => updateResource(index, 'measureId', e.target.value)}
                    >
                      {measures.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={resource.amount}
                      onChange={(e) => updateResource(index, 'amount', Number(e.target.value))}
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