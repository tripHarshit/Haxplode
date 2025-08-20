import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { isValidEmail } from '../../utils/helpers';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { signInWithPopup, GoogleAuthProvider, getIdToken } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from '../../services/firebase';

const LoginPage = () => {
  // Allow theme toggle; no forced light mode
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, loginWithGoogle, error: authError, clearError, user, getRedirectPath, isAuthenticated, startGoogleSignIn } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  // Clear auth errors when component mounts
  useEffect(() => {
    if (authError) {
      clearError();
    }
  }, [authError, clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User already authenticated, redirecting to dashboard');
      const redirectPath = getRedirectPath(user, from);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, getRedirectPath, from]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);



  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      if (window.navigationTester) {
        window.navigationTester.logAuthEvent('login_attempt', true, { email: formData.email });
      }
      
      const result = await login(formData);
      if (result.success) {
        setSuccessMessage('Login successful! Redirecting...');
        success('Welcome Back!', 'You have successfully logged in.');
      } else {
        setErrors({ general: result.error });
        showError('Login Failed', result.error);
        if (window.navigationTester) {
          window.navigationTester.logAuthEvent('login_attempt', false, { email: formData.email, error: result.error });
        }
      }
    } catch (error) {
      setErrors({ general: error.message });
      if (window.navigationTester) {
        window.navigationTester.logError(error, 'Login Form Submission');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Google login implementation
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrors({});
      
      if (!isFirebaseConfigured || !auth || !googleProvider) {
        throw new Error('Firebase Google authentication not configured');
      }

      const result = await signInWithPopup(auth, googleProvider);
      
      // Extract Google ID token from OAuth credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      let googleIdToken = credential?.idToken;
      
      if (!googleIdToken) {
        // Fallback: get ID token from Firebase user
        googleIdToken = await result.user.getIdToken(true);
      }

      if (!googleIdToken) {
        throw new Error('Failed to get Google ID token');
      }

      console.log('Google ID token obtained, calling backend...');
      
      // Call backend with Google ID token
      const apiResult = await loginWithGoogle(googleIdToken);
      
      if (apiResult?.requiresRegistration) {
        // Navigation to registration handled in context
        return;
      }

      if (apiResult.success) {
        setSuccessMessage('Google login successful! Redirecting...');
        setTimeout(() => {
          const redirectPath = getRedirectPath(user, from);
          navigate(redirectPath, { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error('Firebase Google login failed:', err);
      setErrors({ general: err.message || 'Google login failed' });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] || '';
  };

  const hasFieldError = (fieldName) => {
    return !!errors[fieldName];
  };

  return (
    <div className="min-h-screen bg-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold text-gradient">Haxplode</h1>
            </Link>
            <ThemeToggle />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Sign in to your account to continue
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg bg-success-50 border border-success-200 p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
              <p className="text-sm text-success-700">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-700 p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-error-600 mr-2" />
                <p className="text-sm text-error-700 dark:text-error-400">{errors.general}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`${hasFieldError('email') ? 'text-error-500' : 'text-neutral-400'} h-5 w-5`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-10 transition-colors ${
                    hasFieldError('email') 
                      ? 'border-error-500 focus:border-error-500 focus:ring-error-500' 
                      : 'focus:border-primary-500 focus:ring-primary-500'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {hasFieldError('email') && (
                <p className="mt-1 text-sm text-error-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getFieldError('email')}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`${hasFieldError('password') ? 'text-error-500' : 'text-neutral-400'} h-5 w-5`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 transition-colors ${
                    hasFieldError('password') 
                      ? 'border-error-500 focus:border-error-500 focus:ring-error-500' 
                      : 'focus:border-primary-500 focus:ring-primary-500'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-200" />
                  )}
                </button>
              </div>
              {hasFieldError('password') && (
                <p className="mt-1 text-sm text-error-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {getFieldError('password')}
                </p>
              )}
            </div>
          </div>

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center items-center py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </form>

        {/* Social login options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gradient px-2 text-neutral-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="btn-outline w-full flex justify-center items-center py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              {isGoogleLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-600 mr-2"></div>
                  Connecting to Google...
                </div>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
