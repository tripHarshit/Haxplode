import React from 'react';

const StatsCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">{title}</p>
          <p className="text-emerald-500 text-4xl font-bold">{value}</p>
        </div>
        {Icon && (
          <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-700">
            <Icon className="h-6 w-6 text-slate-500 dark:text-slate-300" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
