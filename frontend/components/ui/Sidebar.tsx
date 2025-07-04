import React from 'react';

export interface SidebarTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  tabs: SidebarTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  logo?: React.ReactNode;
  bottomActions?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ tabs, activeTab, onTabChange, logo, bottomActions }) => {
  return (
    <aside className="sidebar-glass w-64 min-h-screen flex flex-col py-8 px-6 gap-3">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          {logo || <span className="text-3xl">🛡️</span>}
        </div>
        <h2 className="text-2xl font-bold text-blue-800 font-sans">Dashboard</h2>
      </div>
      <nav className="flex flex-col gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-lg'
                : 'hover:bg-[var(--sidebar-hover)] text-blue-800'
            }`}
          >
            {tab.icon && <span className="text-xl">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="flex-1" />
      {bottomActions && (
        <div className="mt-6">{bottomActions}</div>
      )}
    </aside>
  );
};

export default Sidebar; 