import React, { useEffect, useState } from 'react';
import { Crown, Star, Award, Building2, ExternalLink, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../ui/Toast';
import axios from 'axios';

const SponsorShowcase = () => {
  const [sponsors, setSponsors] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const api = axios.create({ baseURL: API_URL });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const loadSponsors = async () => {
    try {
      const resp = await api.get('/sponsors');
      setSponsors(resp.data?.sponsors || []);
    } catch (e) {
      error('Failed to load sponsors');
    }
  };

  useEffect(() => { loadSponsors(); }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const { success, error } = useToast();

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'platinum':
        return <Crown className="h-5 w-5 text-purple-500" />;
      case 'gold':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'silver':
        return <Award className="h-5 w-5 text-gray-400" />;
      default:
        return <Building2 className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'platinum':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'silver':
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleAddSponsor = async (sponsorData) => {
    try {
      await api.post('/sponsors', sponsorData);
      await loadSponsors();
      setShowAddModal(false);
      success('Sponsor Added', 'New sponsor has been added successfully!');
    } catch {
      error('Failed to add sponsor');
    }
  };

  const handleDeleteSponsor = async (id) => {
    try {
      await api.delete(`/sponsors/${id}`);
      await loadSponsors();
      success('Sponsor Removed', 'Sponsor has been removed successfully!');
    } catch {
      error('Failed to remove sponsor');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const s = sponsors.find(x => x.id === id);
      await api.put(`/sponsors/${id}`, { featured: !s?.featured });
      await loadSponsors();
    } catch {
      error('Failed to update sponsor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sponsor Showcase</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage and showcase your event sponsors</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Sponsor</span>
        </button>
      </div>

      {/* Featured Sponsors Carousel */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Featured Sponsors</h3>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {sponsors.filter(s => s.featured).map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{sponsor.name}</h4>
                  <div className="flex items-center space-x-1">
                    {getTierIcon(sponsor.tier)}
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{sponsor.tier}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{sponsor.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{sponsor.contribution}</span>
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Sponsors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{sponsor.name}</h4>
                  <div className="flex items-center space-x-1">
                    {getTierIcon(sponsor.tier)}
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{sponsor.tier}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleFeatured(sponsor.id)}
                  className={`p-1 rounded ${sponsor.featured ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  title={sponsor.featured ? 'Remove from featured' : 'Add to featured'}
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedSponsor(sponsor)}
                  className="p-1 text-gray-400 hover:text-blue-500"
                  title="Edit sponsor"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteSponsor(sponsor.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Delete sponsor"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{sponsor.description}</p>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(sponsor.tier)}`}>
                {sponsor.contribution}
              </span>
              <a
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center space-x-1"
              >
                <span>Visit</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Sponsor Modal */}
      {showAddModal && (
        <AddSponsorModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSponsor}
        />
      )}

      {/* Edit Sponsor Modal */}
      {selectedSponsor && (
        <EditSponsorModal
          sponsor={selectedSponsor}
          onClose={() => setSelectedSponsor(null)}
          onUpdate={(updatedSponsor) => {
            setSponsors(prev => prev.map(s => s.id === updatedSponsor.id ? updatedSponsor : s));
            setSelectedSponsor(null);
            success('Sponsor Updated', 'Sponsor information has been updated successfully!');
          }}
        />
      )}
    </div>
  );
};

// Add Sponsor Modal Component
const AddSponsorModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    tier: 'silver',
    website: '',
    description: '',
    contribution: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Sponsor</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tier</label>
            <select
              value={formData.tier}
              onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
              className="input"
            >
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contribution</label>
            <input
              type="text"
              value={formData.contribution}
              onChange={(e) => setFormData(prev => ({ ...prev, contribution: e.target.value }))}
              className="input"
              placeholder="$10,000"
              required
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Add Sponsor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Sponsor Modal Component
const EditSponsorModal = ({ sponsor, onClose, onUpdate }) => {
  const [formData, setFormData] = useState(sponsor);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Edit Sponsor</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL</label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tier</label>
            <select
              value={formData.tier}
              onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
              className="input"
            >
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contribution</label>
            <input
              type="text"
              value={formData.contribution}
              onChange={(e) => setFormData(prev => ({ ...prev, contribution: e.target.value }))}
              className="input"
              placeholder="$10,000"
              required
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Update Sponsor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SponsorShowcase;
