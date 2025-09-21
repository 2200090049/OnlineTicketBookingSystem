import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  hover = false,
  clickable = false,
  onClick,
  padding = 'medium',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-soft border border-gray-100 transition-all duration-200';
  
  const paddingClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
    none: '',
  };
  
  const hoverClasses = hover || clickable ? 'hover:shadow-medium hover:-translate-y-1' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${clickableClasses} ${className}`;
  
  const content = (
    <>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </>
  );
  
  if (clickable && onClick) {
    return (
      <div
        onClick={onClick}
        className={classes}
        {...props}
      >
        {content}
      </div>
    );
  }
  
  return (
    <div className={classes} {...props}>
      {content}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  hover: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  padding: PropTypes.oneOf(['small', 'medium', 'large', 'none']),
};

export default Card;