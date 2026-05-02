import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Calculator } from 'lucide-react';
import { numberToWords } from '../utils/numberToWords';

interface Customer {
  id: string;
  name: string;
  address: string;
  gst_number: string;
  supply_address?: string;
  vendor_code: string;
}

interface InvoiceItem {
  da_number: string;
  po_number: string;
  description: string;
  hsn_sac: string;
  quantity: number;
  rate: number;
  amount: number;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_number: '',
    date: new Date().toISOString().split('T')[0],
    cgst_rate: 9,
    sgst_rate: 9,
    igst_rate: 0,
    sub_total: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    grand_total: 0,
    amount_in_words: '',
    po_number: '',
    po_date: '',
    da_number: '',
    da_date: '',
    dc_number: '',
    dc_date: '',
    items: [{
      da_number: '',
      po_number: '',
      description: '',
      hsn_sac: '',
      quantity: 0,
      rate: 0,
      amount: 0
    }] as InvoiceItem[]
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/customers`).then(res => res.json()),
      fetch(`${API_URL}/config`).then(res => res.json())
    ]).then(([customerData, config]) => {
      setCustomers(customerData);
      console.log('Fetched Config:', config);
      if (!isEdit && config.next_invoice_no) {
        setFormData(prev => ({
          ...prev,
          invoice_number: config.next_invoice_no
        }));
      }
    }).catch(err => console.error('Error fetching config:', err));

    if (isEdit) {
      fetch(`${API_URL}/invoices/${id}`)
        .then(res => res.json())
        .then(data => {
          const fmt = (d: string) => d ? new Date(d).toISOString().split('T')[0] : '';
          setFormData({
            ...data,
            date: fmt(data.date),
            po_date: fmt(data.po_date),
            da_date: fmt(data.da_date),
            dc_date: fmt(data.dc_date)
          });
        });
    }
  }, [id, isEdit]);

  const calculateTotals = (currentItems: InvoiceItem[], cgstRate: number, sgstRate: number, igstRate: number) => {
    const subTotal = currentItems.reduce((acc, item) => acc + item.amount, 0);
    const cgstAmount = (subTotal * cgstRate) / 100;
    const sgstAmount = (subTotal * sgstRate) / 100;
    const igstAmount = (subTotal * igstRate) / 100;
    const grandTotal = subTotal + cgstAmount + sgstAmount + igstAmount;

    setFormData(prev => ({
      ...prev,
      items: currentItems,
      sub_total: subTotal,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_amount: igstAmount,
      grand_total: grandTotal,
      amount_in_words: numberToWords(grandTotal)
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'rate') {
      item.amount = Number(item.quantity) * Number(item.rate);
    }

    newItems[index] = item;
    calculateTotals(newItems, formData.cgst_rate, formData.sgst_rate, formData.igst_rate);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { da_number: '', po_number: '', description: '', hsn_sac: '', quantity: 0, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    calculateTotals(newItems, formData.cgst_rate, formData.sgst_rate, formData.igst_rate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${API_URL}/invoices/${id}` : `${API_URL}/invoices`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) navigate('/invoice');
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate('/invoice')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /> Back to Invoices
        </button>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</h1>
          </div>

          <div className="p-8 space-y-8">
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Customer</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Choose a customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name + " - " + c.supply_address}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Invoice Number</label>
                <input
                  required
                  type="text"
                  value={formData.invoice_number}
                  onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. INV/2024/001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Date</label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Parallel Reference Details */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Purchase Order (PO)</label>
                    <input type="text" value={formData.po_number || ''} onChange={e => setFormData({ ...formData, po_number: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="No" />
                    <input type="date" value={formData.po_date || ''} onChange={e => setFormData({ ...formData, po_date: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Advice (DA)</label>
                    <input type="text" value={formData.da_number || ''} onChange={e => setFormData({ ...formData, da_number: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="No" />
                    <input type="date" value={formData.da_date || ''} onChange={e => setFormData({ ...formData, da_date: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Delivery Challan (DC)</label>
                    <input type="text" value={formData.dc_number || ''} onChange={e => setFormData({ ...formData, dc_number: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="No" />
                    <input type="date" value={formData.dc_date || ''} onChange={e => setFormData({ ...formData, dc_date: e.target.value })} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto -mx-8 px-8">
              <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold border-y border-gray-100">
                  <tr>
                    <th className="px-4 py-3 w-32">D.A. S.NO</th>
                    <th className="px-4 py-3 w-32">P.O. S.NO</th>
                    <th className="px-4 py-3 min-w-[200px]">Description</th>
                    <th className="px-4 py-3 w-28">HSN/SAC</th>
                    <th className="px-4 py-3 w-24">Qty</th>
                    <th className="px-4 py-3 w-32">Rate</th>
                    <th className="px-4 py-3 w-32">Amount</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="group hover:bg-gray-50/50">
                      <td className="p-2"><input type="text" value={item.da_number} onChange={e => handleItemChange(index, 'da_number', e.target.value)} className="w-full p-1.5 border border-transparent group-hover:border-gray-200 rounded outline-none bg-transparent focus:bg-white" /></td>
                      <td className="p-2"><input type="text" value={item.po_number} onChange={e => handleItemChange(index, 'po_number', e.target.value)} className="w-full p-1.5 border border-transparent group-hover:border-gray-200 rounded outline-none bg-transparent focus:bg-white" /></td>
                      <td className="p-2"><input required type="text" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-full p-1.5 border border-transparent group-hover:border-gray-200 rounded outline-none bg-transparent focus:bg-white" /></td>
                      <td className="p-2"><input type="text" value={item.hsn_sac} onChange={e => handleItemChange(index, 'hsn_sac', e.target.value)} className="w-full p-1.5 border border-transparent group-hover:border-gray-200 rounded outline-none bg-transparent focus:bg-white" /></td>
                      <td className="p-2"><input required type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-full p-1.5 border border-transparent group-hover:border-gray-200 rounded outline-none bg-transparent focus:bg-white" /></td>
                      <td className="p-2"><input required type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', Number(e.target.value))} className="w-full p-1.5 border border-transparent group-hover:border-gray-200 rounded outline-none bg-transparent focus:bg-white" /></td>
                      <td className="p-2 text-right font-medium">₹{item.amount.toFixed(2)}</td>
                      <td className="p-2">
                        <button type="button" onClick={() => removeItem(index)} className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={addItem}
                className="mt-4 flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-all"
              >
                <Plus size={18} /> Add New Row
              </button>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col lg:flex-row gap-12 pt-8 border-t border-gray-100">
              <div className="flex-1 space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-indigo-900 mb-2 uppercase flex items-center gap-2">
                    <Calculator size={16} /> Amount in Words
                  </h3>
                  <p className="text-indigo-700 italic font-medium">{formData.amount_in_words || 'Zero Only'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">CGST %</label>
                    <input type="number" value={formData.cgst_rate} onChange={e => { const r = Number(e.target.value); setFormData({ ...formData, cgst_rate: r }); calculateTotals(formData.items, r, formData.sgst_rate, formData.igst_rate); }} className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">SGST %</label>
                    <input type="number" value={formData.sgst_rate} onChange={e => { const r = Number(e.target.value); setFormData({ ...formData, sgst_rate: r }); calculateTotals(formData.items, formData.cgst_rate, r, formData.igst_rate); }} className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">IGST %</label>
                    <input type="number" value={formData.igst_rate} onChange={e => { const r = Number(e.target.value); setFormData({ ...formData, igst_rate: r }); calculateTotals(formData.items, formData.cgst_rate, formData.sgst_rate, r); }} className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-96 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Sub Total</span>
                  <span className="font-semibold">₹{formData.sub_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>CGST ({formData.cgst_rate}%)</span>
                  <span className="font-semibold">₹{formData.cgst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>SGST ({formData.sgst_rate}%)</span>
                  <span className="font-semibold">₹{formData.sgst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IGST ({formData.igst_rate}%)</span>
                  <span className="font-semibold">₹{formData.igst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 text-xl font-bold text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">₹{formData.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <Save size={20} />
              {isEdit ? 'Update Invoice' : 'Generate & Save Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
