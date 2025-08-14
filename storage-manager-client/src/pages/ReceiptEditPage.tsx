import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { useNotification } from "../components/notifications/NotificationContext";
import { AxiosError } from 'axios';
import { DropdownSelect } from '../components/DropdownSelect';
import { useFaviconAndTitle } from '../components/UseFaviconAndTitle';

const ReceiptEditPage: React.FC = () => {
  const { t } = useTranslation('receiptEdit');

  useFaviconAndTitle(t('title'), '/icons/logo-icon.png');
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
  const [loading, setLoading] = useState(false);
  const [dateInput, setDateInput] = useState<string>('');

  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      setDeletedResourceIds([]);
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
        });
        setOriginalResources(receiptResp.data.resources);
        setDateInput(rawDate.toISOString().slice(0, 16));
      } else {
        // для нового документа выставим текущее локальное время в инпут
        const now = new Date();
        setDateInput(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }
    } catch (error) {
      await handleServerExceptions(error);
    }
  };

  const handleSave = async () => {
    if (receipt.number.trim() === '') {
      addNotification("info", t('notifications.emptyNumber'));
      return;
    }
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
        addNotification("success", t('notifications.created', { number: receipt.number }));
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
        addNotification("success", t('notifications.updated', { number: receipt.number }));
      }

      navigate('/receipts');
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
        await receiptApi.deleteReceipt(receipt.id);
        addNotification("success", t('notifications.deleted', { number: receipt.number }));
        navigate('/receipts');
      } catch (error) {
        await handleServerExceptions(error);
      }
    }
  };

  const buildUpdateArrays = () => {
    const createResources: CreateReceiptResourceRequest[] = [];
    const updateResources: UpdateReceiptResourceRequest[] = [];

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
          !!orig &&
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
    const defaultResource = resources[0];
    const defaultMeasure = measures[0];

    const newResource: ReceiptResource = {
      id: tempId,
      resourceId: defaultResource?.id || '',
      resourceName: defaultResource?.name || '',
      measureId: defaultMeasure?.id || '',
      measureName: defaultMeasure?.name || '',
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
      if (toRemove && !toRemove.id.startsWith('temp-')) {
        setDeletedResourceIds(prevIds =>
          prevIds.includes(toRemove.id) ? prevIds : [...prevIds, toRemove.id]
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

  const handleServerExceptions = async (err: unknown) => {
    const error = err as AxiosError;

    if (error.response?.status === 409) {
      const payload = error.response.data as { paramValue: string; message: string; };
      addNotification("warning", t('errors.conflict', { number: payload.paramValue }));
    }

    if (error.response?.status === 404) {
      const payload = error.response.data as {
        entityType: string;
        paramName: string;
        paramValue: string;
        message: string;
      };

      if (payload.entityType === "ReceiptResource") {
        addNotification("warning", t('errors.notFoundResourceRow', {
          paramName: payload.paramName,
          paramValue: payload.paramValue
        }));
      }
      if (payload.entityType === "ReceiptDocument") {
        addNotification("warning", t('errors.notFoundDocument', { number: receipt.number }));
      }
      if (payload.entityType === "Measure") {
        const measureName = measures.find(m => m.id === payload.paramValue)?.name || payload.paramValue;
        addNotification("warning", t('errors.measureNotFound', { name: measureName }));
      }
      if (payload.entityType === "Resource") {
        const resourceName = resources.find(r => r.id === payload.paramValue)?.name || payload.paramValue;
        addNotification("warning", t('errors.resourceNotFound', { name: resourceName }));
      }
    }

    if (error.response?.status === 410) {
      const payload = error.response.data as {
        resourceId: string;
        measureId: string;
        message: string;
      };
      const measureName = measures.find(m => m.id === payload.measureId)?.name || payload.measureId;
      const resourceName = resources.find(r => r.id === payload.resourceId)?.name || payload.resourceId;
      addNotification("warning", t('errors.balanceNotFound', {
        resource: resourceName,
        measure: measureName
      }));
    }

    if (error.response?.status === 422) {
      const payload = error.response.data as {
        resourceId: string;
        measureId: string;
        message: string;
      };
      const measureName = measures.find(m => m.id === payload.measureId)?.name || payload.measureId;
      const resourceName = resources.find(r => r.id === payload.resourceId)?.name || payload.resourceId;
      addNotification("warning", t('errors.insufficient', {
        resource: resourceName,
        measure: measureName
      }));
    }

    if (error.response?.status === 400) {
      addNotification("warning", t('errors.badRequest'));
    }

    if (error.response?.status === 500) {
      const payload = error.response.data as { message: string; };
      addNotification("error", t('errors.serverError'));
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
            <label>{t('form.number')}</label>
            <input
              type="text"
              value={receipt.number}
              onChange={e => setReceipt(prev => ({ ...prev, number: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>{t('form.dateTime')}</label>
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
        </div>

        <div className="resource-table">
          <h3>{t('sections.resources')}</h3>
          <table>
            <thead>
              <tr>
                <th className="action-cell">
                  <button className="action-btn add-btn" onClick={addResource}>
                    {t('buttons.addRow')}
                  </button>
                </th>
                <th>{t('table.resource')}</th>
                <th>{t('table.measure')}</th>
                <th>{t('table.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {receipt.resources.map((res, idx) => (
                <tr key={res.id}>
                  <td className="action-cell">
                    <button
                      className="action-btn delete-btn"
                      onClick={() => removeResource(idx)}
                      title={t('buttons.removeRow') as string}
                    >
                      {t('buttons.removeRow')}
                    </button>
                  </td>
                  <td>
                    <DropdownSelect
                      placeholder={t('placeholders.selectResource')}
                      options={resources}
                      value={res.resourceId}
                      onChange={val => updateResource(idx, 'resourceId', val)}
                    />
                  </td>
                  <td>
                    <DropdownSelect
                      placeholder={t('placeholders.selectMeasure')}
                      options={measures}
                      value={res.measureId}
                      onChange={val => updateResource(idx, 'measureId', val)}
                    />
                  </td>
                  <td>
                    <input
                      className="unset-border"
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
