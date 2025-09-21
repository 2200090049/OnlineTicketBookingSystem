import { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';

// Initial state
const initialState = {
  currentBooking: null,
  bookingHistory: [],
  selectedSeats: [],
  selectedEvent: null,
  selectedDate: null,
  selectedTime: null,
  passengerDetails: {},
  isLoading: false,
  error: null,
};

// Action types
const BOOKING_ACTIONS = {
  SET_EVENT: 'SET_EVENT',
  SET_DATE: 'SET_DATE',
  SET_TIME: 'SET_TIME',
  SET_SEATS: 'SET_SEATS',
  SET_PASSENGER_DETAILS: 'SET_PASSENGER_DETAILS',
  START_BOOKING: 'START_BOOKING',
  BOOKING_SUCCESS: 'BOOKING_SUCCESS',
  BOOKING_FAILURE: 'BOOKING_FAILURE',
  CLEAR_BOOKING: 'CLEAR_BOOKING',
  LOAD_BOOKING_HISTORY: 'LOAD_BOOKING_HISTORY',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const bookingReducer = (state, action) => {
  switch (action.type) {
    case BOOKING_ACTIONS.SET_EVENT:
      return {
        ...state,
        selectedEvent: action.payload,
        selectedSeats: [], // Clear seats when event changes
      };
    
    case BOOKING_ACTIONS.SET_DATE:
      return {
        ...state,
        selectedDate: action.payload,
        selectedTime: null, // Clear time when date changes
      };
    
    case BOOKING_ACTIONS.SET_TIME:
      return {
        ...state,
        selectedTime: action.payload,
      };
    
    case BOOKING_ACTIONS.SET_SEATS:
      return {
        ...state,
        selectedSeats: action.payload,
      };
    
    case BOOKING_ACTIONS.SET_PASSENGER_DETAILS:
      return {
        ...state,
        passengerDetails: { ...state.passengerDetails, ...action.payload },
      };
    
    case BOOKING_ACTIONS.START_BOOKING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case BOOKING_ACTIONS.BOOKING_SUCCESS:
      return {
        ...state,
        currentBooking: action.payload,
        bookingHistory: [action.payload, ...state.bookingHistory],
        isLoading: false,
        error: null,
        // Clear current selection after successful booking
        selectedSeats: [],
        selectedEvent: null,
        selectedDate: null,
        selectedTime: null,
        passengerDetails: {},
      };
    
    case BOOKING_ACTIONS.BOOKING_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    
    case BOOKING_ACTIONS.CLEAR_BOOKING:
      return {
        ...state,
        selectedSeats: [],
        selectedEvent: null,
        selectedDate: null,
        selectedTime: null,
        passengerDetails: {},
        currentBooking: null,
        error: null,
      };
    
    case BOOKING_ACTIONS.LOAD_BOOKING_HISTORY:
      return {
        ...state,
        bookingHistory: action.payload,
      };
    
    case BOOKING_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Create context
const BookingContext = createContext();

// Booking Provider component
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Set selected event
  const setSelectedEvent = (event) => {
    dispatch({
      type: BOOKING_ACTIONS.SET_EVENT,
      payload: event,
    });
  };

  // Set selected date
  const setSelectedDate = (date) => {
    dispatch({
      type: BOOKING_ACTIONS.SET_DATE,
      payload: date,
    });
  };

  // Set selected time
  const setSelectedTime = (time) => {
    dispatch({
      type: BOOKING_ACTIONS.SET_TIME,
      payload: time,
    });
  };

  // Set selected seats
  const setSelectedSeats = (seats) => {
    dispatch({
      type: BOOKING_ACTIONS.SET_SEATS,
      payload: seats,
    });
  };

  // Set passenger details
  const setPassengerDetails = (details) => {
    dispatch({
      type: BOOKING_ACTIONS.SET_PASSENGER_DETAILS,
      payload: details,
    });
  };

  // Create booking
  const createBooking = async (paymentDetails) => {
    dispatch({ type: BOOKING_ACTIONS.START_BOOKING });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const booking = {
        id: `BK${Date.now()}`,
        event: state.selectedEvent,
        date: state.selectedDate,
        time: state.selectedTime,
        seats: state.selectedSeats,
        passengers: state.passengerDetails,
        payment: paymentDetails,
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
        totalAmount: calculateTotalAmount(),
      };
      
      dispatch({
        type: BOOKING_ACTIONS.BOOKING_SUCCESS,
        payload: booking,
      });
      
      return { success: true, booking };
    } catch (error) {
      dispatch({
        type: BOOKING_ACTIONS.BOOKING_FAILURE,
        payload: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    if (!state.selectedEvent || !state.selectedSeats.length) return 0;
    
    const basePrice = state.selectedEvent.price || 0;
    const seatCount = state.selectedSeats.length;
    const subtotal = basePrice * seatCount;
    const taxes = subtotal * 0.18; // 18% tax
    const convenienceFee = seatCount * 20; // ₹20 per seat
    
    return subtotal + taxes + convenienceFee;
  };

  // Clear current booking
  const clearBooking = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_BOOKING });
  };

  // Load booking history
  const loadBookingHistory = (history) => {
    dispatch({
      type: BOOKING_ACTIONS.LOAD_BOOKING_HISTORY,
      payload: history,
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });
  };

  // Get booking summary
  const getBookingSummary = () => {
    if (!state.selectedEvent) return null;
    
    return {
      event: state.selectedEvent,
      date: state.selectedDate,
      time: state.selectedTime,
      seats: state.selectedSeats,
      seatCount: state.selectedSeats.length,
      baseAmount: (state.selectedEvent.price || 0) * state.selectedSeats.length,
      taxes: ((state.selectedEvent.price || 0) * state.selectedSeats.length) * 0.18,
      convenienceFee: state.selectedSeats.length * 20,
      totalAmount: calculateTotalAmount(),
    };
  };

  const value = {
    ...state,
    setSelectedEvent,
    setSelectedDate,
    setSelectedTime,
    setSelectedSeats,
    setPassengerDetails,
    createBooking,
    clearBooking,
    loadBookingHistory,
    clearError,
    getBookingSummary,
    calculateTotalAmount,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

BookingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BookingContext;