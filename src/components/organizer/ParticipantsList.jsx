import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const ParticipantsList = ({ participants, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamStatusFilter, setTeamStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredParticipants = useMemo(() => {
    return participants.filter(participant => {
      const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTeamStatus = teamStatusFilter === 'all' || 
                               participant.teamStatus === teamStatusFilter;
      
      const matchesDate = dateFilter === 'all' || 
                         (dateFilter === 'recent' && 
                          new Date(participant.registrationDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                         (dateFilter === 'thisMonth' && 
                          new Date(participant.registrationDate).getMonth() === new Date().getMonth());
      
      return matchesSearch && matchesTeamStatus && matchesDate;
    });
  }, [participants, searchTerm, teamStatusFilter, dateFilter]);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Registration Date', 'Team Status', 'Team Name', 'Hackathon', 'Skills', 'Submissions'];
    const csvContent = [
      headers.join(','),
      ...filteredParticipants.map(p => [
        p.name,
        p.email,
        format(new Date(p.registrationDate), 'MMM dd, yyyy'),
        p.teamStatus,
        p.teamName || 'N/A',
        p.hackathonTitle,
        p.skills.join('; '),
        p.submissions
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTeamStatusColor = (status) => {
    switch (status) {
      case 'In Team': return 'bg-green-100 text-green-800';
      case 'No Team': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search participants by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={teamStatusFilter}
            onChange={(e) => setTeamStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Team Status</option>
            <option value="In Team">In Team</option>
            <option value="No Team">No Team</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Dates</option>
            <option value="recent">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
          </select>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredParticipants.length} of {participants.length} participants
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Participants Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredParticipants.map((participant) => (
            <li key={participant.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {participant.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {participant.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Registered: {format(new Date(participant.registrationDate), 'MMM dd, yyyy')}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTeamStatusColor(participant.teamStatus)}`}>
                        {participant.teamStatus}
                      </span>
                      {participant.teamName && (
                        <span className="text-blue-600">Team: {participant.teamName}</span>
                      )}
                      <span>Submissions: {participant.submissions}</span>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {participant.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {participant.skills.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{participant.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(participant)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredParticipants.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ParticipantsList;
