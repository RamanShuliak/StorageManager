export interface Client {
  id: string;
  name: string;
  address: string;
  isArchived: boolean;
}

export interface UpdateClientRequest {
  id: string;
  name: string;
  address: string;
}

export interface Measure {
  id: string;
  name: string;
  isArchived: boolean;
}

export interface UpdateMeasureRequest {
  id: string;
  name: string;
}

export interface Resource {
  id: string;
  name: string;
  isArchived: boolean;
}

export interface UpdateResourceRequest {
  id: string;
  name: string;
}

export interface Balance {
  resourceId: string;
  resourceName: string;
  measureId: string;
  measureName: string;
  amount: number;
}

export interface BalanceFilters {
  resourceIds?: string[];
  measureIds?: string[];
}

export interface ReceiptDocument {
  id: string;
  number: string;
  receiptDate: Date;
  resources: ReceiptResource[];
}

export interface ReceiptResource {
  id: string;
  resourceId: string;
  resourceName: string;
  measureId: string;
  measureName: string;
  amount: number;
}

export interface CreateReceiptDocumentRequest {
  number: string;
  receiptDate: Date;
  resources: CreateReceiptResourceRequest[];
}

export interface CreateReceiptResourceRequest {
  resourceId: string;
  measureId: string;
  amount: number;
}

export interface UpdateReceiptDocumentRequest{
  id: string;
  number: string;
  receiptDate: Date;
  createResources: CreateReceiptResourceRequest[];
  updateResources: UpdateReceiptResourceRequest[];
  deleteResourceIds: string[];
}

export interface UpdateReceiptResourceRequest {
  id: string;
  resourceId: string;
  measureId: string;
  amount: number;
}

export interface ShipmentDocument {
  id: string;
  number: string;
  shipmentDate: Date;
  clientId: string;
  clientName: string;
  isSigned: boolean;
  resources: ShipmentResource[];
}

export interface ShipmentResource {
  id: string;
  resourceId: string;
  resourceName: string;
  measureId: string;
  measureName: string;
  amount: number;
}

export interface CreateShipmentDocumentRequest {
  number: string;
  shipmentDate: Date;
  clientId: string;
  resources: CreateShipmentResourceRequest[];
}

export interface CreateShipmentResourceRequest {
  resourceId: string;
  measureId: string;
  amount: number;
}

export interface UpdateShipmentDocumentRequest {
  id: string;
  number: string;
  shipmentDate: Date;
  clientId: string;
  isSigned: boolean;
  createResources: CreateShipmentResourceRequest[];
  updateResources: UpdateShipmentResourceRequest[];
  deleteResourceIds: string[];
}

export interface UpdateShipmentResourceRequest {
  id: string;
  resourceId: string;
  measureId: string;
  amount: number;
}

export interface ReceiptFilters {
  numbers?: string[];
  resourceIds?: string[];
  measureIds?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface ShipmentFilters {
  numbers?: string[];
  resourceIds?: string[];
  measureIds?: string[];
  clientIds?: string[];
  dateFrom?: string;
  dateTo?: string;
} 