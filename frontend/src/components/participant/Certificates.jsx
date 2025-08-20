import React, { useState, useEffect } from 'react';
import { Trophy, Award, Download, Eye, Star, Medal, Crown, FileText } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { certificateService } from '../../services/certificateService';

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadCertificates();
    }
  }, [user?.id]);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      const response = await certificateService.getUserCertificates(user.id);
      setCertificates(response.certificates || []);
    } catch (err) {
      console.error('Failed to load certificates:', err);
      error('Failed to load certificates', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCertificateIcon = (type) => {
    switch (type) {
      case 'winner':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'runner-up':
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 'special':
        return <Star className="h-6 w-6 text-purple-500" />;
      case 'participation':
        return <FileText className="h-6 w-6 text-blue-500" />;
      default:
        return <Award className="h-6 w-6 text-green-500" />;
    }
  };

  const getCertificateColor = (type) => {
    switch (type) {
      case 'winner':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'runner-up':
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 'special':
        return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
      case 'participation':
        return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white';
      default:
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
    }
  };

  const getCertificateBadge = (type) => {
    switch (type) {
      case 'winner':
        return '🏆';
      case 'runner-up':
        return '🥈';
      case 'special':
        return '💡';
      case 'participation':
        return '📜';
      default:
        return '🎖️';
    }
  };

  const handleDownload = async (certificate) => {
    try {
      success('Download Started', 'Certificate PDF is being generated...');
      await certificateService.downloadCertificate(certificate.id);
      success('Download Complete', 'Certificate has been downloaded successfully!');
    } catch (err) {
      error('Download Failed', err.message);
    }
  };

  const handlePreview = (certificate) => {
    setSelectedCertificate(certificate);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Certificates & Awards</h2>
          <p className="text-gray-600 dark:text-gray-400">View and download your achievement certificates</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{certificates.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Certificates</div>
          </div>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Winner Certificates</p>
              <p className="text-2xl font-bold">
                {certificates.filter(c => c.type === 'winner').length}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100">Runner-up</p>
              <p className="text-2xl font-bold">
                {certificates.filter(c => c.type === 'runner-up').length}
              </p>
            </div>
            <Medal className="h-8 w-8 text-gray-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Special Awards</p>
              <p className="text-2xl font-bold">
                {certificates.filter(c => c.type === 'special').length}
              </p>
            </div>
            <Star className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Participation</p>
              <p className="text-2xl font-bold">
                {certificates.filter(c => c.type === 'participation').length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {certificates.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📜</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Certificates will be automatically generated once the hackathons you participated in are completed.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Complete hackathons and wait for organizers to mark them as finished to receive your certificates.
            </p>
          </div>
        </div>
      )}

      {/* Certificates Grid */}
      {certificates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getCertificateBadge(certificate.type)}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{certificate.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{certificate.event?.name || 'Unknown Event'}</p>
                  </div>
                </div>
                {getCertificateIcon(certificate.type)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {new Date(certificate.issuedAt).toLocaleDateString()}
                  </span>
                </div>
                {certificate.team && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Team:</span>
                    <span className="text-gray-900 dark:text-gray-100">{certificate.team.name}</span>
                  </div>
                )}
                {certificate.projectName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Project:</span>
                    <span className="text-gray-900 dark:text-gray-100 line-clamp-1">{certificate.projectName}</span>
                  </div>
                )}
                {certificate.score && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Score:</span>
                    <span className="text-gray-900 dark:text-gray-100">{certificate.score}/100</span>
                  </div>
                )}
                {certificate.rank && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Rank:</span>
                    <span className="text-gray-900 dark:text-gray-100">#{certificate.rank}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Certificate #:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                    {certificate.certificateNumber}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handlePreview(certificate)}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleDownload(certificate)}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCertificate && (
        <CertificatePreviewModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

// Certificate Preview Modal
const CertificatePreviewModal = ({ certificate, onClose, onDownload }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Certificate Preview</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Certificate Header */}
            <div className="text-center">
              <div className="text-4xl mb-2">
                {certificate.type === 'winner' && '🏆'}
                {certificate.type === 'runner-up' && '🥈'}
                {certificate.type === 'special' && '💡'}
                {certificate.type === 'participation' && '📜'}
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {certificate.title}
              </h4>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {certificate.event?.name || 'Unknown Event'}
              </p>
            </div>

            {/* Certificate Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Event Theme:</span>
                <span className="text-gray-900 dark:text-gray-100">{certificate.event?.theme || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Event Location:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {certificate.event?.isVirtual ? 'Virtual Event' : (certificate.event?.location || 'N/A')}
                </span>
              </div>
              {certificate.team && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Team:</span>
                  <span className="text-gray-900 dark:text-gray-100">{certificate.team.name}</span>
                </div>
              )}
              {certificate.projectName && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Project:</span>
                  <span className="text-gray-900 dark:text-gray-100">{certificate.projectName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Issued Date:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {new Date(certificate.issuedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Certificate #:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                  {certificate.certificateNumber}
                </span>
              </div>
            </div>

            {/* Certificate Description */}
            {certificate.description && (
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h5>
                <p className="text-gray-600 dark:text-gray-400">{certificate.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Close
              </button>
              <button
                onClick={() => onDownload(certificate)}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
