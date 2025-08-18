import React, { useState } from 'react';
import { Trophy, Award, Download, Eye, Star, Medal, Crown, FileText } from 'lucide-react';
import { useToast } from '../ui/Toast';

const Certificates = () => {
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      type: 'winner',
      title: 'First Place Winner',
      event: 'Tech Innovation Hackathon 2024',
      date: '2024-01-15',
      participant: 'John Doe',
      team: 'Team Innovators',
      project: 'AI-Powered Healthcare Assistant',
      score: 95,
      downloadable: true,
      badge: '🏆'
    },
    {
      id: 2,
      type: 'participation',
      title: 'Participation Certificate',
      event: 'Web Development Challenge',
      date: '2024-01-10',
      participant: 'John Doe',
      team: 'Solo Participant',
      project: 'E-commerce Platform',
      score: null,
      downloadable: true,
      badge: '📜'
    },
    {
      id: 3,
      type: 'special',
      title: 'Most Innovative Solution',
      event: 'AI/ML Hackathon',
      date: '2024-01-05',
      participant: 'John Doe',
      team: 'AI Pioneers',
      project: 'Smart City Traffic Management',
      score: 88,
      downloadable: true,
      badge: '💡'
    }
  ]);

  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const { success, error } = useToast();

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

  const handleDownload = (certificate) => {
    // Simulate PDF generation and download
    success('Download Started', 'Certificate PDF is being generated...');
    
    // In a real app, this would generate and download a PDF
    setTimeout(() => {
      success('Download Complete', 'Certificate has been downloaded successfully!');
    }, 2000);
  };

  const handlePreview = (certificate) => {
    setSelectedCertificate(certificate);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Winners</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Special Awards</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Participation</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Crown className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">91</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <div
            key={certificate.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{certificate.badge}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{certificate.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{certificate.event}</p>
                </div>
              </div>
              {getCertificateIcon(certificate.type)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="text-gray-900 dark:text-gray-100">{new Date(certificate.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Team:</span>
                <span className="text-gray-900 dark:text-gray-100">{certificate.team}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Project:</span>
                <span className="text-gray-900 dark:text-gray-100 line-clamp-1">{certificate.project}</span>
              </div>
              {certificate.score && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Score:</span>
                  <span className="text-gray-900 dark:text-gray-100">{certificate.score}/100</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handlePreview(certificate)}
                className="flex-1 btn-outline flex items-center justify-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
              {certificate.downloadable && (
                <button
                  onClick={() => handleDownload(certificate)}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

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

          {/* Certificate Design */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">{certificate.badge}</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {certificate.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {certificate.event}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                This is to certify that
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {certificate.participant}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                from <span className="font-semibold">{certificate.team}</span>
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                has successfully participated in the hackathon with the project
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                "{certificate.project}"
              </p>
            </div>

            {certificate.score && (
              <div className="mb-6">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Achieved a score of
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {certificate.score}/100
                </p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Awarded on
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {new Date(certificate.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="border-t border-gray-300 dark:border-gray-600 pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Certificate ID: {certificate.id.toString().padStart(6, '0')}
              </p>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="btn-outline flex-1"
            >
              Close
            </button>
            {certificate.downloadable && (
              <button
                onClick={() => onDownload(certificate)}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
