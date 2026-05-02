import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerPage from './pages/CustomerPage';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoiceFormPage from './pages/InvoiceFormPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto mt-16 lg:mt-0 p-4 lg:p-8">
          <Routes>
          <Route path="/" element={<Navigate to="/customer" replace />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/invoice" element={<InvoiceListPage />} />
          <Route path="/invoice/new" element={<InvoiceFormPage />} />
          <Route path="/invoice/edit/:id" element={<InvoiceFormPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<div className="flex items-center justify-center min-h-screen font-semibold text-gray-500">404 - Page Not Found</div>} />
        </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
