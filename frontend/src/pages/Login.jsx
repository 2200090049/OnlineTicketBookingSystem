import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { TicketIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      // Redirect based on user role
      if (result.userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-500 via-primary-main to-purple-600 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white opacity-5 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white opacity-5 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-0 z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center text-white p-12">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <TicketIcon className="h-16 w-16 text-white" />
              <h1 className="text-5xl font-bold">TicketBook</h1>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold">Welcome Back!</h2>
              <p className="text-xl text-primary-light leading-relaxed max-w-md">
                Continue your journey with seamless booking experiences for movies, sports, and travel.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-8 w-8" />
                </div>
                <p className="text-sm">Premium Experience</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <TicketIcon className="h-8 w-8" />
                </div>
                <p className="text-sm">Instant Booking</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <EnvelopeIcon className="h-8 w-8" />
                </div>
                <p className="text-sm">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white border-opacity-20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-text-primary mb-2">Sign In</h2>
                <p className="text-text-secondary">Enter your credentials to continue</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-error bg-opacity-10 border border-error border-opacity-20 rounded-xl">
                  <p className="text-error text-sm text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Email Address</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-200 bg-surface focus:bg-white ${
                        formErrors.email 
                          ? 'border-error focus:border-error focus:ring-error' 
                          : 'border-gray-200 focus:border-primary-main focus:ring-primary-main'
                      } focus:ring-2 focus:ring-opacity-20 outline-none`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-error text-sm">{formErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl transition-all duration-200 bg-surface focus:bg-white ${
                        formErrors.password 
                          ? 'border-error focus:border-error focus:ring-error' 
                          : 'border-gray-200 focus:border-primary-main focus:ring-primary-main'
                      } focus:ring-2 focus:ring-opacity-20 outline-none`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-error text-sm">{formErrors.password}</p>
                  )}
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-main focus:ring-primary-main focus:ring-2" />
                    <span className="ml-2 text-sm text-text-secondary">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary-main hover:text-primary-dark transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-lg font-semibold"
                  size="large"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-text-secondary">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="text-primary-main hover:text-primary-dark font-semibold transition-colors">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;