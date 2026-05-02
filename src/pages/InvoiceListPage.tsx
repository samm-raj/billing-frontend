import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Download, Trash2, Edit2, Calendar, Building2 } from 'lucide-react';
import { generateInvoicePdf } from '../utils/generateInvoicePdf';
import DownloadModal from '../components/DownloadModal';

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  grand_total: number;
  customer_id: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/invoices`).then(res => res.json()),
      fetch(`${API_URL}/customers`).then(res => res.json())
    ]).then(([invoiceData, customerData]) => {
      setInvoices(invoiceData);
      setCustomers(customerData);
      setLoading(false);
    });
  }, []);

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.name || 'Unknown Customer';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
      setInvoices(invoices.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(inv.customer_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleConfirmDownload = async (counts: { original: number; duplicate: number; triplicate: number }) => {
    if (!selectedInvoice) return;
    setIsModalOpen(false);

    try {
      const [invoiceRes, configRes] = await Promise.all([
        fetch(`${API_URL}/invoices/${selectedInvoice.id}`),
        fetch(`${API_URL}/config`)
      ]);
      
      const fullInvoice = await invoiceRes.json();
      const config = await configRes.json();
      
      const customer = customers.find(c => c.id === fullInvoice.customer_id);
      generateInvoicePdf(fullInvoice, customer, counts, config);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-500 mt-1">View and manage all your generated bills</p>
          </div>
          <button
            onClick={() => navigate('/invoice/new')}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg font-semibold"
          >
            <Plus size={20} />
            Generate New Invoice
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by invoice number or customer..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Invoice Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Loading invoices...</td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No invoices found.</td></tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/80 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{inv.invoice_number}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Calendar size={12} /> {new Date(inv.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Building2 size={16} className="text-gray-400" />
                          <span className="font-medium">{getCustomerName(inv.customer_id)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-gray-900">₹{inv.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                          Generated
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleDownloadClick(inv)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/invoice/edit/${inv.id}`)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDownload}
        invoiceNumber={selectedInvoice?.invoice_number || ''}
      />
    </div>
  );
}
