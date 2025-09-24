import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  TruckIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { busesAPI } from '../../services/api';
import Button from '../../components/Button';
import Card from '../../components/Card';

const BusAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddBus, setShowAddBus] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [busForm, setBusForm] = useState({
    busName: '',
    busNumber: '',
    sourceCity: '',
    destinationCity: '',
    departureTime: '',
    arrivalTime: '',
    totalSeats: '',
    price: '',
    busType: 'AC_SEATER',
    operatorName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    console.log('Current user role:', user.role);
    console.log('Current user vendor type:', user.vendorType);
    
    // Check if user has proper vendor type for bus admin (USER role with BUSES_ADMIN vendor type, or ADMIN role)
    if (!((user.role === 'USER' && user.vendorType === 'BUSES_ADMIN') || user.role === 'ADMIN')) {
      console.log('Access denied - user role:', user.role, 'vendor type:', user.vendorType);
      alert('Access denied. You need BUSES_ADMIN vendor type or ADMIN role to access this page.');
      navigate('/user/dashboard');
      return;
    }

    loadBuses();
  }, [user, navigate]);

  const loadBuses = async () => {
    try {
      setIsLoading(true);
      const response = await busesAPI.getAllBuses();
      setBuses(response.data?.buses || []);
    } catch (error) {
      console.error('Error loading buses:', error);
      setBuses([]); // Ensure buses is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const totalSeats = parseInt(busForm.totalSeats);
      const busData = {
        ...busForm,
        totalSeats: totalSeats,
        availableSeats: totalSeats, // Initially available seats = total seats
        price: parseFloat(busForm.price),
        departureTime: busForm.departureTime + ':00', // Add seconds for LocalDateTime format
        arrivalTime: busForm.arrivalTime + ':00' // Add seconds for LocalDateTime format
      };

      await busesAPI.addBus(busData);
      
      alert('Bus added successfully!');
      setShowAddBus(false);
      resetForm();
      loadBuses();
    } catch (error) {
      console.error('Error adding bus:', error);
      alert('Failed to add bus. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBus = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const totalSeats = parseInt(busForm.totalSeats);
      const busData = {
        ...busForm,
        totalSeats: totalSeats,
        availableSeats: totalSeats, // Update available seats to match total seats
        price: parseFloat(busForm.price),
        departureTime: busForm.departureTime + ':00', // Add seconds for LocalDateTime format
        arrivalTime: busForm.arrivalTime + ':00' // Add seconds for LocalDateTime format
      };

      await busesAPI.updateBus(editingBus.id, busData);
      
      alert('Bus updated successfully!');
      setEditingBus(null);
      resetForm();
      loadBuses();
    } catch (error) {
      console.error('Error updating bus:', error);
      alert('Failed to update bus. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBus = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await busesAPI.deleteBus(busId);
        alert('Bus deleted successfully!');
        loadBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
        alert('Failed to delete bus. Please try again.');
      }
    }
  };

  const handleStatusToggle = async (busId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await busesAPI.updateBusStatus(busId, newStatus);
      alert(`Bus ${newStatus.toLowerCase()} successfully!`);
      loadBuses();
    } catch (error) {
      console.error('Error updating bus status:', error);
      alert('Failed to update bus status. Please try again.');
    }
  };

  const resetForm = () => {
    setBusForm({
      busName: '',
      busNumber: '',
      sourceCity: '',
      destinationCity: '',
      departureTime: '',
      arrivalTime: '',
      totalSeats: '',
      price: '',
      busType: 'AC_SEATER',
      operatorName: ''
    });
  };

  const openEditModal = (bus) => {
    setEditingBus(bus);
    setBusForm({
      busName: bus.busName,
      busNumber: bus.busNumber,
      sourceCity: bus.sourceCity,
      destinationCity: bus.destinationCity,
      departureTime: new Date(bus.departureTime).toISOString().slice(0, 16),
      arrivalTime: new Date(bus.arrivalTime).toISOString().slice(0, 16),
      totalSeats: bus.totalSeats.toString(),
      price: bus.price.toString(),
      busType: bus.busType,
      operatorName: bus.operatorName || ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBusTypeColor = (busType) => {
    switch (busType) {
      case 'AC_SEATER':
        return 'bg-blue-100 text-blue-800';
      case 'NON_AC_SEATER':
        return 'bg-gray-100 text-gray-800';
      case 'AC_SLEEPER':
        return 'bg-purple-100 text-purple-800';
      case 'NON_AC_SLEEPER':
        return 'bg-indigo-100 text-indigo-800';
      case 'AC_SEMI_SLEEPER':
        return 'bg-cyan-100 text-cyan-800';
      case 'NON_AC_SEMI_SLEEPER':
        return 'bg-teal-100 text-teal-800';
      case 'VOLVO_AC':
        return 'bg-green-100 text-green-800';
      case 'VOLVO_MULTI_AXLE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ORDINARY':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bus Management</h1>
              <p className="text-gray-600 mt-1">Manage your bus fleet and schedules</p>
            </div>
            <Button
              onClick={() => setShowAddBus(true)}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add New Bus</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {buses.length}
                  </h3>
                  <p className="text-sm text-gray-600">Total Buses</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {buses.filter(bus => bus.status === 'ACTIVE').length}
                  </h3>
                  <p className="text-sm text-gray-600">Active Buses</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {buses.reduce((total, bus) => total + bus.totalSeats, 0)}
                  </h3>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ₹{buses.reduce((total, bus) => total + (bus.price * bus.availableSeats), 0).toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600">Potential Revenue</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Buses List */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Buses</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading buses...</span>
              </div>
            ) : buses.length === 0 ? (
              <div className="text-center py-12">
                <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No buses found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first bus.</p>
                <div className="mt-6">
                  <Button onClick={() => setShowAddBus(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Bus
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buses.map((bus) => (
                  <div key={bus.id} className="bg-gray-50 rounded-lg p-6 border hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{bus.busName}</h3>
                        <p className="text-sm text-gray-600">{bus.busNumber}</p>
                        <p className="text-xs text-gray-500 mt-1">{bus.operatorName}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                          {bus.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBusTypeColor(bus.busType)}`}>
                          {bus.busType?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>{bus.sourceCity} → {bus.destinationCity}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{formatTime(bus.departureTime)} - {formatTime(bus.arrivalTime)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{formatDate(bus.departureTime)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <UserGroupIcon className="h-4 w-4 mr-2" />
                          <span>{bus.availableSeats}/{bus.totalSeats} Available</span>
                        </div>
                        <div className="flex items-center font-semibold text-green-600">
                          <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                          <span>{bus.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => openEditModal(bus)}
                        className="flex-1 flex items-center justify-center space-x-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                      
                      <Button
                        variant={bus.status === 'ACTIVE' ? 'outline' : 'default'}
                        size="small"
                        onClick={() => handleStatusToggle(bus.id, bus.status)}
                        className="flex-1 flex items-center justify-center space-x-1"
                      >
                        {bus.status === 'ACTIVE' ? (
                          <>
                            <XCircleIcon className="h-4 w-4" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Activate</span>
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleDeleteBus(bus.id)}
                        className="px-3 text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add/Edit Bus Modal */}
      {(showAddBus || editingBus) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingBus ? 'Edit Bus' : 'Add New Bus'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddBus(false);
                    setEditingBus(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={editingBus ? handleEditBus : handleAddBus} className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bus Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={busForm.busName}
                      onChange={(e) => setBusForm({ ...busForm, busName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter bus name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bus Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={busForm.busNumber}
                      onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter bus number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operator Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={busForm.operatorName}
                      onChange={(e) => setBusForm({ ...busForm, operatorName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter operator name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bus Type *
                    </label>
                    <select
                      required
                      value={busForm.busType}
                      onChange={(e) => setBusForm({ ...busForm, busType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="AC_SEATER">AC Seater</option>
                      <option value="NON_AC_SEATER">Non-AC Seater</option>
                      <option value="AC_SLEEPER">AC Sleeper</option>
                      <option value="NON_AC_SLEEPER">Non-AC Sleeper</option>
                      <option value="AC_SEMI_SLEEPER">AC Semi Sleeper</option>
                      <option value="NON_AC_SEMI_SLEEPER">Non-AC Semi Sleeper</option>
                      <option value="VOLVO_AC">Volvo AC</option>
                      <option value="VOLVO_MULTI_AXLE">Volvo Multi Axle</option>
                      <option value="ORDINARY">Ordinary</option>
                    </select>
                  </div>
                </div>

                {/* Route Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source City *
                    </label>
                    <input
                      type="text"
                      required
                      value={busForm.sourceCity}
                      onChange={(e) => setBusForm({ ...busForm, sourceCity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter source city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination City *
                    </label>
                    <input
                      type="text"
                      required
                      value={busForm.destinationCity}
                      onChange={(e) => setBusForm({ ...busForm, destinationCity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter destination city"
                    />
                  </div>
                </div>

                {/* Time Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={busForm.departureTime}
                      onChange={(e) => setBusForm({ ...busForm, departureTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arrival Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={busForm.arrivalTime}
                      onChange={(e) => setBusForm({ ...busForm, arrivalTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Capacity and Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Seats *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="60"
                      value={busForm.totalSeats}
                      onChange={(e) => setBusForm({ ...busForm, totalSeats: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter total seats"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Seat (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={busForm.price}
                      onChange={(e) => setBusForm({ ...busForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter price per seat"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{editingBus ? 'Updating...' : 'Adding...'}</span>
                      </div>
                    ) : (
                      <span>{editingBus ? 'Update Bus' : 'Add Bus'}</span>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddBus(false);
                      setEditingBus(null);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BusAdmin;