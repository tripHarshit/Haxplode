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

const ReviewDetailsModal = ({ isOpen, onClose, submission }) => {
  if (!isOpen || !submission) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Review Summary</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">{submission.projectTitle || submission.projectName}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{submission.description || submission.projectDescription}</p>
          </div>
          {submission.reviewStatus === 'reviewed' ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-300">Score</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">{submission.judgeScore}/100</span>
              </div>
              {submission.judgeFeedback && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Feedback</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{submission.judgeFeedback}</p>
                </div>
              )}
              {submission.judgeCriteria && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Criteria Scores</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(submission.judgeCriteria).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
                        <span className="capitalize text-gray-600 dark:text-gray-300">{key.replace(/_/g,' ')}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {submission.reviewedAt && (
                <div className="text-xs text-gray-500 dark:text-gray-400">Reviewed on {new Date(submission.reviewedAt).toLocaleString()}</div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-300">No review available yet. Start a review to see the summary here.</div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Close</button>
        </div>
      </div>
    </div>
  );
};

const JudgeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showScoringForm, setShowScoringForm] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New state for hackathon view
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [hackathonSubmissions, setHackathonSubmissions] = useState([]);
  const [hackathonTeams, setHackathonTeams] = useState(new Map());

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
        
        // Don't fetch submissions here - we'll fetch them when a hackathon is selected
        if (isMounted) setSubmissions([]);
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
    // Reset hackathon selection when switching tabs
    if (tab !== 'submissions') {
      setSelectedHackathon(null);
      setHackathonSubmissions([]);
    }
  };

  const handleHackathonSelect = async (assignment) => {
    try {
      setSelectedHackathon(assignment);
      setHackathonSubmissions([]);
      
      const eventId = assignment.eventId;
      
      // Use the new API to get assigned submissions for this judge and event
      const assignedSubmissions = await judgeService.getAssignedSubmissions(eventId);
      
      // Map submissions to UI format with review status
      const mappedSubmissions = assignedSubmissions.map(sub => ({
        id: sub._id || sub.id,
        projectTitle: sub.projectName || 'Project',
        projectName: sub.projectName || 'Project',
        eventTitle: assignment.event?.name || `Event ${eventId}`,
        teamName: sub.teamName || 'Unknown Team',
        description: sub.projectDescription || '',
        projectDescription: sub.projectDescription || '',
        technologies: Array.isArray(sub.technologies) ? sub.technologies : [],
        submissionDate: sub.submissionDate || new Date().toISOString(),
        reviewStatus: sub.reviewStatus || 'assigned',
        priority: 'medium',
        timeSpent: 0,
        isUrgent: false,
        isApproachingDeadline: false,
        githubUrl: sub.githubLink,
        githubLink: sub.githubLink,
        demoUrl: sub.siteLink,
        siteLink: sub.siteLink,
        videoUrl: sub.videoLink,
        videoLink: sub.videoLink,
        docLink: sub.docLink,
        // Review data if already reviewed
        judgeScore: sub.judgeScore,
        judgeFeedback: sub.judgeFeedback,
        judgeCriteria: sub.judgeCriteria,
        reviewedAt: sub.reviewedAt,
        assignedAt: sub.assignedAt,
      }));
      
      setHackathonSubmissions(mappedSubmissions);
    } catch (error) {
      console.error('Failed to fetch hackathon submissions:', error);
      setError('Failed to load submissions for this hackathon');
    }
  };

  const handleBackToHackathons = () => {
    setSelectedHackathon(null);
    setHackathonSubmissions([]);
    setHackathonTeams(new Map());
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowDetails(true);
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
      
      // Use the new API to submit review
      await judgeService.submitReview({
        submissionId: reviewData.submissionId,
        score: reviewData.score,
        feedback: reviewData.feedback,
        criteria: reviewData.criteria,
        timeSpent: reviewData.timeSpent,
      });

      // Update local state
      setHackathonSubmissions(prev => prev.map(sub =>
        sub.id === reviewData.submissionId
          ? { 
              ...sub, 
              reviewStatus: 'reviewed', 
              judgeScore: reviewData.score,
              judgeFeedback: reviewData.feedback,
              judgeCriteria: reviewData.criteria,
              reviewedAt: new Date().toISOString()
            }
          : sub
      ));
      
      // Refresh analytics after submission
      try {
        const updatedAnalytics = await judgeService.getAnalytics();
        setAnalytics(updatedAnalytics);
      } catch (_) {}

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

  // Helper functions using real analytics
  const getTotalAssigned = () => (analytics?.completion?.assigned || 0);
  const getCompletedReviews = () => (analytics?.completion?.reviewed || 0);
  const getPendingReviews = () => Math.max(0, getTotalAssigned() - getCompletedReviews());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Judge Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Review submissions and provide feedback</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm min-h-screen">
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
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
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
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading dashboard</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
                </div>
              </div>
            </div>
          )}
          
          {!loading && !error && activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h2>
              
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
                  assignments={[{ assignedSubmissions: getTotalAssigned(), completedReviews: getCompletedReviews(), pendingReviews: getPendingReviews() }]}
                />
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Assigned</dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{getTotalAssigned()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Reviews</dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{getPendingReviews()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Urgent Reviews</dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{getUrgentSubmissions().length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity and Analytics Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivity activities={(analytics?.recent || []).map((evt, idx) => {
                  const type = evt.type;
                  // Build human-readable title/description based on event type
                  if (type === 'submission_reviewed') {
                    const score = evt?.metadata?.score;
                    const title = `Review submitted`;
                    const description = typeof score === 'number' ? `Completed review with score ${score}/100` : 'Completed a review';
                    return { id: evt._id || idx, type, title, description, timestamp: evt.ts || evt.createdAt };
                  }
                  if (type === 'submissions_assigned_to_judges') {
                    const count = evt?.metadata?.assignmentsCount || 0;
                    return { id: evt._id || idx, type: 'assignment_received', title: 'New assignments', description: `Received ${count} new assignment(s)`, timestamp: evt.ts || evt.createdAt };
                  }
                  // Fallback generic event
                  return { id: evt._id || idx, type: type || 'activity', title: evt.type || 'Activity', description: '', timestamp: evt.ts || evt.createdAt };
                })} />
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Quick Analytics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Completion Rate</span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {analytics?.completion?.rate || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics?.completion?.rate || 0}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getCompletedReviews()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{getPendingReviews()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && activeTab === 'submissions' && (
            <div className="space-y-6">
              {!selectedHackathon ? (
                // Show hackathon list
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Assigned Hackathons</h2>
                  {assignments.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hackathons assigned</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't been assigned to any hackathons yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.eventId}
                          onClick={() => handleHackathonSelect(assignment)}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 transform hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {assignment.event?.name || `Event ${assignment.eventId}`}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              assignment.role === 'Primary' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {assignment.role}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            {assignment.event?.description && (
                              <p className="text-gray-700 dark:text-gray-300">{assignment.event.description}</p>
                            )}
                            {assignment.event?.timeline && (
                              (() => {
                                try {
                                  const timeline = typeof assignment.event.timeline === 'string' 
                                    ? JSON.parse(assignment.event.timeline) 
                                    : assignment.event.timeline;
                                  return (
                                    <p>📅 {new Date(timeline.startDate).toLocaleDateString()} - {new Date(timeline.endDate).toLocaleDateString()}</p>
                                  );
                                } catch (e) {
                                  return null;
                                }
                              })()
                            )}
                            <p>Assigned: {new Date(assignment.assignedAt || Date.now()).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400">
                            <span className="text-sm font-medium">Click to view submissions</span>
                            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Show submissions for selected hackathon
                <div>
                  <div className="flex items-center mb-6">
                    <button
                      onClick={handleBackToHackathons}
                      className="mr-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedHackathon.event?.name || `Event ${selectedHackathon.eventId}`}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Role: {selectedHackathon.role} • {hackathonSubmissions.length} submissions
                      </p>
                    </div>
                  </div>
                  
                  {hackathonSubmissions.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No submissions yet</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This hackathon doesn't have any submissions yet.</p>
                    </div>
                  ) : (
                    <AssignedSubmissions
                      submissions={hackathonSubmissions}
                      onViewSubmission={handleViewSubmission}
                      onStartReview={handleStartReview}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {!loading && !error && activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Judge Analytics</h2>
              <JudgeAnalytics analytics={{
                totalReviews: analytics?.totals?.reviews || 0,
                averageScore: analytics?.totals?.averageScore || 0,
                averageTimePerReview: Math.round(((analytics?.time?.averageMs || 0) / 1000 / 60) * 10) / 10,
                completionRate: analytics?.completion?.rate || 0,
                scoreDistribution: analytics?.scoreDistribution || {},
                monthlyStats: analytics?.monthlyStats || [],
              }} />
            </div>
          )}

          {!loading && !error && activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <Leaderboard events={assignments.map(a => ({ id: a.eventId, name: a.event?.name || `Event ${a.eventId}` }))} />
            </div>
          )}
        </div>
      </div>

      {/* Scoring Form Modal */}
      {showScoringForm && reviewingSubmission && (
        <ScoringForm
          submission={reviewingSubmission}
          scoringCriteria={[
            {
              id: 'innovation',
              name: 'Innovation & Creativity',
              description: 'Originality and creative approach to solving the problem',
              weight: 25,
              maxScore: 10
            },
            {
              id: 'technical',
              name: 'Technical Quality',
              description: 'Code quality, architecture, and technical implementation',
              weight: 30,
              maxScore: 10
            },
            {
              id: 'ux',
              name: 'User Experience',
              description: 'Usability, design, and user interface quality',
              weight: 20,
              maxScore: 10
            },
            {
              id: 'feasibility',
              name: 'Feasibility & Scalability',
              description: 'Practical implementation and potential for growth',
              weight: 15,
              maxScore: 10
            },
            {
              id: 'presentation',
              name: 'Presentation & Documentation',
              description: 'Clarity of presentation and quality of documentation',
              weight: 10,
              maxScore: 10
            }
          ]}
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
      {/* Review Details Modal */}
      <ReviewDetailsModal
        isOpen={showDetails}
        onClose={() => { setShowDetails(false); setSelectedSubmission(null); }}
        submission={selectedSubmission}
      />
    </div>
  );
};

export default JudgeDashboard;
