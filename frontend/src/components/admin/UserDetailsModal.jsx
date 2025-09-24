import PropTypes from 'prop-types';
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Button } from '../index';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'INACTIVE': 'bg-red-100 text-red-800 border-red-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'SUSPENDED': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleColor = (role) => {
    const colors = {
      'ADMIN': 'bg-purple-100 text-purple-800 border-purple-200',
      'VENDOR': 'bg-blue-100 text-blue-800 border-blue-200',
      'USER': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {user.username || user.name || 'Unknown User'}
                </h4>
                <p className="text-sm text-gray-600">User ID: {user.id}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.status)}`}>
                    {user.status || 'ACTIVE'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.role)}`}>
                    {user.role || 'USER'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{user.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{user.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <IdentificationIcon className="h-4 w-4 mr-2 text-gray-400" />
              Account Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</p>
                <p className="mt-1 text-sm text-gray-900">{user.role || 'USER'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                <p className="mt-1 text-sm text-gray-900">{user.status || 'ACTIVE'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor</p>
                <p className="mt-1 text-sm text-gray-900">{user.vendor ? 'Yes' : 'No'}</p>
              </div>
              {user.vendor && user.vendorType && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor Type</p>
                  <p className="mt-1 text-sm text-gray-900">{user.vendorType}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
              Timestamps
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created At</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Updated At</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(user.updatedAt)}</p>
              </div>
              {user.lastLogin && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Login</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(user.lastLogin)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(user.firstName || user.lastName || user.dateOfBirth || user.address) && (
            <div className="bg-white border rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.firstName && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">First Name</p>
                    <p className="mt-1 text-sm text-gray-900">{user.firstName}</p>
                  </div>
                )}
                {user.lastName && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Name</p>
                    <p className="mt-1 text-sm text-gray-900">{user.lastName}</p>
                  </div>
                )}
                {user.dateOfBirth && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(user.dateOfBirth)}</p>
                  </div>
                )}
                {user.address && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                    <p className="mt-1 text-sm text-gray-900">{user.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

UserDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default UserDetailsModal;
