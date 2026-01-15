
import React from 'react';
import { Chemical } from '../types';

interface DashboardProps {
  chemicals: Chemical[];
}

const Dashboard: React.FC<DashboardProps> = ({ chemicals }) => {
  const totalStock = chemicals.length;
  const expired = chemicals.filter(c => new Date(c.expiryDate) < new Date()).length;
  const lowStock = chemicals.filter(c => c.stock < 10).length;
  const criticalHazards = chemicals.filter(c => c.nfpa.health >= 3 || c.nfpa.flammability >= 3).length;

  const stats = [
    { label: 'Total Chemicals', value: totalStock, icon: 'fa-flask', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Expired Items', value: expired, icon: 'fa-calendar-times', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Low Stock Alerts', value: lowStock, icon: 'fa-exclamation-triangle', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'High Hazard Materials', value: criticalHazards, icon: 'fa-biohazard', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-xl`}>
            <i className={`fas ${stat.icon}`}></i>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
