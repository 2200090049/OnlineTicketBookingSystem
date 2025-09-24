import PropTypes from 'prop-types';
import { XMarkIcon, BuildingOfficeIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { Button } from '../index';

const VendorDetailsModal = ({ isOpen, onClose, vendor }) => {
  if (!isOpen || !vendor) return null;

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

  const getVendorTypeColor = (type) => {
    const colors = {
      'MOVIES_ADMIN': 'bg-purple-100 text-purple-800 border-purple-200',
      'TRAIN_ADMIN': 'bg-blue-100 text-blue-800 border-blue-200',
      'BUSES_ADMIN': 'bg-green-100 text-green-800 border-green-200',
      'Defualt': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getVendorTypeDisplay = (type) => {
    const displayNames = {
      'MOVIES_ADMIN': 'Movies Admin',
      'TRAIN_ADMIN': 'Train Admin',
      'BUSES_ADMIN': 'Buses Admin',
      'Defualt': 'Default'
    };
    return displayNames[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Vendor Details</h3>
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
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {vendor.username || vendor.name || 'Unknown Vendor'}
                </h4>
                <p className="text-sm text-gray-600">Vendor ID: {vendor.id}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(vendor.status)}`}>
                    {vendor.status || 'ACTIVE'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getVendorTypeColor(vendor.vendorType)}`}>
                    {getVendorTypeDisplay(vendor.vendorType) || 'Default'}
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
                  <p className="text-sm text-gray-600">{vendor.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{vendor.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-white border rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <TagIcon className="h-4 w-4 mr-2 text-gray-400" />
              Vendor Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor Type</p>
                <p className="mt-1 text-sm text-gray-900">{getVendorTypeDisplay(vendor.vendorType) || 'Default'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                <p className="mt-1 text-sm text-gray-900">{vendor.status || 'ACTIVE'}</p>
              </div>
              {vendor.companyName && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company Name</p>
                  <p className="mt-1 text-sm text-gray-900">{vendor.companyName}</p>
                </div>
              )}
              {vendor.businessLicense && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business License</p>
                  <p className="mt-1 text-sm text-gray-900">{vendor.businessLicense}</p>
                </div>
              )}
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
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Username</p>
                <p className="mt-1 text-sm text-gray-900">{vendor.username || vendor.vendorName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</p>
                <p className="mt-1 text-sm text-gray-900">{vendor.role || 'VENDOR'}</p>
              </div>
              {vendor.taxId && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tax ID</p>
                  <p className="mt-1 text-sm text-gray-900">{vendor.taxId}</p>
                </div>
              )}
              {vendor.registrationNumber && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registration Number</p>
                  <p className="mt-1 text-sm text-gray-900">{vendor.registrationNumber}</p>
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
                <p className="mt-1 text-sm text-gray-900">{formatDate(vendor.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Updated At</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(vendor.updatedAt)}</p>
              </div>
              {vendor.lastLogin && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Login</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(vendor.lastLogin)}</p>
                </div>
              )}
              {vendor.approvedAt && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Approved At</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(vendor.approvedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(vendor.description || vendor.website || vendor.address) && (
            <div className="bg-white border rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h5>
              <div className="grid grid-cols-1 gap-4">
                {vendor.description && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</p>
                    <p className="mt-1 text-sm text-gray-900">{vendor.description}</p>
                  </div>
                )}
                {vendor.website && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Website</p>
                    <p className="mt-1 text-sm text-gray-900">
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {vendor.website}
                      </a>
                    </p>
                  </div>
                )}
                {vendor.address && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                    <p className="mt-1 text-sm text-gray-900">{vendor.address}</p>
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

VendorDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  vendor: PropTypes.object,
};

export default VendorDetailsModal;
