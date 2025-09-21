import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PropTypes from 'prop-types';

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // If user is already authenticated, redirect to home
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // If user is authenticated, don't render the auth pages
  if (isAuthenticated) {
    return null;
  }

  // If not authenticated, render the auth pages (login/register)
  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthGuard;