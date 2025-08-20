import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, User, Calendar, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useForceLightMode } from '../../context/ThemeContext';

const GoogleRegisterPage = () => {
  useForceLightMode();
  const location = useLocation();
  const navigate = useNavigate();
  const { completeGoogleRegistration } = useAuth();

  const prefill = location.state?.prefill || {};
  const idToken = location.state?.idToken || '';

  const [formData, setFormData] = useState({
    name: prefill.fullName || '',
    email: prefill.email || '',
    role: 'participant',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!idToken || !prefill?.email) {
      navigate('/register', { replace: true });
    }
  }, [idToken, prefill, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 2) newErrors.name = 'Full name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const result = await completeGoogleRegistration({ idToken, name: formData.name, dateOfBirth: formData.dateOfBirth, role: formData.role === 'participant' ? 'Participant' : formData.role.charAt(0).toUpperCase() + formData.role.slice(1) });
      if (result.success) {
        setSuccessMessage('Registration completed! Redirecting...');
      }
    } catch (err) {
      setErrors({ general: err.message || 'Failed to complete registration' });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field) => errors[field] || '';
  const hasFieldError = (field) => !!errors[field];

  return (
    <div className="min-h-screen bg-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gradient">Haxplode</h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900">Complete your profile</h2>
          <p className="mt-2 text-sm text-neutral-600">We got your email from Google. No password needed.</p>
        </div>

        {successMessage && (
          <div className="rounded-lg bg-success-50 border border-success-200 p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
              <p className="text-sm text-success-700">{successMessage}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="rounded-lg bg-error-50 border border-error-200 p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-error-600 mr-2" />
                <p className="text-sm text-error-700">{errors.general}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`${hasFieldError('email') ? 'text-error-500' : 'text-neutral-400'} h-5 w-5`} />
                </div>
                <input id="email" name="email" type="email" value={formData.email} className="input pl-10" disabled />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`${hasFieldError('name') ? 'text-error-500' : 'text-neutral-400'} h-5 w-5`} />
                </div>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={`input pl-10 ${hasFieldError('name') ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`} placeholder="Enter your full name" />
              </div>
              {hasFieldError('name') && (
                <p className="mt-1 text-sm text-error-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getFieldError('name')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-neutral-700 mb-2">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className={`${hasFieldError('dateOfBirth') ? 'text-error-500' : 'text-neutral-400'} h-5 w-5`} />
                </div>
                <input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} className={`input pl-10 ${hasFieldError('dateOfBirth') ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`} />
              </div>
              {hasFieldError('dateOfBirth') && (
                <p className="mt-1 text-sm text-error-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getFieldError('dateOfBirth')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-neutral-700 mb-2">I want to join as a</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="input">
                <option value="participant">Participant</option>
                <option value="organizer">Organizer</option>
                <option value="judge">Judge</option>
              </select>
            </div>
          </div>

          <div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex justify-center items-center py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleRegisterPage;


