import { useState } from 'react';
import { X, FileDown, Copy } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (counts: { original: number; duplicate: number; triplicate: number }) => void;
  invoiceNumber: string;
}

export default function DownloadModal({ isOpen, onClose, onConfirm, invoiceNumber }: DownloadModalProps) {
  const [counts, setCounts] = useState({
    original: 1,
    duplicate: 1,
    triplicate: 1
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileDown size={24} />
            <div>
              <h2 className="text-xl font-bold">Download Bill</h2>
              <p className="text-indigo-100 text-xs">Invoice: {invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-gray-500 text-sm">Select the number of copies you want to include in the PDF file:</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 text-gray-700">
                <Copy size={18} className="text-indigo-500" />
                <span className="font-semibold">Original</span>
              </div>
              <input 
                type="number" min="0" 
                value={counts.original} 
                onChange={e => setCounts({...counts, original: parseInt(e.target.value) || 0})}
                className="w-20 p-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 text-gray-700">
                <Copy size={18} className="text-indigo-500" />
                <span className="font-semibold">Duplicate</span>
              </div>
              <input 
                type="number" min="0" 
                value={counts.duplicate} 
                onChange={e => setCounts({...counts, duplicate: parseInt(e.target.value) || 0})}
                className="w-20 p-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 text-gray-700">
                <Copy size={18} className="text-indigo-500" />
                <span className="font-semibold">Triplicate</span>
              </div>
              <input 
                type="number" min="0" 
                value={counts.triplicate} 
                onChange={e => setCounts({...counts, triplicate: parseInt(e.target.value) || 0})}
                className="w-20 p-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => onConfirm(counts)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <FileDown size={20} />
            Generate PDF Package
          </button>
        </div>
      </div>
    </div>
  );
}
