# Frontend Setup Instructions

## Environment Configuration

Create a `.env` file in the frontend directory with the following content:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:2002/api

# App Configuration
VITE_APP_NAME=TicketBook
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development
```

## Features Implemented

### ✅ Authentication & Authorization
- **Logout functionality** in navbar with dropdown menu
- **Role-based routing**: 
  - Admin users → Admin Dashboard
  - Regular users → User Dashboard
- **Automatic redirects** after login/registration

### ✅ User Dashboard
- **Booking options**: Movie, Bus, Train booking
- **Recent bookings** display
- **Quick actions** for profile, bookings, support, settings
- **Responsive design** with modern UI

### ✅ Admin Dashboard
- **Statistics overview**: Total trains, bookings, revenue, active trains
- **Add new trains** with modal form
- **Recent bookings** table view
- **Quick actions** for managing trains, bookings, and reports

### ✅ Train Booking System
- **Search trains** by source, destination, date, passengers
- **View train details** with pricing and availability
- **Book tickets** with passenger information
- **Automatic PDF download** after successful booking
- **Real-time seat availability** checking

### ✅ API Integration
- **Environment-based URL configuration** (no hardcoded URLs)
- **Train API endpoints** for admin and user operations
- **Booking API endpoints** with PDF download support
- **Error handling** and loading states

## Usage Flow

1. **User Registration/Login**: Users register as regular users, admins are created via backend
2. **Role-based Navigation**: 
   - Admin → Admin Dashboard (manage trains, view bookings)
   - User → User Dashboard (book tickets, view bookings)
3. **Train Booking Process**:
   - User searches for trains
   - Selects train and fills passenger details
   - Books ticket and automatically downloads PDF
4. **Admin Management**:
   - Add new trains with all details
   - View booking statistics and recent bookings
   - Manage train availability and pricing

## API Endpoints Used

- `GET /trains/search` - Search available trains
- `POST /trains/admin/add` - Admin add new train
- `POST /bookings/book` - User book train ticket
- `GET /bookings/my-bookings` - Get user bookings
- `GET /bookings/{id}/download` - Download ticket PDF
- `GET /bookings/admin/all` - Admin view all bookings
- `GET /bookings/admin/statistics` - Get booking statistics

## Next Steps

1. Copy the `.env` content above to a new `.env` file
2. Start the backend server on port 2002
3. Start the frontend development server
4. Test the complete flow: Admin adds trains → User books tickets → PDF download
