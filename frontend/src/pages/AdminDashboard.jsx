import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// import { userAPI, adminAPI, transportAPI } from '../services/api'; // Uncomment when APIs are ready

// Import our new modular components
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardOverview from '../components/admin/DashboardOverview';
import UserManagement from '../components/admin/UserManagement';
import VendorManagement from '../components/admin/VendorManagement';
import TransportManagement from '../components/admin/TransportManagement';
import AddItemModal from '../components/admin/AddItemModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
    
  // Sidebar and navigation state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard data state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeTrains: 0,
    activeMovies: 0,
    activeBuses: 0
  });
  
  // Data management state
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [trains, setTrains] = useState([]);
  const [movies, setMovies] = useState([]);
  const [buses, setBuses] = useState([]);
  
  // Loading and modal states
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState('');
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);

  const loadUsers = async () => {
    try {
      // Replace with actual API call
      // const response = await userAPI.getAllUsers();
      // setUsers(response.data.users || []);
      
      // Mock data for development
      setUsers([
        {
          id: 1,
          username: 'john_doe',
          email: 'john@example.com',
          phone: '+1234567890',
          role: 'USER',
          status: 'active',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          username: 'jane_smith',
          email: 'jane@example.com',
          phone: '+1987654321',
          role: 'USER',
          status: 'active',
          createdAt: '2024-01-10'
        }
      ]);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadVendors = async () => {
    try {
      // Replace with actual API call
      // const response = await adminAPI.getAllVendors();
      // setVendors(response.data.vendors || []);
      
      // Mock data for development
      setVendors([
        {
          id: 1,
          username: 'train_vendor',
          email: 'vendor@railways.com',
          phone: '+1122334455',
          role: 'VENDOR',
          vendorType: 'TRAIN',
          status: 'active',
          createdAt: '2024-01-05'
        }
      ]);
    } catch (error) {
      console.error('Error loading vendors:', error);
      setVendors([]);
    }
  };

  const loadStats = async () => {
    try {
      // Replace with actual API calls
      // const statsResponse = await adminAPI.getStats();
      // setStats(statsResponse.data || {});
      
      // Mock stats for development
      setStats({
        totalUsers: 150,
        totalVendors: 25,
        totalBookings: 1200,
        totalRevenue: 45000,
        activeTrains: 8,
        activeMovies: 15,
        activeBuses: 12
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadTransportData = async () => {
    try {
      // Load transportation data
      // const [trainsRes, moviesRes, busesRes] = await Promise.all([
      //   transportAPI.getTrains(),
      //   transportAPI.getMovies(),
      //   transportAPI.getBuses()
      // ]);
      
      // Mock data for development
      setTrains([
        {
          id: 1,
          name: 'Express 001',
          trainNumber: 'EXP001',
          sourceStation: 'New York',
          destinationStation: 'Boston',
          departureTime: '08:00',
          arrivalTime: '12:00',
          trainClass: 'FIRST_AC',
          totalSeats: 200,
          price: 150,
          status: 'active'
        }
      ]);
      
      setMovies([
        {
          id: 1,
          name: 'Avengers: Endgame',
          genre: 'Action',
          duration: 181,
          rating: 'PG-13',
          language: 'English',
          director: 'Russo Brothers',
          totalSeats: 300,
          price: 15,
          status: 'active'
        }
      ]);
      
      setBuses([
        {
          id: 1,
          name: 'City Express',
          busNumber: 'BUS001',
          source: 'Downtown',
          destination: 'Airport',
          busDepartureTime: '06:00',
          busArrivalTime: '07:30',
          busType: 'AC',
          totalSeats: 50,
          price: 25,
          status: 'active'
        }
      ]);
      
    } catch (error) {
      console.error('Error loading transport data:', error);
      setTrains([]);
      setMovies([]);
      setBuses([]);
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load all dashboard data
      await Promise.all([
        loadUsers(),
        loadVendors(),
        loadStats(),
        loadTransportData()
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check admin access and load data
  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if user has admin privileges
    if (user.role !== 'ADMIN' && !user.isAdmin && !user.email?.endsWith('@admin.com')) {
      navigate('/');
      return;
    }

    loadDashboardData();
  }, [user, navigate, loadDashboardData]);

  // Modal handlers
  const handleAddItem = (type) => {
    setAddModalType(type);
    setModalMode('add');
    setSelectedItem(null);
    setShowAddModal(true);
  };

  const handleEditItem = (type, item) => {
    setAddModalType(type);
    setModalMode('edit');
    setSelectedItem(item);
    setShowAddModal(true);
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setIsLoading(true);
      // Add actual API call here
      // await api.deleteItem(type, id);
      
      // Update local state
      switch (type) {
        case 'user':
          setUsers(prev => prev.filter(u => u.id !== id));
          break;
        case 'vendor':
          setVendors(prev => prev.filter(v => v.id !== id));
          break;
        case 'train':
          setTrains(prev => prev.filter(t => t.id !== id));
          break;
        case 'movie':
          setMovies(prev => prev.filter(m => m.id !== id));
          break;
        case 'bus':
          setBuses(prev => prev.filter(b => b.id !== id));
          break;
      }
      
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      setIsLoading(true);
      
      if (modalMode === 'add') {
        // Add new item
        // const response = await api.createItem(addModalType, formData);
        console.log('Adding new item:', addModalType, formData);
      } else {
        // Update existing item
        // const response = await api.updateItem(addModalType, selectedItem.id, formData);
        console.log('Updating item:', addModalType, selectedItem.id, formData);
      }
      
      // Refresh data
      await loadDashboardData();
      
      // Close modal
      setShowAddModal(false);
      
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sidebar handlers
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigationChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  // Render main content based on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            stats={stats}
            user={user}
            onNavigate={handleNavigationChange}
            isLoading={isLoading}
          />
        );
        
      case 'users':
        return (
          <UserManagement
            users={users}
            isLoading={isLoading}
            onAdd={() => handleAddItem('user')}
            onEdit={(user) => handleEditItem('user', user)}
            onDelete={(id) => handleDeleteItem('user', id)}
          />
        );
        
      case 'vendors':
        return (
          <VendorManagement
            vendors={vendors}
            isLoading={isLoading}
            onAdd={() => handleAddItem('vendor')}
            onEdit={(vendor) => handleEditItem('vendor', vendor)}
            onDelete={(id) => handleDeleteItem('vendor', id)}
          />
        );
        
      case 'trains':
        return (
          <TransportManagement
            type="trains"
            data={trains}
            isLoading={isLoading}
            onAdd={() => handleAddItem('train')}
            onEdit={(train) => handleEditItem('train', train)}
            onDelete={(id) => handleDeleteItem('train', id)}
          />
        );
        
      case 'movies':
        return (
          <TransportManagement
            type="movies"
            data={movies}
            isLoading={isLoading}
            onAdd={() => handleAddItem('movie')}
            onEdit={(movie) => handleEditItem('movie', movie)}
            onDelete={(id) => handleDeleteItem('movie', id)}
          />
        );
        
      case 'buses':
        return (
          <TransportManagement
            type="buses"
            data={buses}
            isLoading={isLoading}
            onAdd={() => handleAddItem('bus')}
            onEdit={(bus) => handleEditItem('bus', bus)}
            onDelete={(id) => handleDeleteItem('bus', id)}
          />
        );
        
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h2>
            <p className="text-gray-600">Reports and analytics functionality will be implemented here.</p>
          </div>
        );
        
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">System settings will be implemented here.</p>
          </div>
        );
        
      default:
        return (
          <DashboardOverview
            stats={stats}
            user={user}
            onNavigate={handleNavigationChange}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleNavigationChange}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="min-h-full">
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* Add/Edit Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        type={addModalType}
        mode={modalMode}
        initialData={selectedItem}
        isLoading={isLoading}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default AdminDashboard;