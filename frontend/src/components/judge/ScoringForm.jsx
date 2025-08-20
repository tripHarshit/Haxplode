import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  DocumentArrowDownIcon, 
  PaperAirplaneIcon,
  FlagIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const ScoringForm = ({ 
  submission, 
  scoringCriteria, 
  isOpen, 
  onClose, 
  onSubmit, 
  onSaveDraft,
  existingScores = null 
}) => {
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);

  // Initialize scores from existing data or criteria
  useEffect(() => {
    if (existingScores) {
      setScores(existingScores);
      setFeedback(existingScores.feedback || '');
    } else {
      const initialScores = {};
      scoringCriteria.forEach(criteria => {
        initialScores[criteria.id] = 0;
      });
      setScores(initialScores);
    }
  }, [existingScores, scoringCriteria]);

  // Track time spent
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)); // minutes
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [isOpen, startTime]);

  const handleScoreChange = (criteriaId, value) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: Math.max(0, Math.min(10, value))
    }));
    
    // Clear validation error
    if (errors[criteriaId]) {
      setErrors(prev => ({ ...prev, [criteriaId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if all criteria have scores
    scoringCriteria.forEach(criteria => {
      if (!scores[criteria.id] || scores[criteria.id] === 0) {
        newErrors[criteria.id] = 'Score is required';
      }
    });
    
    // Check if feedback is provided
    if (!feedback.trim()) {
      newErrors.feedback = 'Feedback is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    
    scoringCriteria.forEach(criteria => {
      const score = scores[criteria.id] || 0;
      const weightedScore = (score / criteria.maxScore) * criteria.weight;
      totalScore += weightedScore;
      maxScore += criteria.weight;
    });
    
    return { totalScore: Math.round(totalScore * 10) / 10, maxScore };
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Log navigation test
      if (window.navigationTester) {
        window.navigationTester.logButtonClick('Save Draft', 'scoring_form');
        window.navigationTester.logFormSubmission('Scoring Form Draft', true);
      }
      
      const draftData = {
        submissionId: submission.id,
        scores,
        feedback,
        timeSpent,
        lastUpdated: new Date().toISOString(),
        status: 'draft'
      };
      
      await onSaveDraft(draftData);
      // Don't close modal, just save
    } catch (error) {
      console.error('Error saving draft:', error);
      if (window.navigationTester) {
        window.navigationTester.logError(error, 'Save Draft');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Log navigation test
      if (window.navigationTester) {
        window.navigationTester.logButtonClick('Submit Review', 'scoring_form');
        window.navigationTester.logFormSubmission('Scoring Form', true);
        window.navigationTester.logModalInteraction('Scoring Form Modal', 'submit');
      }
      
      const { totalScore, maxScore } = calculateTotalScore();
      
      const reviewData = {
        submissionId: submission.id,
        scores,
        feedback,
        totalScore,
        maxScore,
        timeSpent,
        submittedAt: new Date().toISOString(),
        status: 'completed'
      };
      
      await onSubmit(reviewData);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      if (window.navigationTester) {
        window.navigationTester.logError(error, 'Submit Review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Average';
    if (score >= 3) return 'Below Average';
    return 'Poor';
  };

  if (!isOpen) return null;

  const { totalScore, maxScore } = calculateTotalScore();
  const daysUntilDeadline = Math.ceil((new Date(submission.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Review Submission</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{submission.projectTitle} - {submission.teamName}</p>
          </div>
          <button
            onClick={() => {
              // Log navigation test
              if (window.navigationTester) {
                window.navigationTester.logButtonClick('Close Modal', 'scoring_form');
                window.navigationTester.logModalInteraction('Scoring Form Modal', 'close');
              }
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Project Overview */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Project Details</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{submission.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {submission.technologies.slice(0, 5).map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Quick Links</h4>
              <div className="space-y-2">
                <a
                  href={submission.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  📁 GitHub Repository
                </a>
                <a
                  href={submission.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  🚀 Live Demo
                </a>
                {submission.videoUrl && (
                  <a
                    href={submission.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    🎥 Demo Video
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Deadline Warning */}
        {daysUntilDeadline <= 2 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="text-orange-800 dark:text-orange-200 font-medium">
                Deadline approaching! {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} remaining.
              </span>
            </div>
          </div>
        )}

        {/* Scoring Form */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Scoring Criteria</h4>
          
          {scoringCriteria.map((criteria) => (
            <div key={criteria.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100">{criteria.name}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{criteria.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Weight: {criteria.weight}% | Max Score: {criteria.maxScore}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(scores[criteria.id] || 0)}`}>
                    {scores[criteria.id] || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getScoreLabel(scores[criteria.id] || 0)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={scores[criteria.id] || 0}
                  onChange={(e) => handleScoreChange(criteria.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              {errors[criteria.id] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[criteria.id]}</p>
              )}
            </div>
          ))}

          {/* Total Score Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-blue-900 dark:text-blue-100">Total Score</h5>
                <p className="text-sm text-blue-600 dark:text-blue-300">Weighted average based on criteria importance</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {totalScore}/{maxScore}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">
                  {Math.round((totalScore / maxScore) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detailed Feedback *
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                errors.feedback ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Provide detailed feedback on the project, including strengths, areas for improvement, and specific recommendations..."
            />
            {errors.feedback && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.feedback}</p>
            )}
          </div>

          {/* Time Tracking */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Time spent on this review: {timeSpent} minute{timeSpent !== 1 ? 's' : ''}</span>
              <span>Deadline: {format(new Date(submission.deadline), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex space-x-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 inline mr-1" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              
              <button
                onClick={() => {/* TODO: Implement flag functionality */}}
                className="px-4 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <FlagIcon className="h-4 w-4 inline mr-1" />
                Flag for Review
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-4 w-4 inline mr-1" />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringForm;
