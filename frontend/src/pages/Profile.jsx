import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../services/userApi';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  TicketIcon,
  CogIcon,
  PencilIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Card from '../components/Card';
import Button from '../components/Button';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [userStats, setUserStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    favoriteGenre: 'Action',
    memberSince: new Date().getFullYear().toString()
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || user?.username || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    address: '',
    membershipLevel: 'Standard',
    profileImage: null
  });

  // Fetch user profile data from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const userData = await userAPI.getMe();
        
        // Update local storage with user data (except token)
        const userToStore = { ...userData };
        delete userToStore.token;
        localStorage.setItem('userData', JSON.stringify(userToStore));
        
        // Update profile data
        setProfileData({
          name: userData.name || userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth || '',
          address: userData.address || '',
          membershipLevel: userData.membershipLevel || 'Standard',
          profileImage: userData.profileImage || null
        });

        // Update user stats if available
        if (userData.stats) {
          setUserStats({
            totalBookings: userData.stats.totalBookings || 0,
            totalSpent: userData.stats.totalSpent || 0,
            favoriteGenre: userData.stats.favoriteGenre || 'Action',
            memberSince: new Date(userData.createdAt).getFullYear().toString()
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch user profile');
        console.error('Error fetching user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Mock booking history
  useEffect(() => {
    setUserBookings([
      {
        id: 1,
        type: 'Movie',
        title: 'Spider-Man: No Way Home',
        date: '2024-09-15',
        time: '7:30 PM',
        venue: 'PVR Cinemas, Forum Mall',
        seats: ['F12', 'F13'],
        amount: 500,
        status: 'Completed'
      },
      {
        id: 2,
        type: 'Movie',
        title: 'Dune',
        date: '2024-09-10',
        time: '4:00 PM',
        venue: 'INOX, GVK One Mall',
        seats: ['E8', 'E9'],
        amount: 560,
        status: 'Completed'
      },
      {
        id: 3,
        type: 'Sport',
        title: 'India vs Australia',
        date: '2024-09-20',
        time: '2:30 PM',
        venue: 'Rajiv Gandhi International Stadium',
        seats: ['North Stand - Row 15, Seat 10'],
        amount: 1200,
        status: 'Upcoming'
      }
    ]);

    setUserStats({
      totalBookings: 15,
      totalSpent: 12500,
      favoriteGenre: 'Action',
      memberSince: '2023'
    });
  }, []);

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await userAPI.updateMe(profileData);
      
      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUser = { ...storedUser, ...profileData };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
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
                  Please sign in to view your profile, manage your bookings, and access personalized features.
                </p>
              </div>
              
              <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                <h3 className="font-medium text-text-primary mb-2">With your account you can:</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• View and manage your booking history</li>
                  <li>• Save your favorite movies and events</li>
                  <li>• Get exclusive offers and discounts</li>
                  <li>• Quick checkout for faster bookings</li>
                </ul>
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
              <p className="text-text-secondary">Manage your account settings and view your booking history</p>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card padding="medium" className="sticky top-24">
              {/* Profile Summary */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  {profileData.profileImage ? (
                    <img 
                      src={profileData.profileImage} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-20 h-20 text-primary-main" />
                  )}
                  <button className="absolute bottom-0 right-0 p-1 bg-primary-main text-white rounded-full hover:bg-primary-dark transition-colors">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-text-primary">{profileData.name}</h3>
                <p className="text-sm text-text-secondary">{profileData.membershipLevel} Member</p>
                <div className="flex items-center justify-center mt-2">
                  <StarIcon className="w-4 h-4 text-warning mr-1" />
                  <span className="text-sm text-text-secondary">Member since {userStats.memberSince}</span>
                </div>
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
                  onClick={() => handleTabChange('bookings')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'bookings' 
                      ? 'bg-primary-main text-white' 
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  <TicketIcon className="w-5 h-5 inline mr-3" />
                  My Bookings
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

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-text-primary mb-3">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Total Bookings</span>
                    <span className="text-sm font-medium text-text-primary">{userStats.totalBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Total Spent</span>
                    <span className="text-sm font-medium text-text-primary">{formatCurrency(userStats.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">Favorite Genre</span>
                    <span className="text-sm font-medium text-text-primary">{userStats.favoriteGenre}</span>
                  </div>
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
                          <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                          Email Address
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                          />
                        ) : (
                          <p className="text-text-secondary">{profileData.email}</p>
                        )}
                      </div>
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
                          />
                        ) : (
                          <p className="text-text-secondary">{profileData.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          <CalendarIcon className="w-4 h-4 inline mr-2" />
                          Date of Birth
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                          />
                        ) : (
                          <p className="text-text-secondary">{formatDate(profileData.dateOfBirth)}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          <MapPinIcon className="w-4 h-4 inline mr-2" />
                          Address
                        </label>
                        {isEditing ? (
                          <textarea
                            value={profileData.address}
                            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-transparent"
                          />
                        ) : (
                          <p className="text-text-secondary">{profileData.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    {isEditing ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
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

                {/* Recent Bookings */}
                <Card title="Recent Bookings">
                  <div className="space-y-4">
                    {userBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary-main bg-opacity-10 rounded-lg">
                            <TicketIcon className="w-6 h-6 text-primary-main" />
                          </div>
                          <div>
                            <h4 className="font-medium text-text-primary">{booking.title}</h4>
                            <p className="text-sm text-text-secondary">
                              {formatDate(booking.date)} • {booking.time}
                            </p>
                            <p className="text-sm text-text-secondary">{booking.venue}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-text-primary">{formatCurrency(booking.amount)}</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            booking.status === 'Completed' 
                              ? 'bg-success bg-opacity-10 text-success' 
                              : 'bg-warning bg-opacity-10 text-warning'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleTabChange('bookings')}
                      className="w-full"
                    >
                      View All Bookings
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <Card title="My Bookings" subtitle="View and manage all your ticket bookings">
                  <div className="space-y-4">
                    {userBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-soft transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 bg-primary-main bg-opacity-10 rounded-lg">
                              <TicketIcon className="w-8 h-8 text-primary-main" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-text-primary mb-1">{booking.title}</h4>
                              <div className="space-y-1 text-sm text-text-secondary">
                                <p className="flex items-center">
                                  <CalendarIcon className="w-4 h-4 mr-2" />
                                  {formatDate(booking.date)}
                                </p>
                                <p className="flex items-center">
                                  <ClockIcon className="w-4 h-4 mr-2" />
                                  {booking.time}
                                </p>
                                <p className="flex items-center">
                                  <MapPinIcon className="w-4 h-4 mr-2" />
                                  {booking.venue}
                                </p>
                                <p>Seats: {booking.seats.join(', ')}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-text-primary mb-2">{formatCurrency(booking.amount)}</p>
                            <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                              booking.status === 'Completed' 
                                ? 'bg-success bg-opacity-10 text-success' 
                                : 'bg-warning bg-opacity-10 text-warning'
                            }`}>
                              {booking.status}
                            </span>
                            <div className="mt-3 space-x-2">
                              <Button variant="outline" size="small">
                                View Details
                              </Button>
                              {booking.status === 'Upcoming' && (
                                <Button variant="error" size="small">
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card title="Account Settings">
                  <div className="space-y-6">
                    {/* Notification Preferences */}
                    <div>
                      <h4 className="font-medium text-text-primary mb-3">Notification Preferences</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-primary-main focus:ring-primary-main" defaultChecked />
                          <span className="ml-3 text-text-secondary">Email notifications for bookings</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-primary-main focus:ring-primary-main" defaultChecked />
                          <span className="ml-3 text-text-secondary">SMS notifications for confirmations</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded text-primary-main focus:ring-primary-main" />
                          <span className="ml-3 text-text-secondary">Promotional emails and offers</span>
                        </label>
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-text-primary flex mb-3">Security</h4>
                      <div className="space-y-3">
                        <Button 
                          variant="outline"
                          onClick={async () => {
                            const currentPassword = prompt('Enter your current password:');
                            if (!currentPassword) return;
                            
                            const newPassword = prompt('Enter your new password:');
                            if (!newPassword) return;
                            
                            const confirmPassword = prompt('Confirm your new password:');
                            if (!confirmPassword) return;
                            
                            if (newPassword !== confirmPassword) {
                              setError('New passwords do not match');
                              return;
                            }
                            
                            try {
                              setIsLoading(true);
                              await userAPI.changePassword(currentPassword, newPassword, confirmPassword);
                              setError(null);
                              alert('Password changed successfully');
                            } catch (err) {
                              setError(err.message || 'Failed to change password');
                              console.error('Error changing password:', err);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Processing...' : 'Change Password'}
                        </Button>
                        <Button 
                          variant="outline"
                          disabled={true}
                          title="Coming soon"
                        >
                          Enable Two-Factor Authentication
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
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                              try {
                                setIsLoading(true);
                                await userAPI.deleteMe();
                                logout(); // This will clear auth state and redirect to login
                              } catch (err) {
                                setError(err.message || 'Failed to delete account');
                                console.error('Error deleting account:', err);
                              } finally {
                                setIsLoading(false);
                              }
                            }
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Processing...' : 'Delete Account'}
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