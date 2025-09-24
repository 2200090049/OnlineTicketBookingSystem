import React, { useState, useEffect, useCallback } from 'react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import DataTable from './DataTable';
import VendorForm from './VendorForm';
import VendorDetailsModal from './VendorDetailsModal';
import * as adminAPI from '../../services/adminAPI';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorTypeFilter, setVendorTypeFilter] = useState('');
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const loadVendors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clean parameters - only pass non-empty values
      const cleanSearch = searchQuery?.trim() || '';
      const cleanVendorType = vendorTypeFilter?.trim() || '';
      
      const response = await adminAPI.getAllVendors(currentPage, 10, cleanSearch, cleanVendorType);
      
      console.log('Vendors API Response:', response); // Debug log
      
      // Handle different response structures
      if (response && typeof response === 'object') {
        // Check for paginated response structure
        if (response.vendors && Array.isArray(response.vendors)) {
          setVendors(response.vendors);
          setTotalPages(response.totalPages || Math.ceil((response.totalElements || response.vendors.length) / 10));
          setTotalElements(response.totalElements || response.vendors.length);
        }
        // Check for direct array response
        else if (Array.isArray(response)) {
          setVendors(response);
          setTotalPages(Math.ceil(response.length / 10));
          setTotalElements(response.length);
        }
        // Check for content-based pagination (Spring Boot default)
        else if (response.content && Array.isArray(response.content)) {
          setVendors(response.content);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || response.content.length);
        }
        // Fallback for unexpected structure
        else {
          console.warn('Unexpected vendors response structure:', response);
          setVendors([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        setVendors([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to load vendors';
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      setVendors([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, vendorTypeFilter]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const columns = [
    {
      key: 'vendor',
      header: 'Vendor',
      render: (vendor) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {vendor.username || vendor.name || 'Unknown'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (vendor) => vendor.email || 'N/A',
    },
    {
      key: 'vendorType',
      header: 'Type',
      render: (vendor) => {
        const typeMap = {
          'MOVIES_ADMIN': 'Movies',
          'TRAIN_ADMIN': 'Train',
          'BUSES_ADMIN': 'Buses',
          'Default': 'Default'
        };
        return typeMap[vendor.vendorType] || vendor.vendorType || 'N/A';
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (vendor) => {
        const status = vendor.status || 'ACTIVE';
        const statusColors = {
          'ACTIVE': 'bg-green-100 text-green-800',
          'INACTIVE': 'bg-red-100 text-red-800',
          'PENDING': 'bg-yellow-100 text-yellow-800',
          'SUSPENDED': 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
          </span>
        );
      },
    },
  ];

  const handleAddVendor = async (vendorData) => {
    try {
      setError(null);
      await adminAPI.addVendor(vendorData);
      await loadVendors();
      setShowVendorForm(false);
      console.log('Vendor added successfully!');
    } catch (error) {
      console.error('Error adding vendor:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add vendor';
      setError(errorMessage);
    }
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setShowVendorForm(true);
  };

  const handleUpdateVendor = async (vendorData) => {
    try {
      setError(null);
      await adminAPI.updateVendor(editingVendor.id, vendorData);
      await loadVendors();
      setShowVendorForm(false);
      setEditingVendor(null);
      console.log('Vendor updated successfully!');
    } catch (error) {
      console.error('Error updating vendor:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update vendor';
      setError(errorMessage);
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await adminAPI.deleteVendor(vendorId);
      await loadVendors();
      console.log('Vendor deleted successfully!');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete vendor';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query || '');
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handleVendorTypeFilter = (vendorType) => {
    setVendorTypeFilter(vendorType || '');
    setCurrentPage(0);
  };

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorDetails(true);
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <DataTable
        title="Vendor Management"
        description={`Manage all system vendors (${totalElements} total)`}
        data={vendors}
        columns={columns}
        isLoading={isLoading}
        onAdd={() => {
          setEditingVendor(null);
          setShowVendorForm(true);
        }}
        onEdit={handleEditVendor}
        onDelete={handleDeleteVendor}
        onView={handleViewVendor}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onStatusFilter={handleVendorTypeFilter}
        currentPage={currentPage}
        searchQuery={searchQuery}
        statusFilter={vendorTypeFilter}
        addButtonText="Add Vendor"
        emptyIcon={BuildingOfficeIcon}
        emptyTitle="No vendors found"
        emptyDescription="Get started by adding your first vendor."
        totalPages={totalPages}
      />
      
      <VendorForm
        isOpen={showVendorForm}
        onClose={() => {
          setShowVendorForm(false);
          setEditingVendor(null);
        }}
        onSubmit={editingVendor ? handleUpdateVendor : handleAddVendor}
        vendor={editingVendor}
        isLoading={isLoading}
      />
      
      <VendorDetailsModal
        isOpen={showVendorDetails}
        onClose={() => {
          setShowVendorDetails(false);
          setSelectedVendor(null);
        }}
        vendor={selectedVendor}
      />
    </div>
  );
};

export default VendorManagement;