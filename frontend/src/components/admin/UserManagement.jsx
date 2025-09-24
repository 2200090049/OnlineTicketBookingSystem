import React, { useState, useEffect, useCallback } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { Button } from '../index';
import * as adminAPI from '../../services/adminAPI';
import DataTable from './DataTable';
import UserForm from './UserForm';
import UserDetailsModal from './UserDetailsModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clean parameters - only pass non-empty values
      const cleanSearch = searchQuery?.trim() || '';
      const cleanStatus = statusFilter?.trim() || '';
      
      const response = await adminAPI.getAllUsers(currentPage, 10, cleanSearch, cleanStatus);
      
      console.log('API Response:', response); // Debug log
      
      // Handle different response structures
      if (response && typeof response === 'object') {
        // Check for paginated response structure
        if (response.users && Array.isArray(response.users)) {
          setUsers(response.users);
          setTotalPages(response.totalPages || Math.ceil((response.totalElements || response.users.length) / 10));
          setTotalElements(response.totalElements || response.users.length);
        }
        // Check for direct array response
        else if (Array.isArray(response)) {
          setUsers(response);
          setTotalPages(Math.ceil(response.length / 10));
          setTotalElements(response.length);
        }
        // Check for content-based pagination (Spring Boot default)
        else if (response.content && Array.isArray(response.content)) {
          setUsers(response.content);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || response.content.length);
        }
        // Fallback for unexpected structure
        else {
          console.warn('Unexpected response structure:', response);
          setUsers([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        setUsers([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to load users';
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
      setUsers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.username || user.name || 'Unknown'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => user.email || 'N/A',
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => user.role || 'USER',
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => {
        const status = user.status || 'ACTIVE';
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

  const handleAddUser = async (userData) => {
    try {
      setError(null);
      await adminAPI.addUser(userData);
      await loadUsers();
      setShowUserForm(false);
      // Replace alert with better UI feedback
      console.log('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add user';
      setError(errorMessage);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleUpdateUser = async (userData) => {
    try {
      setError(null);
      await adminAPI.updateUser(editingUser.id, userData);
      await loadUsers();
      setShowUserForm(false);
      setEditingUser(null);
      console.log('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      setError(errorMessage);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await adminAPI.deleteUser(userId);
      await loadUsers();
      console.log('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
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

  const handleStatusFilter = (status) => {
    setStatusFilter(status || '');
    setCurrentPage(0);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <DataTable
        title="User Management"
        description={`Manage all system users (${totalElements} total)`}
        data={users}
        columns={columns}
        isLoading={isLoading}
        onAdd={() => {
          setEditingUser(null);
          setShowUserForm(true);
        }}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onView={handleViewUser}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        searchQuery={searchQuery}
        onStatusFilter={handleStatusFilter}
        statusFilter={statusFilter}
        addButtonText="Add User"
        emptyIcon={UserGroupIcon}
        emptyTitle="No users found"
        emptyDescription="Users will appear here when loaded from the API."
        totalPages={totalPages}
      />
      
      <UserForm
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleUpdateUser : handleAddUser}
        user={editingUser}
        isLoading={isLoading}
      />
      
      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;