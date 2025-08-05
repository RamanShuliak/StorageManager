import axios from 'axios';
import qs from 'qs';
import {
  Client,
  Measure,
  Resource,
  Balance,
  ReceiptDocument,
  ShipmentDocument,
  CreateReceiptDocumentRequest,
  CreateShipmentDocumentRequest,
  UpdateReceiptDocumentRequest,
  UpdateShipmentDocumentRequest,
  UpdateClientRequest,
  UpdateResourceRequest,
  UpdateMeasureRequest,
  BalanceFilters,
  ReceiptFilters,
  ShipmentFilters
} from '../types';

const API_BASE_URL = 'https://localhost:7285/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Balance API
export const balanceApi = {
  getBalances: (filters?: BalanceFilters) =>
    api.get<Balance[]>('/balance/get-list', {
      params: {
        ResourceIds: filters?.resourceIds,
        MeasureIds: filters?.measureIds
      },
      paramsSerializer: params => 
        qs.stringify(params, { arrayFormat: 'repeat' })
    }),
};

// Receipt API
export const receiptApi = {
  getReceipts: (filters?: ReceiptFilters) =>
    api.get<ReceiptDocument[]>('/receipt/get-list', {
      params: {
        DocNumbers: filters?.numbers,
        ResourceIds: filters?.resourceIds,
        MeasureIds: filters?.measureIds,
        FromDate: filters?.dateFrom,
        ToDate: filters?.dateTo
      },
      paramsSerializer: params =>
        qs.stringify(params, { arrayFormat: 'repeat' })
    }),
  getReceiptNumbers: () => 
      api.get<string[]>('/receipt/get-number-list'),
  getReceipt: (id: string) => 
    api.get<ReceiptDocument>(`/receipt/get?id=${id}`),
  createReceipt: (data: CreateReceiptDocumentRequest) => 
    api.post<ReceiptDocument>('/receipt/create', {
      Number: data.number,
      ReceiptDate: data.receiptDate,
      Resources: data.resources.map(r => ({
        ResourceId: r.resourceId,
        MeasureId: r.measureId,
        Amount: r.amount
      }))
    }),
  updateReceipt: (data: UpdateReceiptDocumentRequest) => 
    api.put<ReceiptDocument>('/receipt/update', {
      Id: data.id,
      Number: data.number,
      ReceiptDate: data.receiptDate,
      CreateResources: data.createResources.map(r => ({
        ResourceId: r.resourceId,
        MeasureId: r.measureId,
        Amount: r.amount,
      })),
      UpdateResources: data.updateResources.map(r => ({
        Id: r.id,
        ResourceId: r.resourceId,
        MeasureId: r.measureId,
        Amount: r.amount,
      })),
      DeleteResourceIds: data.deleteResourceIds
    }),
  deleteReceipt: (id: string) => 
    api.delete(`/receipt/delete?documentId=${id}`),
};

// Shipment API
export const shipmentApi = {
  getShipments: (filters?: ShipmentFilters) =>
    api.get<ShipmentDocument[]>('/shipment/get-list', {
      params: {
        DocNumbers: filters?.numbers,
        ResourceIds: filters?.resourceIds,
        MeasureIds: filters?.measureIds,
        ClientIds: filters?.clientIds,
        FromDate: filters?.dateFrom,
        ToDate: filters?.dateTo
      },
      paramsSerializer: params =>
        qs.stringify(params, { arrayFormat: 'repeat' })
    }),
  getShipmentNumbers: () => 
    api.get<string[]>('/shipment/get-number-list'),
  getShipment: (id: string) => 
    api.get<ShipmentDocument>(`/shipment/get?id=${id}`),
  createShipment: (data: CreateShipmentDocumentRequest) => 
    api.post<ShipmentDocument>('/shipment/create', {
      Number: data.number,
      ShipmentDate: data.shipmentDate,
      ClientId: data.clientId,
      Resources: data.resources.map(r => ({
        ResourceId: r.resourceId,
        MeasureId: r.measureId,
        Amount: r.amount
      }))
    }),
  updateShipment: (data: UpdateShipmentDocumentRequest) => 
    api.put<ShipmentDocument>('/shipment/update', {
      Id: data.id,
      Number: data.number,
      ShipmentDate: data.shipmentDate,
      ClientId: data.clientId,
      IsSigned: data.isSigned,
      CreateResources: data.createResources.map(r => ({
        ResourceId: r.resourceId,
        MeasureId: r.measureId,
        Amount: r.amount,
      })),
      UpdateResources: data.updateResources.map(r => ({
        Id: r.id,
        ResourceId: r.resourceId,
        MeasureId: r.measureId,
        Amount: r.amount,
      })),
      DeleteResourceIds: data.deleteResourceIds
    }),
  deleteShipment: (id: string) => 
    api.delete(`/shipment/delete?documentId=${id}`),
};

// Client API
export const clientApi = {
  getClients: (isArchived: boolean = false) => 
    isArchived 
      ? api.get<Client[]>('/client/get-archived')
      : api.get<Client[]>('/client/get-active'),
  getClient: (id: string) => 
    api.get<Client>(`/client/get?id=${id}`),
  createClient: (data: { name: string; address: string }) => 
    api.post<Client>('/client/create', {
      Name: data.name,
      Address: data.address
    }),
  updateClient: (data: UpdateClientRequest) => 
    api.put<Client>('/client/update', {
      Id: data.id,
      Name: data.name,
      Address: data.address
    }),
  deleteClient: (id: string) => 
    api.delete(`/client/delete?id=${id}`),
  archiveClient: (id: string) => 
    api.put<Client>(`/client/update-state?id=${id}`),
  unarchiveClient: (id: string) => 
    api.put<Client>(`/client/update-state?id=${id}`),
};

// Resource API
export const resourceApi = {
  getResources: (isArchived: boolean = false) => 
    isArchived 
      ? api.get<Resource[]>('/resource/get-archived')
      : api.get<Resource[]>('/resource/get-active'),
  getResource: (id: string) => 
    api.get<Resource>(`/resource/get?id=${id}`),
  createResource: (data: { name: string }) => 
    api.post<Resource>('/resource/create', data.name),
  updateResource: (data: UpdateResourceRequest) => 
    api.put<Resource>('/resource/update', {
      Id: data.id,
      Name: data.name
    }),
  deleteResource: (id: string) => 
    api.delete(`/resource/delete?id=${id}`),
  archiveResource: (id: string) => 
    api.put<Resource>(`/resource/update-state?id=${id}`),
  unarchiveResource: (id: string) => 
    api.put<Resource>(`/resource/update-state?id=${id}`),
};

// Measure API
export const measureApi = {
  getMeasures: (isArchived: boolean = false) => 
    isArchived 
      ? api.get<Measure[]>('/measure/get-archived')
      : api.get<Measure[]>('/measure/get-active'),
  getMeasure: (id: string) => 
    api.get<Measure>(`/measure/get?id=${id}`),
  createMeasure: (data: { name: string }) => 
    api.post<Measure>('/measure/create', data.name),
  updateMeasure: (data: UpdateMeasureRequest) => 
    api.put<Measure>('/measure/update', {
      Id: data.id,
      Name: data.name
    }),
  deleteMeasure: (id: string) => 
    api.delete(`/measure/delete?id=${id}`),
  archiveMeasure: (id: string) => 
    api.put<Measure>(`/measure/update-state?id=${id}`),
  unarchiveMeasure: (id: string) => 
    api.put<Measure>(`/measure/update-state?id=${id}`),
};

export default api; 