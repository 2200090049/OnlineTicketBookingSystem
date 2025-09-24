import api from './api';

// User Management
export const getAllUsers = async (page = 0, size = 10, search = '', status = '') => {
  try {
    const params = { page, size };
    
    // Only add search and status if they have values
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (status && status.trim()) {
      params.status = status.trim();
    }

    const response = await api.get(`/admin/users`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const addUser = async (userData) => {
  try {
    const response = await api.post(`/admin/add/user`, userData);
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const updateUserStatus = async (id, status) => {
  try {
    const response = await api.put(`/admin/users/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Vendor Management
export const getAllVendors = async (page = 0, size = 10, search = '', vendorType = '') => {
  try {
    const params = { page, size };
    
    // Only add search and vendorType if they have values
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (vendorType && vendorType.trim()) {
      params.vendorType = vendorType.trim();
    }

    const response = await api.get(`/admin/vendors`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};

export const getVendorById = async (id) => {
  try {
    const response = await api.get(`/admin/vendors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    throw error;
  }
};

export const deleteVendor = async (id) => {
  try {
    const response = await api.delete(`/admin/vendors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

export const updateVendor = async (id, vendorData) => {
  try {
    const response = await api.put(`/admin/vendors/${id}`, vendorData);
    return response.data;
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }
};

export const addVendor = async (vendorData) => {
  try {
    const response = await api.post(`/admin/add/vendor`, vendorData);
    return response.data;
  } catch (error) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};

// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const response = await api.get(`/admin/dashboard`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};