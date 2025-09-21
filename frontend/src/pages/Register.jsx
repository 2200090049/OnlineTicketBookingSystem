import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  PhoneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { TicketIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const Register = () => {
  const navigate = useNavigate();
  const { register, verifyOtp, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Personal Details, 2: Password, 3: OTP Verification

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

  const validateStep1 = () => {
    const errors = {};
    if (!formData.name) {
      errors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = 'Enter a valid 10-digit phone number';
    }
    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleNextStep = () => {
    const errors = validateStep1();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateStep2();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const result = await register(formData);
    if (result.success) {
      // Move to OTP verification step
      setStep(3);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setFormErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    const result = await verifyOtp(formData.email, otp);
    if (result.success) {
      navigate('/');
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];
  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-500 via-primary-main to-purple-600 flex items-center justify-center p-4">
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
              <h2 className="text-3xl font-semibold">Join the Experience!</h2>
              <p className="text-xl text-primary-light leading-relaxed max-w-md">
                Create your account and unlock a world of entertainment at your fingertips.
              </p>
            </div>

            <div className="space-y-4 mt-12">
              <div className="flex items-center space-x-4 bg-white bg-opacity-10 rounded-2xl p-4">
                <CheckCircleIcon className="h-8 w-8 text-green-300" />
                <span className="text-lg">Instant booking confirmations</span>
              </div>
              <div className="flex items-center space-x-4 bg-white bg-opacity-10 rounded-2xl p-4">
                <CheckCircleIcon className="h-8 w-8 text-green-300" />
                <span className="text-lg">Exclusive deals and offers</span>
              </div>
              <div className="flex items-center space-x-4 bg-white bg-opacity-10 rounded-2xl p-4">
                <CheckCircleIcon className="h-8 w-8 text-green-300" />
                <span className="text-lg">Secure payment processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Registration Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white border-opacity-20">
              {/* Progress Indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary-main' : 'bg-gray-300'}`}></div>
                  <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary-main' : 'bg-gray-300'} rounded`}></div>
                  <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary-main' : 'bg-gray-300'}`}></div>
                  <div className={`w-12 h-1 ${step >= 3 ? 'bg-primary-main' : 'bg-gray-300'} rounded`}></div>
                  <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-primary-main' : 'bg-gray-300'}`}></div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-text-primary mb-2">
                  {step === 1 ? 'Personal Details' : step === 2 ? 'Create Password' : 'Verify Email'}
                </h2>
                <p className="text-text-secondary">
                  {step === 1 ? 'Tell us about yourself' : step === 2 ? 'Secure your account' : 'Enter the OTP sent to your email'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-error bg-opacity-10 border border-error border-opacity-20 rounded-xl">
                  <p className="text-error text-sm text-center">{error}</p>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-200 bg-surface focus:bg-white ${
                          formErrors.name 
                            ? 'border-error focus:border-error focus:ring-error' 
                            : 'border-gray-200 focus:border-primary-main focus:ring-primary-main'
                        } focus:ring-2 focus:ring-opacity-20 outline-none`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-error text-sm">{formErrors.name}</p>
                    )}
                  </div>

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

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Phone Number</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-200 bg-surface focus:bg-white ${
                          formErrors.phone 
                            ? 'border-error focus:border-error focus:ring-error' 
                            : 'border-gray-200 focus:border-primary-main focus:ring-primary-main'
                        } focus:ring-2 focus:ring-opacity-20 outline-none`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-error text-sm">{formErrors.phone}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full py-4 text-lg font-semibold" size="large">
                    Continue
                  </Button>
                </form>
              ) : step === 2 ? (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        placeholder="Create a strong password"
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
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded ${
                                i < passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200'
                              }`}
                            ></div>
                          ))}
                        </div>
                        <p className={`text-xs ${passwordStrength >= 4 ? 'text-green-600' : 'text-orange-600'}`}>
                          {strengthLabels[passwordStrength]}
                        </p>
                      </div>
                    )}
                    {formErrors.password && (
                      <p className="text-error text-sm">{formErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Confirm Password</label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl transition-all duration-200 bg-surface focus:bg-white ${
                          formErrors.confirmPassword 
                            ? 'border-error focus:border-error focus:ring-error' 
                            : 'border-gray-200 focus:border-primary-main focus:ring-primary-main'
                        } focus:ring-2 focus:ring-opacity-20 outline-none`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-error text-sm">{formErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 text-lg font-semibold"
                      size="large"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </form>
              ) : step === 3 ? (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-text-secondary">
                      We&apos;ve sent a 6-digit verification code to{' '}
                      <span className="font-semibold text-text-primary">{formData.email}</span>
                    </p>
                  </div>

                  {/* OTP Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(value);
                        if (formErrors.otp) {
                          setFormErrors(prev => ({ ...prev, otp: '' }));
                        }
                      }}
                      className={`w-full px-4 py-4 text-center text-2xl tracking-widest border-2 rounded-xl transition-all duration-200 bg-surface focus:bg-white ${
                        formErrors.otp 
                          ? 'border-error focus:border-error focus:ring-error' 
                          : 'border-gray-200 focus:border-primary-main focus:ring-primary-main'
                      } focus:ring-2 focus:ring-opacity-20 outline-none`}
                      placeholder="000000"
                      maxLength="6"
                    />
                    {formErrors.otp && (
                      <p className="text-error text-sm">{formErrors.otp}</p>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 py-4"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 text-lg font-semibold"
                      size="large"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        'Verify & Complete'
                      )}
                    </Button>
                  </div>
                </form>
              ) : null}

              {/* Sign In Link */}
              <div className="mt-8 text-center">
                <p className="text-text-secondary">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-main hover:text-primary-dark font-semibold transition-colors">
                    Sign in here
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

export default Register;