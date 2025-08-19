import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { judgeService } from '../../services/judgeService';
import { teamService } from '../../services/teamService';
import JudgeProfile from '../../components/judge/JudgeProfile';
import AssignedSubmissions from '../../components/judge/AssignedSubmissions';
import ScoringForm from '../../components/judge/ScoringForm';
import JudgeAnalytics from '../../components/judge/JudgeAnalytics';
import RecentActivity from '../../components/judge/RecentActivity';
import Leaderboard from '../../components/common/Leaderboard';

const JudgeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showScoringForm, setShowScoringForm] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Socket.io integration for real-time updates
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const [judgeProfile, eventAssignments, judgeAnalytics] = await Promise.all([
          judgeService.getProfile(),
          judgeService.getEvents(),
          judgeService.getAnalytics(),
        ]);
        if (!isMounted) return;
        setProfile(judgeProfile);
        setAssignments(eventAssignments);
        setAnalytics(judgeAnalytics);
        const firstEvent = eventAssignments?.[0]?.event || null;
        const firstEventId = firstEvent?.id || eventAssignments?.[0]?.eventId;
        if (firstEventId) {
          const [subs, teams] = await Promise.all([
            judgeService.getSubmissionsByEvent(firstEventId),
            teamService.getTeamsByEvent(firstEventId),
          ]);
          const teamIdToName = new Map((teams || []).map(t => [t.id, t.teamName]));
          if (isMounted) setSubmissions(subs.map(s => mapBackendSubmissionToUI(s, teamIdToName, firstEvent?.name)));
        } else {
          setSubmissions([]);
        }
      } catch (e) {
        if (isMounted) setError(e?.message || 'Failed to load judge data');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const mapBackendSubmissionToUI = (sub, teamIdToName = new Map(), eventName = '') => ({
    id: sub._id || sub.id,
    projectTitle: sub.projectName || sub.projectTitle || 'Project',
    eventTitle: eventName || '',
    teamName: teamIdToName.get(sub.teamId) || '',
    description: sub.projectDescription || '',
    technologies: Array.isArray(sub.technologies) ? sub.technologies : [],
    submissionDate: sub.submissionDate || sub.createdAt || new Date().toISOString(),
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewStatus: 'assigned',
    priority: 'medium',
    timeSpent: 0,
    isUrgent: false,
    isApproachingDeadline: false,
    githubUrl: sub.githubLink,
    demoUrl: sub.docLink,
    videoUrl: sub.videoLink,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    // TODO: Show submission details modal
  };

  const handleStartReview = (submission) => {
    // Log navigation test
    if (window.navigationTester) {
      window.navigationTester.logButtonClick('Start Review', 'judge_dashboard');
      window.navigationTester.logModalInteraction('Scoring Form Modal', 'open');
    }
    setReviewingSubmission(submission);
    setShowScoringForm(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      // Log navigation test
      if (window.navigationTester) {
        window.navigationTester.logButtonClick('Submit Review', 'judge_dashboard');
        window.navigationTester.logFormSubmission('Scoring Form', true);
        window.navigationTester.logModalInteraction('Scoring Form Modal', 'submit');
      }
      
      // Persist to backend
      await judgeService.submitScore({
        submissionId: reviewData.submissionId,
        score: Math.round(reviewData.totalScore),
        feedback: reviewData.feedback,
        criteria: reviewData.scores,
      });

      // Update local state
      setSubmissions(prev => prev.map(sub =>
        sub.id === reviewData.submissionId
          ? { ...sub, reviewStatus: 'completed', scores: reviewData.scores, feedback: reviewData.feedback }
          : sub
      ));
      
      setShowScoringForm(false);
      setReviewingSubmission(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      if (window.navigationTester) {
        window.navigationTester.logError(error, 'Submit Review');
      }
    }
  };

  const handleSaveDraft = async (draftData) => {
    try {
      // Log navigation test
      if (window.navigationTester) {
        window.navigationTester.logButtonClick('Save Draft', 'judge_dashboard');
        window.navigationTester.logFormSubmission('Scoring Form Draft', true);
      }
      
      // For now, only update local state (no backend draft endpoint)
      setSubmissions(prev => prev.map(sub =>
        sub.id === draftData.submissionId
          ? { ...sub, reviewStatus: 'in_progress', scores: draftData.scores, feedback: draftData.feedback }
          : sub
      ));
    } catch (error) {
      console.error('Error saving draft:', error);
      if (window.navigationTester) {
        window.navigationTester.logError(error, 'Save Draft');
      }
    }
  };

  const getUrgentSubmissions = () => {
    return submissions.filter(sub => sub.isUrgent || sub.isApproachingDeadline);
  };

  const getTotalAssigned = () => submissions.length;
  const getCompletedReviews = () => submissions.filter(sub => sub.reviewStatus === 'completed').length;
  const getPendingReviews = () => submissions.filter(sub => sub.reviewStatus !== 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Judge Dashboard</h1>
              <p className="text-gray-600">Review submissions and provide feedback</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                { id: 'submissions', label: 'Assigned Submissions', icon: ClipboardDocumentListIcon },
                { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
                { id: 'leaderboard', label: 'Leaderboard', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              
              {/* Judge Profile */}
              {profile && (
                <JudgeProfile 
                  profile={{
                    avatar: profile?.user?.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.user?.fullName || 'Judge'),
                    name: profile?.user?.fullName || 'Judge',
                    position: profile?.position || '',
                    organization: profile?.company || '',
                    expertise: profile?.expertise || [],
                    lastActive: new Date().toISOString(),
                    totalReviews: analytics?.totals?.reviews || 0,
                    averageScore: analytics?.totals?.averageScore || 0,
                    reviewAccuracy: 100,
                    experience: (profile?.yearsOfExperience || 0) + ' yrs',
                  }} 
                  assignments={assignments.map(a => ({ assignedSubmissions: 0, completedReviews: 0, pendingReviews: 0 }))}
                />
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Assigned</dt>
                        <dd className="text-lg font-medium text-gray-900">{getTotalAssigned()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Reviews</dt>
                        <dd className="text-lg font-medium text-gray-900">{getPendingReviews()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Urgent Reviews</dt>
                        <dd className="text-lg font-medium text-gray-900">{getUrgentSubmissions().length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity and Analytics Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivity activities={[]} />
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Analytics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-lg font-semibold text-green-600">
                        {Math.round((getCompletedReviews() / getTotalAssigned()) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(getCompletedReviews() / getTotalAssigned()) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Assigned Submissions</h2>
              <AssignedSubmissions
                submissions={submissions}
                onViewSubmission={handleViewSubmission}
                onStartReview={handleStartReview}
              />
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Judge Analytics</h2>
              <JudgeAnalytics analytics={{
                totalReviews: analytics?.totals?.reviews || 0,
                averageScore: analytics?.totals?.averageScore || 0,
                averageTimePerReview: 0,
                completionRate: submissions.length ? Math.round((submissions.filter(s => s.reviewStatus === 'completed').length / submissions.length) * 100) : 0,
                scoreDistribution: {},
                monthlyStats: [],
              }} />
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <Leaderboard />
            </div>
          )}
        </div>
      </div>

      {/* Scoring Form Modal */}
      {showScoringForm && reviewingSubmission && (
        <ScoringForm
          submission={reviewingSubmission}
          scoringCriteria={[{ id: 'overall', name: 'Overall', description: 'Overall score', weight: 100, maxScore: 10 }]}
          isOpen={showScoringForm}
          onClose={() => {
            setShowScoringForm(false);
            setReviewingSubmission(null);
          }}
          onSubmit={handleSubmitReview}
          onSaveDraft={handleSaveDraft}
          existingScores={reviewingSubmission.scores}
        />
      )}
    </div>
  );
};

export default JudgeDashboard;
