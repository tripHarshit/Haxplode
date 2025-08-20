import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  StarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const JudgeAnalytics = ({ analytics }) => {
  // Transform data for charts
  const scoreDistributionData = Object.entries(analytics.scoreDistribution).map(([score, count]) => ({
    score: parseFloat(score),
    count,
    percentage: Math.round((count / analytics.totalReviews) * 100)
  }));

  const monthlyStatsData = analytics.monthlyStats.map(stat => ({
    month: stat.month,
    reviews: stat.reviews,
    avgScore: stat.avgScore
  }));

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">Total Reviews</dt>
                <dd className="text-2xl font-bold text-emerald-600">{analytics.totalReviews}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">Average Score</dt>
                <dd className="text-2xl font-bold text-emerald-600">{analytics.averageScore}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">Avg Time/Review</dt>
                <dd className="text-2xl font-bold text-emerald-600">{analytics.averageTimePerReview}m</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">Completion Rate</dt>
                <dd className="text-2xl font-bold text-emerald-600">{analytics.completionRate}%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Score Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
              <XAxis dataKey="score" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', color: '#E2E8F0' }} labelStyle={{ color: '#E2E8F0' }} />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Performance Trend */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Monthly Performance Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', color: '#E2E8F0' }} labelStyle={{ color: '#E2E8F0' }} />
              <Line type="monotone" dataKey="reviews" stroke="#10B981" strokeWidth={3} />
              <Line type="monotone" dataKey="avgScore" stroke="#94A3B8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default JudgeAnalytics;
