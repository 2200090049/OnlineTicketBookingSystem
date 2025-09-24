import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../services/userApi';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CogIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Card from '../components/Card';
import Button from '../components/Button';
import user1 from '../assets/user1.gif';
import user2 from '../assets/user2.gif';
import user3 from '../assets/user3.gif';
import user4 from '../assets/user4.gif';
import user5 from '../assets/user5.gif';

const Profile = () => {
  const gifOptions = [
    { name: 'user1.gif', src: user1 },
    { name: 'user2.gif', src: user2 },
    { name: 'user3.gif', src: user3 },
    { name: 'user4.gif', src: user4 },
    { name: 'user5.gif', src: user5 },
  ];

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    avatar: null,
    status: '',
    isVendor: false,
    vendorType: null,
    createdAt: null,
    updatedAt: null
  });

  // Avatar GIF selection handler
  const handleAvatarSelect = async (gifName) => {
    try {
      setIsLoading(true);
      await userAPI.updateAvatar(gifName);
      setProfileData((prev) => ({ ...prev, avatar: gifName }));
      setShowAvatarModal(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update avatar');
      console.error('Error updating avatar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      await userAPI.changePassword(
        passwordData.currentPassword, 
        passwordData.newPassword, 
        passwordData.confirmPassword
      );
      setError(null);
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('Password changed successfully');
    } catch (err) {
      setError(err.message || 'Failed to change password');
      console.error('Error changing password:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Password is required to delete account');
      return;
    }
    
    try {
      setIsLoading(true);
      await userAPI.deleteMe(deletePassword);
      setError(null);
      setShowDeleteModal(false);
      logout(); // This will clear auth state and redirect to login
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      console.error('Error deleting account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get avatar source from gif name
  const getAvatarSrc = (avatarName) => {
    const gifOption = gifOptions.find(gif => gif.name === avatarName);
    return gifOption ? gifOption.src : null;
  };

  // Fetch user profile data from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await userAPI.getMe();
        const userData = response.user;
        
        // Update profile data with actual backend data
        setProfileData({
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.avatar || null,
          status: userData.status || '',
          isVendor: userData.isVendor || false,
          vendorType: userData.vendorType || null,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        });

        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch user profile');
        console.error('Error fetching user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await userAPI.updateMe({
        username: profileData.username,
        phone: profileData.phone
      });
      
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-error bg-opacity-10 border border-error border-opacity-20 rounded-lg">
            <p className="text-error">{error}</p>
          </div>
        )}
        
        {/* Show login prompt if user is not authenticated */}
        {!user ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <Card className="max-w-md w-full text-center" padding="large">
              <div className="mb-6">
                <UserCircleIcon className="h-16 w-16 text-primary-main mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">Sign In Required</h2>
                <p className="text-text-secondary">
                  Please sign in to view your profile and manage your account.
                </p>
              </div>
              
              <div className="space-y-3">
                <Link to="/login" className="block">
                  <Button variant="primary" className="w-full">
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-text-secondary">
                  Don&apos;t have an account yet? 
                  <Link to="/signup" className="text-primary-main hover:text-primary-dark ml-1 font-medium">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">My Profile</h1>
              <p className="text-text-secondary">Manage your account settings and information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card padding="medium" className="sticky top-24">
                  {/* Profile Summary */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                      {profileData.avatar ? (
                        <img 
                          src={getAvatarSrc(profileData.avatar)}
                          alt="Profile" 
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-32 h-32 text-primary-main" />
                      )}
                      <button 
                        className="absolute bottom-0 right-0 p-1 bg-primary-main text-white rounded-full hover:bg-primary-dark transition-colors" 
                        onClick={() => setShowAvatarModal(true)}
                        disabled={isLoading}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Avatar GIF Selection Modal */}
                    {showAvatarModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                          <h3 className="text-lg font-semibold mb-4 text-text-primary">Select an Avatar</h3>
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            {gifOptions.map((gif) => (
                              <button
                                key={gif.name}
                                className={`border-2 rounded-xl p-2 hover:border-primary-main transition-all ${
                                  profileData.avatar === gif.name ? 'border-primary-main' : 'border-gray-200'
                                }`}
                                onClick={() => handleAvatarSelect(gif.name)}
                                disabled={isLoading}
                              >
                                <img src={gif.src} alt="Avatar option" className="w-16 h-16 object-cover mx-auto" />
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setShowAvatarModal(false)} disabled={isLoading}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Password Change Modal */}
                    {showPasswordModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                          <h3 className="text-lg font-semibold mb-4 text-text-primary">Change Password</h3>
                          <div className="space-y-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                Current Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                                placeholder="Enter current password"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                                placeholder="Enter new password"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowPasswordModal(false);
                                setPasswordData({
                                  currentPassword: '',
                                  newPassword: '',
                                  confirmPassword: ''
                                });
                                setError(null);
                              }} 
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="primary" 
                              onClick={handlePasswordChange}
                              disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                            >
                              {isLoading ? 'Changing...' : 'Change Password'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delete Account Modal */}
                    {showDeleteModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-error mb-2">Delete Account</h3>
                            <div className="p-4 bg-error bg-opacity-10 border border-error border-opacity-20 rounded-lg">
                              <p className="text-sm text-error font-medium mb-2">⚠️ Warning: This action cannot be undone!</p>
                              <p className="text-sm text-text-secondary">
                                Deleting your account will permanently remove all your data, including:
                              </p>
                              <ul className="text-sm text-text-secondary mt-2 ml-4 list-disc">
                                <li>Profile information</li>
                                <li>Booking history</li>
                                <li>Saved preferences</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Enter your password to confirm deletion
                            </label>
                            <input
                              type="password"
                              value={deletePassword}
                              onChange={(e) => setDeletePassword(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-error focus:border-transparent"
                              placeholder="Enter your password"
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-3">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowDeleteModal(false);
                                setDeletePassword('');
                                setError(null);
                              }} 
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="error" 
                              onClick={handleDeleteAccount}
                              disabled={isLoading || !deletePassword}
                            >
                              {isLoading ? 'Deleting...' : 'Delete Account'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <h3 className="font-semibold text-text-primary">{profileData.username}</h3>
                    <p className="text-sm text-text-secondary">
                      {profileData.status} {profileData.isVendor ? '• Vendor' : '• Member'}
                    </p>
                    {profileData.vendorType && (
                      <p className="text-xs text-text-secondary">{profileData.isVendor ? profileData.vendorType : ''}</p>
                    )}
                  </div>

                  {/* Navigation */}
                  <nav className="space-y-2">
                    <button
                      onClick={() => handleTabChange('overview')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        activeTab === 'overview' 
                          ? 'bg-primary-main text-white' 
                          : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                      }`}
                    >
                      <UserCircleIcon className="w-5 h-5 inline mr-3" />
                      Overview
                    </button>
                    <button
                      onClick={() => handleTabChange('settings')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        activeTab === 'settings' 
                          ? 'bg-primary-main text-white' 
                          : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                      }`}
                    >
                      <CogIcon className="w-5 h-5 inline mr-3" />
                      Settings
                    </button>
                  </nav>

                  {/* Account Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-text-primary mb-3">Account Info</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Status</span>
                        <span className={`text-sm font-medium ${
                          profileData.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {profileData.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Account Type</span>
                        <span className="text-sm font-medium text-text-primary">
                          {profileData.isVendor ? 'Vendor' : 'Customer'}
                        </span>
                      </div>
                      {profileData.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-text-secondary">Joined</span>
                          <span className="text-sm font-medium text-text-primary">
                            {formatDate(profileData.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <Card title="Personal Information">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              <UserCircleIcon className="w-4 h-4 inline mr-2" />
                              Username
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={profileData.username}
                                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                                disabled={isLoading}
                              />
                            ) : (
                              <p className="text-text-secondary">{profileData.username}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                              Email Address
                            </label>
                            <p className="text-text-secondary">{profileData.email}</p>
                            <p className="text-xs text-text-secondary mt-1">Email cannot be changed</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              <PhoneIcon className="w-4 h-4 inline mr-2" />
                              Phone Number
                            </label>
                            {isEditing ? (
                              <input
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                                disabled={isLoading}
                              />
                            ) : (
                              <p className="text-text-secondary">{profileData.phone || 'Not provided'}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Account Status
                            </label>
                            <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                              profileData.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {profileData.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end space-x-3">
                        {isEditing ? (
                          <>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setIsEditing(false);
                                // Reset form data
                                const fetchUserProfile = async () => {
                                  try {
                                    const response = await userAPI.getMe();
                                    const userData = response.user;
                                    setProfileData({
                                      username: userData.username || '',
                                      email: userData.email || '',
                                      phone: userData.phone || '',
                                      avatar: userData.avatar || null,
                                      status: userData.status || '',
                                      isVendor: userData.isVendor || false,
                                      vendorType: userData.vendorType || null,
                                      createdAt: userData.createdAt,
                                      updatedAt: userData.updatedAt
                                    });
                                  } catch (err) {
                                    console.error('Error resetting form:', err);
                                  }
                                };
                                fetchUserProfile();
                              }}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="primary" 
                              onClick={handleSaveProfile}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="outline" 
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading}
                          >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            {isLoading ? 'Loading...' : 'Edit Profile'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <Card title="Account Settings">
                      <div className="space-y-6">
                        {/* Security Settings */}
                        <div>
                          <h4 className="font-medium text-text-primary mb-3">Security</h4>
                          <div className="space-y-3">
                            <Button 
                              variant="outline"
                              onClick={() => setShowPasswordModal(true)}
                              disabled={isLoading}
                            >
                              Change Password
                            </Button>
                          </div>
                        </div>

                        {/* Account Actions */}
                        <div className="pt-6 border-t border-gray-200">
                          <h4 className="font-medium text-text-primary mb-3">Account Actions</h4>
                          <div className="space-y-3">
                            <Button 
                              variant="ghost" 
                              onClick={logout}
                              disabled={isLoading}
                            >
                              Sign Out
                            </Button>
                            <Button 
                              variant="error"
                              onClick={() => setShowDeleteModal(true)}
                              disabled={isLoading}
                            >
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;