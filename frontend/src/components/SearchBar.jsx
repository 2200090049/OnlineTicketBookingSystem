import { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch, 
  onClear,
  className = '',
  size = 'medium',
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch && onSearch(value);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    onClear && onClear();
    onSearch && onSearch('');
  };
  
  const sizes = {
    small: 'h-9 text-sm',
    medium: 'h-11 text-base',
    large: 'h-13 text-lg',
  };
  
  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6',
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon 
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary ${iconSizes[size]}`} 
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-primary-main focus:border-primary-main 
            transition-all duration-200 bg-white text-text-primary
            placeholder-text-secondary ${sizes[size]}
          `}
          {...props}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <XMarkIcon className={iconSizes[size]} />
          </button>
        )}
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default SearchBar;