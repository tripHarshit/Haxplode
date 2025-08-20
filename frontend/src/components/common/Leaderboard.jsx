import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Award, Download, ChevronDown, Search } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { hackathonService } from '../../services/hackathonService';
import { teamService } from '../../services/teamService';

// Props: events = [{ id, name }]
const Leaderboard = ({ events = [] }) => {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || null);
  const [rows, setRows] = useState([]); // [{ teamId, team, score, participants }]
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { success } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // [{id, name}]

  useEffect(() => {
    if (!selectedEventId) return;
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        // Fetch teams and leaderboard entries in parallel
        const [teams, leaderboardResp] = await Promise.all([
          teamService.getTeamsByEvent(selectedEventId),
          hackathonService.getHackathonLeaderboard(selectedEventId),
        ]);

        const entries = leaderboardResp?.entries || [];
        // Aggregate scores per team and compute average
        const teamIdToAggregates = new Map();
        for (const e of entries) {
          const teamId = Number(e.teamId);
          const score = Number(e.score) || 0;
          const current = teamIdToAggregates.get(teamId) || { sum: 0, count: 0 };
          current.sum += score;
          current.count += 1;
          teamIdToAggregates.set(teamId, current);
        }
        const teamIdToAvgScore = new Map();
        for (const [teamId, agg] of teamIdToAggregates.entries()) {
          const avg = agg.count ? agg.sum / agg.count : 0;
          teamIdToAvgScore.set(teamId, Math.round(avg * 100) / 100);
        }

        const merged = teams.map((t) => ({
          teamId: t.id || t.teamId,
          team: t.teamName || t.name || `Team ${t.id}`,
          participants: Array.isArray(t.members) ? t.members.map(m => m.fullName || m.name || m.email || 'Member') : [],
          score: teamIdToAvgScore.get(Number(t.id || t.teamId)) || 0,
        }));

        merged.sort((a, b) => b.score - a.score);
        const ranked = merged.map((row, idx) => ({ id: row.teamId, rank: idx + 1, ...row }));
        if (isMounted) {
          setRows(ranked);
          setLastUpdate(new Date());
        }
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
        if (isMounted) setRows([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [selectedEventId]);

  useEffect(() => {
    // Update default selected when events prop changes
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events]);

  const handleSearch = async () => {
    try {
      // Basic search using existing endpoint with title filter (if supported), else fetch and filter client-side
      const resp = await hackathonService.getHackathons({ title: searchQuery, limit: 10 });
      const list = resp?.events || [];
      // Filter search results to only include events assigned to the judge
      const assignedEventIds = new Set(events.map(e => e.id));
      const filteredList = list.filter(e => assignedEventIds.has(e.id));
      setSearchResults(filteredList.map(e => ({ id: e.id, name: e.name || e.title })));
    } catch (e) {
      console.error('Hackathon search failed:', e);
      setSearchResults([]);
    }
  };

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

  const handleExport = () => {
    const csvContent = [
      ['Rank', 'Team', 'Score', 'Participants'].join(','),
      ...rows.map(team => [
        team.rank,
        team.team,
        team.score,
        (team.participants || []).join('; ')
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-3 sm:gap-0 w-full sm:w-auto">
          {/* Search bar */}
          <div className="w-full sm:w-80">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hackathons..."
                className="w-full pl-9 pr-24 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
              />
              <Search className="h-4 w-4 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <button
                onClick={handleSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
              >Search</button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md max-h-56 overflow-y-auto shadow-lg">
                {searchResults.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedEventId(r.id); setSearchResults([]); setSearchQuery(r.name || `Event ${r.id}`); }}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
                  >
                    {r.name || `Event ${r.id}`}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Hackathon selector */}
          <div className="relative">
            <select
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(Number(e.target.value) || null)}
              className="appearance-none pr-8 pl-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              <option value="" disabled>Select hackathon</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name || `Event ${ev.id}`}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none h-4 w-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
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

      {!selectedEventId && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
          Select a hackathon to view its leaderboard.

        </div>
      )}

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
                      {(team.participants || []).map((participant, pIndex) => (
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
              {selectedEventId && !loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-500 dark:text-gray-400">No teams found for this hackathon.</td>
                </tr>
              )}
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
