# Society Management System

A comprehensive web application for managing residential societies, built with React and Node.js. This system streamlines property management, resident tracking, maintenance requests, and society operations.

## Features

- **Room Management**  
  Efficiently manage property rooms with detailed tracking and organization.

- **Family & Renter Management**  
  Maintain comprehensive profiles for family members and renters with easy access to information.

- **Secure Access**  
  Role-based access control ensuring data security and privacy for all users.

- **Easy Authentication**  
  Simple and secure login system powered by Firebase for smooth onboarding.

- **Online/Offline Maintenance**  
  Track maintenance requests, manage their statuses, and automatically notify users on updates.

- **24-Hour Maintenance Reminders**  
  Automatically send reminders via in-app notifications, messages, and email 24 hours before scheduled maintenance.

- **Unpaid Maintenance Alerts**  
  Automatically notify residents about pending maintenance payments with timely in-app, SMS, and email alerts.

- **Events and Updates**  
  Keep residents informed with announcements and timely updates.

- **Real-Time Notifications**  
  Instantly notify users of new events, updates, notices, and maintenance activities.

- **Rules and Committee**  
  Manage and update society rules and committee member information effectively.

- **Banking**  
  Track society funds, process internal transactions, and generate detailed financial reports.

- **Resident Queries**  
  Allow residents to submit and track queries with a system designed for quick resolution.

## Project Structure
```
society-management/
│
├── .gitignore                  # Git ignore file
│
├── backend/                    # Node.js + Express Backend
│   ├── config/
│   │   └── serviceAccountKey.json
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js   # Authentication & role verification
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── renterRoutes.js
│   ├── scripts/
│   │   └── setupSecretaryWithRooms.js
│   ├── server.js               # Main Express server
│   ├── firebase.js             # Firebase Admin SDK config
│   ├── package.json
│   └── .env
│
└── frontend/                   # React Frontend
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── assets/
    │   │   └── logo.svg
    │   ├── components/         # Reusable components
    │   │   ├── Navbar.js
    │   │   ├── Footer.js
    │   │   └── ProtectedRoute.js
    │   ├── pages/
    │   │   ├── Dashboard/
    │   │   │   ├── Dashboard.js
    │   │   │   └── SecretaryDashboard.js
    │   │   ├── Operations/
    │   │   │   ├── AddRenterModal.js
    │   │   │   ├── OwnerConfirmationModal.js
    │   │   │   └── OwnerCredentialsModal.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Error.js
    │   │   ├── Home.js
    │   │   └── ForgotPassword.js
    │   ├── context/
    │   │   └── AuthContext.js  # Authentication state management
    │   ├── utils/
    │   │   ├── api.js          # Axios API helper
    │   │   └── socket.js       # Socket.IO configuration
    │   ├── App.js
    │   ├── index.js
    │   └── firebase.js         # Firebase client config
    └── package.json

```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- MongoDB (or your preferred database)

### Backend Setup

1. Navigate to the backend directory:
   cd backend


2. Install dependencies:
   npm install

3. Create a `.env` file in the backend directory:
   DATABASE_URL=your_database_url
   FIREBASE_PROJECT_ID=your_firebase_project_id
   NODE_ENV=development

4. Add your Firebase service account key:
   - Download the service account key from Firebase Console
   - Place it in `config/serviceAccountKey.json`

5. Start the backend server:
   npm start

### Frontend Setup

1. Navigate to the frontend directory:
   cd frontend

2. Install dependencies:
   npm install

3. Create a `.env` file in the frontend directory:
   REACT_APP_API_URL=http://localhost:PORT
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id

4. Start the development server:
   npm start

5. Open [http://localhost:PORT](http://localhost:PORT) in your browser

## Authentication

The system uses Firebase Authentication for secure user management:
- Email/Password authentication
- Role-based access control (Secretary, Owner, Renter)
- Protected routes for authenticated users
- Token verification middleware

## User Roles

- **Secretary** - Full access to manage society operations
- **Owner** - Manage owned properties and renters
- **Renter** - View assigned room and submit queries

## Technologies Used

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- Socket.IO (for real-time features)

### Frontend
- React.js
- React Context API (state management)
- Axios (API requests)
- Socket.IO Client
- Firebase Authentication

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### Users
- `GET /api/users` - Get all users (Secretary only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Renters
- `POST /api/renters` - Add new renter
- `GET /api/renters` - Get all renters
- `PUT /api/renters/:id` - Update renter
- `DELETE /api/renters/:id` - Remove renter

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Contact

For any questions or support, please contact the development team.

---

**Note:** Make sure to configure Firebase properly and secure your API keys before deploying to production.