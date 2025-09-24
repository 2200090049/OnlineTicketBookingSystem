import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Card } from '../index';

const AddItemModal = ({ 
  isOpen, 
  type, 
  mode, 
  initialData, 
  onClose, 
  onSubmit, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({});

  const resetForm = useCallback(() => {
    if (['train', 'movie', 'bus'].includes(type)) {
      setFormData({
        name: '',
        type: type,
        trainNumber: '',
        sourceStation: '',
        destinationStation: '',
        departureTime: '',
        arrivalTime: '',
        trainClass: 'SECOND_AC',
        genre: '',
        duration: '',
        rating: '',
        language: '',
        releaseDate: '',
        director: '',
        cast: '',
        busNumber: '',
        source: '',
        destination: '',
        busDepartureTime: '',
        busArrivalTime: '',
        busType: 'AC',
        totalSeats: '',
        price: '',
        description: ''
      });
    } else {
      setFormData({
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'USER',
        isVendor: type === 'vendor',
        vendorType: type === 'vendor' ? '' : null
      });
    }
  }, [type]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData(initialData);
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, initialData, type, resetForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const modalTitle = `${mode === 'edit' ? 'Edit' : 'Add New'} ${type.charAt(0).toUpperCase() + type.slice(1)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{modalTitle}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transport Form Fields */}
            {['train', 'movie', 'bus'].includes(type) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {type === 'train' ? 'Train' : type === 'movie' ? 'Movie' : 'Bus'} Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    name="totalSeats"
                    required
                    min="1"
                    value={formData.totalSeats || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  />
                </div>

                {/* Train specific fields */}
                {type === 'train' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Train Number *
                      </label>
                      <input
                        type="text"
                        name="trainNumber"
                        required
                        value={formData.trainNumber || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Train Class *
                      </label>
                      <select
                        name="trainClass"
                        required
                        value={formData.trainClass || 'SECOND_AC'}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      >
                        <option value="FIRST_AC">First AC</option>
                        <option value="SECOND_AC">Second AC</option>
                        <option value="THIRD_AC">Third AC</option>
                        <option value="SLEEPER">Sleeper</option>
                        <option value="GENERAL">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source Station *
                      </label>
                      <input
                        type="text"
                        name="sourceStation"
                        required
                        value={formData.sourceStation || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination Station *
                      </label>
                      <input
                        type="text"
                        name="destinationStation"
                        required
                        value={formData.destinationStation || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departure Time *
                      </label>
                      <input
                        type="time"
                        name="departureTime"
                        required
                        value={formData.departureTime || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arrival Time *
                      </label>
                      <input
                        type="time"
                        name="arrivalTime"
                        required
                        value={formData.arrivalTime || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {/* Movie specific fields */}
                {type === 'movie' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Genre *
                      </label>
                      <input
                        type="text"
                        name="genre"
                        required
                        value={formData.genre || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        name="duration"
                        required
                        min="1"
                        value={formData.duration || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating *
                      </label>
                      <select
                        name="rating"
                        required
                        value={formData.rating || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      >
                        <option value="">Select Rating</option>
                        <option value="U">U (Universal)</option>
                        <option value="U/A">U/A (Parental Guidance)</option>
                        <option value="A">A (Adults Only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language *
                      </label>
                      <input
                        type="text"
                        name="language"
                        required
                        value={formData.language || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Release Date *
                      </label>
                      <input
                        type="date"
                        name="releaseDate"
                        required
                        value={formData.releaseDate || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Director *
                      </label>
                      <input
                        type="text"
                        name="director"
                        required
                        value={formData.director || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cast
                      </label>
                      <input
                        type="text"
                        name="cast"
                        value={formData.cast || ''}
                        onChange={handleInputChange}
                        placeholder="Comma-separated list of actors"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {/* Bus specific fields */}
                {type === 'bus' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bus Number *
                      </label>
                      <input
                        type="text"
                        name="busNumber"
                        required
                        value={formData.busNumber || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bus Type *
                      </label>
                      <select
                        name="busType"
                        required
                        value={formData.busType || 'AC'}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      >
                        <option value="AC">AC</option>
                        <option value="NON_AC">Non-AC</option>
                        <option value="SLEEPER">Sleeper</option>
                        <option value="SEMI_SLEEPER">Semi-Sleeper</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source *
                      </label>
                      <input
                        type="text"
                        name="source"
                        required
                        value={formData.source || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination *
                      </label>
                      <input
                        type="text"
                        name="destination"
                        required
                        value={formData.destination || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departure Time *
                      </label>
                      <input
                        type="time"
                        name="busDepartureTime"
                        required
                        value={formData.busDepartureTime || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arrival Time *
                      </label>
                      <input
                        type="time"
                        name="busArrivalTime"
                        required
                        value={formData.busArrivalTime || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* User/Vendor Form Fields */}
            {['user', 'vendor'].includes(type) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  />
                </div>

                {mode === 'add' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    required
                    value={formData.role || 'USER'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    {type === 'vendor' && <option value="VENDOR">Vendor</option>}
                  </select>
                </div>

                {type === 'vendor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Type *
                    </label>
                    <select
                      name="vendorType"
                      required
                      value={formData.vendorType || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                    >
                      <option value="">Select Vendor Type</option>
                      <option value="TRAIN">Train Operator</option>
                      <option value="MOVIE">Theater Owner</option>
                      <option value="BUS">Bus Operator</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : `${mode === 'edit' ? 'Update' : 'Add'} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

AddItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['train', 'movie', 'bus', 'user', 'vendor']).isRequired,
  mode: PropTypes.oneOf(['add', 'edit']).isRequired,
  initialData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default AddItemModal;