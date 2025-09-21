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
  OTP_VERIFICATION_START: 'OTP_VERIFICATION_START',
  OTP_VERIFICATION_SUCCESS: 'OTP_VERIFICATION_SUCCESS',
  OTP_VERIFICATION_FAILURE: 'OTP_VERIFICATION_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.OTP_VERIFICATION_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.OTP_VERIFICATION_SUCCESS:
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
        isLoading: false,
        error: null,
        // Don't set authenticated yet, waiting for OTP verification
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.OTP_VERIFICATION_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
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
        
        // Store in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user },
        });
        
        return { success: true };
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

  // Register function (Step 1: Send registration data)
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      // Prepare data in the format expected by backend
      const registerData = {
        username: userData.name, // Backend expects 'username', frontend has 'name'
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
      };
      
      const response = await authAPI.register(registerData);
      
      // Registration initiated successfully, OTP sent
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { message: response.data.message || 'OTP sent successfully' },
      });
      
      return { 
        success: true, 
        message: response.data.message || 'OTP sent to your email',
        email: userData.email 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  // OTP Verification function (Step 2: Verify OTP)
  const verifyOtp = async (email, otp) => {
    dispatch({ type: AUTH_ACTIONS.OTP_VERIFICATION_START });
    
    try {
      const response = await authAPI.verifyOtp({ email, otp });
      
      if (response.data.success || response.data.message === 'Registration successful') {
        const user = response.data.user || {
          email: email,
          username: response.data.username,
        };
        
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('userData', JSON.stringify(user));
        }
        
        dispatch({
          type: AUTH_ACTIONS.OTP_VERIFICATION_SUCCESS,
          payload: { user },
        });
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      dispatch({
        type: AUTH_ACTIONS.OTP_VERIFICATION_FAILURE,
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