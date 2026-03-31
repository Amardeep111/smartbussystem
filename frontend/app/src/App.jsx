import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { TrackingProvider } from "./context/Trackingcontext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/Layout";

// Passenger
import PassengerDashboard from "./pages/passenger/Dashboard";
import SearchBus from "./pages/passenger/SearchBus";
import BookTicket from "./pages/passenger/BookTicket";
import MyBookings from "./pages/passenger/MyBookings";
import TrackBus from "./pages/passenger/TrackBus";

// Driver
import DriverDashboard from "./pages/driver/Dashboard";

// Conductor
import ConductorDashboard from "./pages/conductor/Dashboard";
import CheckIn from "./pages/conductor/CheckIn";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import ManageBuses from "./pages/admin/ManageBuses";
import ManageStops from "./pages/admin/ManageStops";
import ManageUsers from "./pages/admin/ManageUsers";
import EmergencyAlerts from "./pages/admin/EmergencyAlerts";

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes = {
    passenger: "/passenger",
    driver: "/driver",
    conductor: "/conductor",
    admin: "/admin",
  };
  return <Navigate to={routes[user.role] || "/login"} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <TrackingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<HomeRedirect />} />

            {/* Passenger */}
            <Route path="/passenger" element={<RoleRoute roles={["passenger"]}><Layout /></RoleRoute>}>
              <Route index element={<PassengerDashboard />} />
              <Route path="search" element={<SearchBus />} />
              <Route path="book/:busId" element={<BookTicket />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="track/:busId" element={<TrackBus />} />
            </Route>

            {/* Driver */}
            <Route path="/driver" element={<RoleRoute roles={["driver"]}><Layout /></RoleRoute>}>
              <Route index element={<DriverDashboard />} />
            </Route>

            {/* Conductor */}
            <Route path="/conductor" element={<RoleRoute roles={["conductor"]}><Layout /></RoleRoute>}>
              <Route index element={<ConductorDashboard />} />
              <Route path="checkin" element={<CheckIn />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<RoleRoute roles={["admin"]}><Layout /></RoleRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="buses" element={<ManageBuses />} />
              <Route path="stops" element={<ManageStops />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="emergency" element={<EmergencyAlerts />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </TrackingProvider>
      </SocketProvider>
    </AuthProvider>
  );
}


// in admin no alerts is showing and in admin i assinged a driver to a bus but when i am loggedin through the driver showing no bus allotted and same with conductor and ya another feature is there must be another page in conductor app which will show the list of user currectly in the bus if onboarded and if left remove name from table table must consist of name travel root and ya when any user click sos other users connected to the same bus must get alert etc and add all other important required features which i am missing