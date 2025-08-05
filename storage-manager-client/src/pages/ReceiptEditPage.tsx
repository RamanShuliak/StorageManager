import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { receiptApi, resourceApi, measureApi } from '../services/api';
import {
  ReceiptDocument,
  ReceiptResource,
  Resource,
  Measure,
  CreateReceiptResourceRequest,
  UpdateReceiptResourceRequest,
  UpdateReceiptDocumentRequest
} from '../types';
import './Page.css';

const ReceiptEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === undefined;

  const [receipt, setReceipt] = useState<ReceiptDocument>({
    id: '',
    number: '',
    receiptDate: new Date(),
    resources: []
  });
  const [resources, setResources] = useState<Resource[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [deleteResourceIds, setDeletedResourceIds] = useState<string[]>([]);
  const [originalResources, setOriginalResources] = useState<ReceiptResource[]>([]);
  const createResources: CreateReceiptResourceRequest[] = [];
  const updateResources: UpdateReceiptResourceRequest[] = [];
  const [loading, setLoading] = useState(false);
  const [dateInput, setDateInput] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setDeletedResourceIds([]);  // сбрасываем удалённые при загрузке
      const [resResp, measResp] = await Promise.all([
        resourceApi.getResources(false),
        measureApi.getMeasures(false)
      ]);
      setResources(resResp.data);
      setMeasures(measResp.data);

      if (!isNew && id) {
        const receiptResp = await receiptApi.getReceipt(id);
        const rawDate = new Date(receiptResp.data.receiptDate);
        setReceipt({
          ...receiptResp.data,
          receiptDate: rawDate
        })
        setOriginalResources(receiptResp.data.resources);
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
        await receiptApi.createReceipt({
          number: receipt.number,
          receiptDate: receipt.receiptDate,
          resources: receipt.resources.map<CreateReceiptResourceRequest>(r => ({
            resourceId: r.resourceId,
            measureId: r.measureId,
            amount: r.amount
          }))
        });
      } else {
        const { createResources, updateResources } = buildUpdateArrays();

        const updateReq: UpdateReceiptDocumentRequest = {
          id: receipt.id,
          number: receipt.number,
          receiptDate: receipt.receiptDate,
          createResources,
          updateResources,
          deleteResourceIds
        };

        await receiptApi.updateReceipt(updateReq);
      }

      navigate('/receipts');
    } catch (error) {
      console.error('Error saving receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (window.confirm('Вы уверены, что хотите удалить это поступление?')) {
      try {
        await receiptApi.deleteReceipt(receipt.id);
        navigate('/receipts');
      } catch (error) {
        console.error('Error deleting receipt:', error);
      }
    }
  };

  const buildUpdateArrays = () => {
    receipt.resources.forEach(r => {
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
    const newResource: ReceiptResource = {
      id: tempId,
      resourceId: resources[0]?.id || '',
      resourceName: resources[0]?.name || '',
      measureId: measures[0]?.id || '',
      measureName: measures[0]?.name || '',
      amount: 0
    };
    setReceipt(prev => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }));
  };

  const removeResource = (index: number) => {
    setReceipt(prev => {
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

  const updateResource = (index: number, field: keyof ReceiptResource, value: any) => {
    setReceipt(prev => {
      const updated = [...prev.resources];
      const res = { ...updated[index] };

      if (field === 'resourceId') {
        const sel = resources.find(r => r.id === value);
        res.resourceId = value;
        res.resourceName = sel?.name || '';
      } else if (field === 'measureId') {
        const sel = measures.find(m => m.id === value);
        res.measureId = value;
        res.measureName = sel?.name || '';
      } else {
        (res as any)[field] = value;
      }

      updated[index] = res;
      return { ...prev, resources: updated };
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Поступление</h1>
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
            value={receipt.number}
            onChange={e => setReceipt(prev => ({ ...prev, number: e.target.value }))}
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
              setReceipt(prev => ({
                ...prev,
                receiptDate: new Date(localStr)
              }));
            }}
          />
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
              {receipt.resources.map((res, idx) => (
                <tr key={res.id}>
                  <td className="action-cell">
                    <button
                      className="action-btn delete-btn"
                      onClick={() => removeResource(idx)}
                    >
                      ×
                    </button>
                  </td>
                  <td>
                    <select
                      value={res.resourceId}
                      onChange={e => updateResource(idx, 'resourceId', e.target.value)}
                    >
                      {resources.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={res.measureId}
                      onChange={e => updateResource(idx, 'measureId', e.target.value)}
                    >
                      {measures.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={res.amount}
                      min="0"
                      onChange={e => updateResource(idx, 'amount', Number(e.target.value))}
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

export default ReceiptEditPage;
