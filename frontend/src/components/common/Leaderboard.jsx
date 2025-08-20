import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Download, Filter } from 'lucide-react';
import { useToast } from '../ui/Toast';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([
    {
      id: 1,
      rank: 1,
      team: 'Team Innovators',
      project: 'AI-Powered Healthcare Assistant',
      score: 95,
      participants: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      trend: 'up',
      change: 2,
      category: 'AI/ML'
    },
    {
      id: 2,
      rank: 2,
      team: 'Code Masters',
      project: 'Smart City Traffic Management',
      score: 92,
      participants: ['Alice Brown', 'Bob Wilson'],
      trend: 'down',
      change: 1,
      category: 'IoT'
    },
    {
      id: 3,
      rank: 3,
      team: 'Tech Pioneers',
      project: 'Blockchain Voting System',
      score: 89,
      participants: ['Charlie Davis', 'Diana Miller', 'Eve Garcia'],
      trend: 'up',
      change: 3,
      category: 'Blockchain'
    },
    {
      id: 4,
      rank: 4,
      team: 'Data Wizards',
      project: 'Predictive Analytics Dashboard',
      score: 87,
      participants: ['Frank Lee', 'Grace Chen'],
      trend: 'stable',
      change: 0,
      category: 'Data Science'
    },
    {
      id: 5,
      rank: 5,
      team: 'Web Warriors',
      project: 'E-commerce Platform',
      score: 85,
      participants: ['Henry Taylor', 'Ivy Rodriguez'],
      trend: 'up',
      change: 1,
      category: 'Web Development'
    }
  ]);

  const [filteredLeaderboard, setFilteredLeaderboard] = useState(leaderboard);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { success } = useToast();

  const categories = ['all', 'AI/ML', 'IoT', 'Blockchain', 'Data Science', 'Web Development'];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard(prev => {
        const updated = prev.map(team => {
          // Randomly update scores to simulate live changes
          if (Math.random() > 0.7) {
            const scoreChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const newScore = Math.max(70, Math.min(100, team.score + scoreChange));
            
            let trend = 'stable';
            let change = 0;
            
            if (scoreChange > 0) {
              trend = 'up';
              change = scoreChange;
            } else if (scoreChange < 0) {
              trend = 'down';
              change = Math.abs(scoreChange);
            }
            
            return {
              ...team,
              score: newScore,
              trend,
              change
            };
          }
          return team;
        });
        
        // Re-sort by score
        return updated.sort((a, b) => b.score - a.score).map((team, index) => ({
          ...team,
          rank: index + 1
        }));
      });
      
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter leaderboard by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredLeaderboard(leaderboard);
    } else {
      setFilteredLeaderboard(leaderboard.filter(team => team.category === selectedCategory));
    }
  }, [leaderboard, selectedCategory]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">{rank}</span>;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Rank', 'Team', 'Project', 'Score', 'Category', 'Participants'].join(','),
      ...filteredLeaderboard.map(team => [
        team.rank,
        team.team,
        team.project,
        team.score,
        team.category,
        team.participants.join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    success('Export Complete', 'Leaderboard data has been exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Live Leaderboard</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Real-time rankings • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="btn-outline flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-slate-500" />
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Team & Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Participants
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredLeaderboard.map((team, index) => (
                <tr
                  key={team.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(team.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {team.team}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                        {team.project}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                      {team.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {team.score}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(team.trend)}
                      {team.change > 0 && (
                        <span className={`text-sm font-medium ${getTrendColor(team.trend)}`}>
                          +{team.change}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {team.participants.map((participant, pIndex) => (
                        <span
                          key={pIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        >
                          {participant}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Update Indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span>Live updates every 10 seconds</span>
      </div>
    </div>
  );
};

export default Leaderboard;
