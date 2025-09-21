import PropTypes from 'prop-types';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-main hover:bg-primary-dark text-white focus:ring-primary-main shadow-md hover:shadow-lg',
    secondary: 'bg-surface hover:bg-gray-100 text-text-primary border border-gray-300 focus:ring-primary-main',
    success: 'bg-success hover:bg-green-600 text-white focus:ring-green-500 shadow-md hover:shadow-lg',
    warning: 'bg-warning hover:bg-yellow-500 text-white focus:ring-yellow-500 shadow-md hover:shadow-lg',
    error: 'bg-error hover:bg-red-600 text-white focus:ring-red-500 shadow-md hover:shadow-lg',
    info: 'bg-info hover:bg-blue-600 text-white focus:ring-blue-500 shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary-main text-primary-main hover:bg-primary-main hover:text-white focus:ring-primary-main',
    ghost: 'text-primary-main hover:bg-primary-light hover:bg-opacity-10 focus:ring-primary-main',
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'outline', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default Button;