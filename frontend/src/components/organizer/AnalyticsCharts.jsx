import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AnalyticsCharts = ({ eventStats }) => {
  // Transform data for charts
  const participantsPerEvent = Object.entries(eventStats).map(([title, stats]) => ({
    name: title.length > 20 ? title.substring(0, 20) + '...' : title,
    participants: stats.totalParticipants,
    maxParticipants: stats.maxParticipants,
    teams: stats.teamsFormed,
    submissions: stats.submissionsReceived
  }));

  const registrationsOverTime = Object.entries(eventStats).flatMap(([title, stats]) =>
    stats.registrationTrend.map(trend => ({
      date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: trend.count,
      event: title
    }))
  );

  // Group by date for line chart
  const groupedRegistrations = registrationsOverTime.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = { date: item.date, total: 0 };
    }
    acc[item.date].total += item.count;
    return acc;
  }, {});

  const lineChartData = Object.values(groupedRegistrations).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="space-y-8">
      {/* Participants per Event Bar Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Participants per Event</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participantsPerEvent}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                stroke="#64748B"
              />
              <YAxis stroke="#64748B" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'participants' ? `${value} participants` : value,
                  name === 'participants' ? 'Current' : name === 'maxParticipants' ? 'Max Capacity' : name
                ]}
                labelFormatter={(label) => `Event: ${label}`}
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#E2E8F0' }}
              />
              <Bar 
                dataKey="participants" 
                fill="#10B981" 
                name="Current Participants"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="maxParticipants" 
                fill="#94A3B8" 
                name="Max Capacity"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-sm text-slate-600 dark:text-slate-300">Current Participants</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-400 rounded"></div>
            <span className="text-sm text-slate-600 dark:text-slate-300">Max Capacity</span>
          </div>
        </div>
      </div>

      {/* Registrations Over Time Line Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Registrations Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
              <XAxis 
                dataKey="date" 
                interval="preserveStartEnd"
                stroke="#64748B"
              />
              <YAxis stroke="#64748B" />
              <Tooltip 
                formatter={(value) => [`${value} registrations`, 'Total Registrations']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#E2E8F0' }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Total Events</h4>
          <div className="text-3xl font-bold text-emerald-600">
            {Object.keys(eventStats).length}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Total Participants</h4>
          <div className="text-3xl font-bold text-emerald-600">
            {Object.values(eventStats).reduce((sum, stats) => sum + stats.totalParticipants, 0)}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Total Teams</h4>
          <div className="text-3xl font-bold text-emerald-600">
            {Object.values(eventStats).reduce((sum, stats) => sum + stats.teamsFormed, 0)}
          </div>
        </div>
      </div>

      {/* Event Performance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Event Performance Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Teams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Fill Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {Object.entries(eventStats).map(([title, stats]) => {
                const fillRate = Math.round((stats.totalParticipants / stats.maxParticipants) * 100) || 0;
                return (
                  <tr key={title}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {title.length > 30 ? title.substring(0, 30) + '...' : title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {stats.totalParticipants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {stats.maxParticipants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {stats.teamsFormed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {stats.submissionsReceived}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        fillRate >= 90 ? 'bg-red-100 text-red-800' :
                        fillRate >= 75 ? 'bg-amber-100 text-amber-800' :
                        fillRate >= 50 ? 'bg-slate-100 text-slate-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {fillRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
