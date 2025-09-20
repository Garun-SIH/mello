import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'blue', trend, description }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    red: 'bg-red-500 text-red-600 bg-red-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
    indigo: 'bg-indigo-500 text-indigo-600 bg-indigo-50',
  };

  const [textColor, lightBg] = colorClasses[color].split(' ');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center mt-2 text-sm ${
              trend.type === 'increase' ? 'text-green-600' : 
              trend.type === 'decrease' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend.type === 'increase' && '↗'}
              {trend.type === 'decrease' && '↘'}
              {trend.type === 'neutral' && '→'}
              <span className="ml-1">{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${lightBg}`}>
          <Icon className={`h-8 w-8 ${textColor}`} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
