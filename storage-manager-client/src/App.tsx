import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BalancePage from './pages/BalancePage';
import ReceiptsPage from './pages/ReceiptsPage';
import ReceiptEditPage from './pages/ReceiptEditPage';
import ShipmentsPage from './pages/ShipmentsPage';
import ShipmentEditPage from './pages/ShipmentEditPage';
import ClientsPage from './pages/ClientsPage';
import ClientEditPage from './pages/ClientEditPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceEditPage from './pages/ResourceEditPage';
import MeasuresPage from './pages/MeasuresPage';
import MeasureEditPage from './pages/MeasureEditPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/balance" replace />} />
            <Route path="/balance" element={<BalancePage />} />
            
            <Route path="/receipts" element={<ReceiptsPage />} />
            <Route path="/receipts/new" element={<ReceiptEditPage />} />
            <Route path="/receipts/:id" element={<ReceiptEditPage />} />
            
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/shipments/new" element={<ShipmentEditPage />} />
            <Route path="/shipments/:id" element={<ShipmentEditPage />} />
            
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/archive" element={<ClientsPage />} />
            <Route path="/clients/new" element={<ClientEditPage />} />
            <Route path="/clients/:id" element={<ClientEditPage />} />
            
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/archive" element={<ResourcesPage />} />
            <Route path="/resources/new" element={<ResourceEditPage />} />
            <Route path="/resources/:id" element={<ResourceEditPage />} />
            
            <Route path="/measures" element={<MeasuresPage />} />
            <Route path="/measures/archive" element={<MeasuresPage />} />
            <Route path="/measures/new" element={<MeasureEditPage />} />
            <Route path="/measures/:id" element={<MeasureEditPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 