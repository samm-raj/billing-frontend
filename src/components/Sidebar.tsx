import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, FileText, Settings, LogOut, Menu, X } from 'lucide-react';

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: '/customer', icon: <Users size={20} />, label: 'Customers' },
    { to: '/invoice', icon: <FileText size={20} />, label: 'Invoices' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header / Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50">
        <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
          B.R. INDUSTRIES
        </h1>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 h-screen flex flex-col shadow-sm z-50 transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
            B.R. INDUSTRIES
          </h1>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${isActive
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-all font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
          <div className="flex items-center gap-3 px-4 py-2 text-gray-500 italic text-xs">
            <Settings size={16} />
            v1.0.0 Stable
          </div>
        </div>
      </div>
    </>
  );
}
