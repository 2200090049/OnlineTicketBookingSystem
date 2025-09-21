import { useState } from 'react';

import SearchBar from '../components/SearchBar';

const Movies = () => {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  const genres = ['all', 'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];
  const languages = ['all', 'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam'];




  

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Movies</h1>
          
          {/* Search and Filters */}
          <div className="space-y-4">
            <SearchBar
              placeholder="Search movies..."
              className="max-w-md"
            />
            
            <div className="flex flex-wrap gap-4">
              {/* Genre Filter */}
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-text-secondary mb-1">
                  Genre
                </label>
                <select
                  id="genre"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-main focus:border-primary-main"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre === 'all' ? 'All Genres' : genre}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Language Filter */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-text-secondary mb-1">
                  Language
                </label>
                <select
                  id="language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-main focus:border-primary-main"
                >
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language === 'all' ? 'All Languages' : language}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1>Need to Implement Movie Grid</h1>
      </div>
    </div>
  );
};

export default Movies;