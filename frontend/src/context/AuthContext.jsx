import { createContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authAPI } from '../services/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  OTP_SENT: 'OTP_SENT',
  OTP_VERIFY_START: 'OTP_VERIFY_START',
  OTP_VERIFY_SUCCESS: 'OTP_VERIFY_SUCCESS',
  OTP_VERIFY_FAILURE: 'OTP_VERIFY_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.OTP_VERIFY_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user || state.user, // Set user if provided, otherwise keep current
        isAuthenticated: !!action.payload.user, // Set authenticated if user is provided
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.OTP_VERIFY_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };
    
    case AUTH_ACTIONS.OTP_SENT:
      return {
        ...state,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.OTP_VERIFY_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: { user },
        });
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await authAPI.login({ email, password });
      
      // Backend returns { message, user, token } format
      if (response.data.message === "Login successful" && response.data.token) {
        const { user, token } = response.data;
        
        console.log('Login successful, storing token and user data:', { user, token });
        
        // Store in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user },
        });
        
        return { success: true, userRole: user.role };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function - Initiate registration with OTP
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      // Prepare data in the format expected by backend
      const registerData = {
        username: userData.name, // Backend expects 'username', frontend has 'name'
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: 'USER' // Explicitly set role as USER for frontend registrations
      };
      
      const response = await authAPI.register(registerData);
      
      // Backend now sends OTP for verification
      if (response.data.message && response.data.message.includes('OTP sent')) {
        dispatch({
          type: AUTH_ACTIONS.OTP_SENT,
          payload: { email: userData.email },
        });
        
        return { 
          success: true, 
          message: response.data.message,
          requiresOTP: true,
          email: userData.email
        };
      } else {
        throw new Error('Unexpected response from registration endpoint');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  // Verify OTP function
  const verifyOtp = async (email, otp) => {
    dispatch({ type: AUTH_ACTIONS.OTP_VERIFY_START });
    
    try {
      const response = await authAPI.verifyOtp({ email, otp });
      
      if (response.data.message === "Registration successful" && response.data.token) {
        const { user, token } = response.data;
        
        console.log('OTP verification successful, storing token and user data:', { user, token });
        
        // Store in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        dispatch({
          type: AUTH_ACTIONS.OTP_VERIFY_SUCCESS,
          payload: { user },
        });
        
        return { 
          success: true, 
          message: response.data.message,
          user: user
        };
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      dispatch({
        type: AUTH_ACTIONS.OTP_VERIFY_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  // Resend OTP function
  const resendOtp = async (email) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      const response = await authAPI.resendOtp({ email });
      
      dispatch({
        type: AUTH_ACTIONS.OTP_SENT,
        payload: { email },
      });
      
      return { 
        success: true, 
        message: response.data.message
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };


  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;