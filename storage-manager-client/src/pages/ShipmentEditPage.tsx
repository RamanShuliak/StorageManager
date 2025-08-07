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
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { DropdownSelect } from '../components/DropdownSelect';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const ShipmentEditPage: React.FC = () => {
  useFaviconAndTitle('Отгрузка', '/icons/logo-icon.png');
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
    if(shipment.number === ''){
      addNotification(
        "info",
        `Номер документа не может быть пустым`
      );
      return;
    }
    if(shipment.clientId === ''
      || shipment.clientId === undefined){
        addNotification(
          "info",
          `Укажите клиента для документа отгрузки`
        );
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
        addNotification(
          "success",
          `Документ отгрузки "${shipment.number}" успешно создан`
        );
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
        addNotification(
          "success",
          `Документ отгрузки "${shipment.number}" успешно изменён`
        );
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
    
    if (window.confirm('Вы уверены, что хотите удалить эту отгрузку?')) {
      try {
        await shipmentApi.deleteShipment(shipment.id);
        addNotification(
          "success",
          `Документ отгрузки "${shipment.number}" успешно удалён`
        );
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

  const handleServerExceptions = async (err: unknown) => {
    const error = err as AxiosError;
    if (error.response?.status === 409){
      const payload = error.response.data as {
        paramValue: string;
        message: string;
      };
      addNotification(
        "warning",
        `Документ отгрузки с номером "${payload.paramValue}" уже существует`
      );
    }
    if (error.response?.status === 404){
      const payload = error.response.data as {
        entityType: string;
        paramName: string;
        paramValue: string;
        message: string;
      };
      if(payload.entityType === "ShipmentResource"){
        addNotification(
          "warning",
          `Русурс отгрузки c "${payload.paramName}" = "${payload.paramValue}" не найден при попытке изменения документа`
        );
      }
      if(payload.entityType === "ShipmentDocument"){
        addNotification(
          "warning",
          `Документ отгрузки с номером "${shipment.number}" не найден`
        );
      }
      if(payload.entityType === "Measure"){
        var measureName = measures.find(m => m.id === payload.paramValue)?.name;
        addNotification(
          "warning",
          `Единица измерения с именем "${measureName}" не найдена`
        );
      }
      if(payload.entityType === "Resource"){
        var resourceName = resources.find(r => r.id === payload.paramValue)?.name;
        addNotification(
          "warning",
          `Ресурс с именем "${resourceName}" не найден`
        );
      }
      if(payload.entityType === "Client"){
        var clientName = clients.find(c => c.id === payload.paramValue)?.name;
        addNotification(
          "warning",
          `Клиент с именем "${clientName}" не найден`
        );
      }
    }
    if (error.response?.status === 410){
      const payload = error.response.data as {
        resourceId: string;
        measureId: string;
        message: string;
      };
      var measureName = measures.find(m => m.id === payload.measureId)?.name;
      var resourceName = resources.find(r => r.id === payload.resourceId)?.name
      addNotification(
        "warning",
        `Баланс ресурса "${resourceName}" - "${measureName}" не найден`
      );
    }
    if (error.response?.status === 422){
      const payload = error.response.data as {
        resourceId: string;
        measureId: string;
        message: string;
      };
      var measureName = measures.find(m => m.id === payload.measureId)?.name;
      var resourceName = resources.find(r => r.id === payload.resourceId)?.name
      addNotification(
        "warning",
        `Ресурса "${resourceName}" - "${measureName}" недостаточно на складе`
      );
    }
    if (error.response?.status === 412){
      const payload = error.response.data as {
        documentNumber: string;
        message: string;
      };
      addNotification(
        "warning",
        `Документ "${payload.documentNumber}" нельзя создать без ресурсов отгрузки`
      );
    }
    if (error.response?.status === 400){
      addNotification(
        "warning",
        `Некорректный запрос к серверу. Обратитесь в техподдержку`
      );
    }
    if (error.response?.status === 500){
      const payload = error.response.data as {
        message: string;
      };
      addNotification(
        "error",
        `Произошла ошибка на сервере. Повторите попытку позже или обратитесь в техподдержку`
      );
      console.error(payload.message);
    }
  }

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
        <div className="form-row">
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
        </div>

        <div className="form-row">
        <div className="form-group">
          <label>Клиент</label>
          <DropdownSelect
            placeholder="Выберите клиента"
            options={clients}
            value={shipment.clientId}
            onChange={val => updateClient(val)}
            className="ds-wide"
          />
        </div>

        {!isNew && (
          <div className="form-group">
            <label>Статус</label>
            <DropdownSelect
              placeholder="Выберите статус"
              
              options={[
                { id: 'false', name: 'не подписан' },
                { id: 'true',  name: 'подписан'  }
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
                    <DropdownSelect
                      placeholder="Выберите ресурс"
                      options={resources}
                      value={resource.resourceId}
                      onChange={val => updateResource(index, 'resourceId', val)}
                    />
                  </td>
                  <td>
                    <DropdownSelect
                      placeholder="Выберите меру"
                      options={measures}
                      value={resource.measureId}
                      onChange={val => updateResource(index, 'measureId', val)}
                    />
                  </td>
                  <td>
                    <input className="unset-border"
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