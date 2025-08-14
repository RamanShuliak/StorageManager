import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ruSidebar from './locales/ru/sidebar.json';
import enSidebar from './locales/en/sidebar.json';
import ruFilterPanel from './locales/ru/filterPanel.json';
import enFilterPanel from './locales/en/filterPanel.json';
import ruBalance from './locales/ru/balance.json';
import enBalance from './locales/en/balance.json';
import ruClients from './locales/ru/clients.json';
import enClients from './locales/en/clients.json';
import ruClientEdit from './locales/ru/clientEdit.json';
import enClientEdit from './locales/en/clientEdit.json';
import ruMeasures from './locales/ru/measures.json';
import enMeasures from './locales/en/measures.json';
import ruMeasureEdit from './locales/ru/measureEdit.json';
import enMeasureEdit from './locales/en/measureEdit.json';
import ruResources from './locales/ru/resources.json';
import enResources from './locales/en/resources.json';
import ruResourceEdit from './locales/ru/resourceEdit.json';
import enResourceEdit from './locales/en/resourceEdit.json';
import ruReceipts from './locales/ru/receipts.json';
import enReceipts from './locales/en/receipts.json';
import ruReceiptEdit from './locales/ru/receiptEdit.json';
import enReceiptEdit from './locales/en/receiptEdit.json';
import ruShipments from './locales/ru/shipments.json';
import enShipments from './locales/en/shipments.json';
import ruShipmentEdit from './locales/ru/shipmentEdit.json';
import enShipmentEdit from './locales/en/shipmentEdit.json';

export const resources = {
  RU: {
    sidebar: ruSidebar,
    filterPanel: ruFilterPanel,
    balance: ruBalance,
    clients: ruClients,
    clientEdit: ruClientEdit,
    measures: ruMeasures,
    measureEdit: ruMeasureEdit,
    resourcesPage: ruResources,
    resourceEdit: ruResourceEdit,
    receipts: ruReceipts,
    receiptEdit: ruReceiptEdit,
    shipments: ruShipments,
    shipmentEdit: ruShipmentEdit
  },
  EN: {
    sidebar: enSidebar,
    filterPanel: enFilterPanel,
    balance: enBalance,
    clients: enClients,
    clientEdit: enClientEdit,
    measures: enMeasures,
    measureEdit: enMeasureEdit,
    resourcesPage: enResources,
    resourceEdit: enResourceEdit,
    receipts: enReceipts,
    receiptEdit: enReceiptEdit,
    shipments: enShipments,
    shipmentEdit: enShipmentEdit
  }
} as const;

export type SupportedLng = keyof typeof resources;
export type I18nResources = typeof resources['RU'];

const storedLng =
  (typeof window !== 'undefined' && (localStorage.getItem('lng') as SupportedLng | null)) || 'RU';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: storedLng,
    fallbackLng: 'RU',
    defaultNS: 'sidebar',
    interpolation: { escapeValue: false },
    returnNull: false
  });

export default i18n;
