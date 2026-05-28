import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Pages
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyTickets from './pages/user/MyTickets';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDest from './pages/admin/Destinations';
import AdminTickets from './pages/admin/Tickets';
import AdminReviews from './pages/admin/Reviews';
import SADashboard from './pages/superadmin/Dashboard';
import SAUsers from './pages/superadmin/Users';
import SASettings from './pages/superadmin/Settings';
import PaymentPage from './pages/payment/PaymentPage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import BookingPage from './pages/booking/BookingPage';
import AdminTicketScanner from './pages/admin/TicketScanner';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Tiket */}
          <Route path="/admin/scan-tiket" element={<RoleRoute roles={['admin','super_admin']}><AdminTicketScanner /></RoleRoute>} />
          {/* Booking */}
          <Route path="/pesan-tiket" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          {/* Payment */}
          <Route path="/pembayaran" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/pembayaran/selesai" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User */}
          <Route path="/tiket-saya" element={
            <ProtectedRoute><MyTickets /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <RoleRoute roles={['admin', 'super_admin']}>
              <AdminDashboard />
            </RoleRoute>
          } />
          <Route path="/admin/destinasi" element={
            <RoleRoute roles={['admin', 'super_admin']}>
              <AdminDest />
            </RoleRoute>
          } />
          <Route path="/admin/tiket" element={
            <RoleRoute roles={['admin', 'super_admin']}>
              <AdminTickets />
            </RoleRoute>
          } />
          <Route path="/admin/ulasan" element={
            <RoleRoute roles={['admin', 'super_admin']}>
              <AdminReviews />
            </RoleRoute>
          } />

          {/* Super Admin */}
          <Route path="/super-admin" element={
            <RoleRoute roles={['super_admin']}>
              <SADashboard />
            </RoleRoute>
          } />
          <Route path="/super-admin/pengguna" element={
            <RoleRoute roles={['super_admin']}>
              <SAUsers />
            </RoleRoute>
          } />
          <Route path="/super-admin/pengaturan" element={
            <RoleRoute roles={['super_admin']}>
              <SASettings />
            </RoleRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}