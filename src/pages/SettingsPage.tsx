import React, { useState, useEffect } from 'react';
import { Save, Building2, FileText, Phone, Mail, MapPin, Hash, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    company_name: '',
    company_address: '',
    company_gst: '',
    company_email: '',
    company_phone: '',
    next_invoice_no: ''
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/config`)
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading configurations...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="text-indigo-600" />
            System Settings
          </h1>
          <p className="text-gray-500 mt-2">Manage your company profile and billing configurations.</p>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Company Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-indigo-500" />
                Company Profile
              </h2>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={14} /> Company Name
                </label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. B.R. INDUSTRIES"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Hash size={14} /> GST Number
                </label>
                <input
                  type="text"
                  value={settings.company_gst}
                  onChange={e => setSettings({ ...settings, company_gst: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={14} /> Address
                </label>
                <textarea
                  rows={3}
                  value={settings.company_address}
                  onChange={e => setSettings({ ...settings, company_address: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Full business address..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={14} /> Contact Email
                </label>
                <input
                  type="text"
                  value={settings.company_email}
                  onChange={e => setSettings({ ...settings, company_email: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="contact@company.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={14} /> Phone Number
                </label>
                <input
                  type="text"
                  value={settings.company_phone}
                  onChange={e => setSettings({ ...settings, company_phone: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="+91 00000 00000"
                />
              </div>
            </div>
          </div>

          {/* Billing Configuration Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Hash size={20} className="text-indigo-500" />
                Billing Configuration
              </h2>
            </div>
            <div className="p-8">
              <div className="max-w-xs space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Next Invoice Number</label>
                <input
                  type="text"
                  value={settings.next_invoice_no}
                  onChange={e => setSettings({ ...settings, next_invoice_no: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                  placeholder="e.g. BR/24-25/001"
                />
                <p className="text-xs text-gray-400 mt-1">This number will be pre-filled for your next new invoice.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            {saved ? (
              <span className="flex items-center gap-2 text-green-600 font-bold animate-bounce">
                <CheckCircle2 size={20} /> Settings saved successfully!
              </span>
            ) : <div />}

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              <Save size={20} />
              Save Configurations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
