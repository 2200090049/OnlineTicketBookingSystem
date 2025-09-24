import api from './api';

export const userAPI = {

  getMe: async () => {
    const response = await api.get('/user/me');
    return response.data;
  },

  updateMe: async (userData) => {
    const response = await api.put('/user/update-me', userData);
    return response.data;
  },

  updateAvatar: async (avatarUrl) => {
    const response = await api.put('/user/avatar', { avatarUrl });
    return response.data;
  },

  deleteMe: async (password) => {
    const response = await api.delete('/user/delete-me', { 
      data: { password } 
    });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.put('/user/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};