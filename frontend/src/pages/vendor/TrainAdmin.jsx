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
import { trainAPI } from '../../services/api';
import Button from '../../components/Button';
import Card from '../../components/Card';

const TrainAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trains, setTrains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTrain, setShowAddTrain] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [trainForm, setTrainForm] = useState({
    trainName: '',
    trainNumber: '',
    sourceStation: '',
    destinationStation: '',
    departureTime: '',
    arrivalTime: '',
    totalSeats: '',
    price: '',
    trainClass: 'SECOND_AC'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated or not train admin
    if (!user) {
      navigate('/login');
      return;
    }
    
    if ((!user.isVendor && !user.vendor) || user.vendorType !== 'TRAIN_ADMIN') {
      navigate('/user/dashboard');
      return;
    }

    loadTrains();
  }, [user, navigate]);

  const loadTrains = async () => {
    try {
      setIsLoading(true);
      const response = await trainAPI.getAllTrains();
      setTrains(response.data?.trains || []);
    } catch (error) {
      console.error('Error loading trains:', error);
      setTrains([]); // Ensure trains is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrain = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const totalSeats = parseInt(trainForm.totalSeats);
      const trainData = {
        ...trainForm,
        totalSeats: totalSeats,
        availableSeats: totalSeats, // Initially available seats = total seats
        price: parseFloat(trainForm.price),
        departureTime: trainForm.departureTime + ':00', // Add seconds for LocalDateTime format
        arrivalTime: trainForm.arrivalTime + ':00' // Add seconds for LocalDateTime format
      };

      await trainAPI.addTrain(trainData);
      
      alert('Train added successfully!');
      setShowAddTrain(false);
      resetForm();
      loadTrains();
    } catch (error) {
      console.error('Error adding train:', error);
      alert('Failed to add train. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTrain = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const totalSeats = parseInt(trainForm.totalSeats);
      const trainData = {
        ...trainForm,
        totalSeats: totalSeats,
        availableSeats: totalSeats, // Update available seats to match total seats
        price: parseFloat(trainForm.price),
        departureTime: trainForm.departureTime + ':00', // Add seconds for LocalDateTime format
        arrivalTime: trainForm.arrivalTime + ':00' // Add seconds for LocalDateTime format
      };

      await trainAPI.updateTrain(editingTrain.id, trainData);
      
      alert('Train updated successfully!');
      setEditingTrain(null);
      resetForm();
      loadTrains();
    } catch (error) {
      console.error('Error updating train:', error);
      alert('Failed to update train. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrain = async (trainId) => {
    if (window.confirm('Are you sure you want to delete this train?')) {
      try {
        await trainAPI.deleteTrain(trainId);
        alert('Train deleted successfully!');
        loadTrains();
      } catch (error) {
        console.error('Error deleting train:', error);
        alert('Failed to delete train. Please try again.');
      }
    }
  };

  const handleStatusToggle = async (trainId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await trainAPI.updateTrainStatus(trainId, newStatus);
      alert(`Train ${newStatus.toLowerCase()} successfully!`);
      loadTrains();
    } catch (error) {
      console.error('Error updating train status:', error);
      alert('Failed to update train status. Please try again.');
    }
  };

  const resetForm = () => {
    setTrainForm({
      trainName: '',
      trainNumber: '',
      sourceStation: '',
      destinationStation: '',
      departureTime: '',
      arrivalTime: '',
      totalSeats: '',
      price: '',
      trainClass: 'SECOND_AC'
    });
  };

  const openEditModal = (train) => {
    setEditingTrain(train);
    setTrainForm({
      trainName: train.trainName,
      trainNumber: train.trainNumber,
      sourceStation: train.sourceStation,
      destinationStation: train.destinationStation,
      departureTime: new Date(train.departureTime).toISOString().slice(0, 16),
      arrivalTime: new Date(train.arrivalTime).toISOString().slice(0, 16),
      totalSeats: train.totalSeats.toString(),
      price: train.price.toString(),
      trainClass: train.trainClass
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrainClassColor = (trainClass) => {
    switch (trainClass) {
      case 'FIRST_AC':
        return 'bg-purple-100 text-purple-800';
      case 'SECOND_AC':
        return 'bg-blue-100 text-blue-800';
      case 'THIRD_AC':
        return 'bg-green-100 text-green-800';
      case 'SLEEPER':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || (!user.isVendor && !user.vendor) || user.vendorType !== 'TRAIN_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Train Administration</h1>
              <p className="text-gray-600 mt-1">
                Manage trains, schedules, and pricing for your railway services
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/user/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button 
                variant="primary"
                onClick={() => setShowAddTrain(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Train
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Trains</p>
                  <p className="text-2xl font-semibold text-gray-900">{trains.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Trains</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Array.isArray(trains) ? trains.filter(train => train.status === 'ACTIVE').length : 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive Trains</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Array.isArray(trains) ? trains.filter(train => train.status === 'INACTIVE').length : 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Seats</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Array.isArray(trains) ? trains.reduce((sum, train) => sum + train.totalSeats, 0) : 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Trains Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Trains</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : Array.isArray(trains) && trains.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Train Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacity & Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trains.map((train) => (
                      <tr key={train.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{train.trainName}</div>
                            <div className="text-sm text-gray-500">{train.trainNumber}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTrainClassColor(train.trainClass)}`}>
                              {train.trainClass.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <div>{train.sourceStation}</div>
                              <div className="text-gray-500">to</div>
                              <div>{train.destinationStation}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{formatTime(train.departureTime)}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{formatTime(train.arrivalTime)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(train.departureTime)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{train.totalSeats} seats</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <CurrencyRupeeIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span>₹{train.price}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Available: {train.availableSeats}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(train.status)}`}>
                            {train.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(train)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusToggle(train.id, train.status)}
                              className={`${train.status === 'ACTIVE' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            >
                              {train.status === 'ACTIVE' ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteTrain(train.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trains found</h3>
                <p className="text-gray-600 mb-4">
                  Start by adding your first train to the system.
                </p>
                <Button variant="primary" onClick={() => setShowAddTrain(true)}>
                  Add First Train
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add/Edit Train Modal */}
      {(showAddTrain || editingTrain) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingTrain ? 'Edit Train' : 'Add New Train'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddTrain(false);
                    setEditingTrain(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={editingTrain ? handleEditTrain : handleAddTrain} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Train Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={trainForm.trainName}
                      onChange={(e) => setTrainForm({...trainForm, trainName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Train Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={trainForm.trainNumber}
                      onChange={(e) => setTrainForm({...trainForm, trainNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Station *
                    </label>
                    <input
                      type="text"
                      required
                      value={trainForm.sourceStation}
                      onChange={(e) => setTrainForm({...trainForm, sourceStation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Station *
                    </label>
                    <input
                      type="text"
                      required
                      value={trainForm.destinationStation}
                      onChange={(e) => setTrainForm({...trainForm, destinationStation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={trainForm.departureTime}
                      onChange={(e) => setTrainForm({...trainForm, departureTime: e.target.value})}
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
                      value={trainForm.arrivalTime}
                      onChange={(e) => setTrainForm({...trainForm, arrivalTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Seats *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={trainForm.totalSeats}
                      onChange={(e) => setTrainForm({...trainForm, totalSeats: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Seat *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={trainForm.price}
                      onChange={(e) => setTrainForm({...trainForm, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Train Class *
                    </label>
                    <select
                      required
                      value={trainForm.trainClass}
                      onChange={(e) => setTrainForm({...trainForm, trainClass: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="FIRST_AC">First AC</option>
                      <option value="SECOND_AC">Second AC</option>
                      <option value="THIRD_AC">Third AC</option>
                      <option value="SLEEPER">Sleeper</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddTrain(false);
                      setEditingTrain(null);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{editingTrain ? 'Updating...' : 'Adding...'}</span>
                      </div>
                    ) : (
                      editingTrain ? 'Update Train' : 'Add Train'
                    )}
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

export default TrainAdmin;
