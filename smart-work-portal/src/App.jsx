import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider
import LoginPage from './pages/LoginPage';
import TeamLeadDashboard from './pages/TeamLeadDashboard';
import InternDashboard from './pages/InternDashboard';
import AdminDashboard from './pages/AdminDashboard'; // Admin Dashboard
import AdminRoute from './components/AdminRoute'; // Import AdminRoute

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/teamlead-dashboard" element={<TeamLeadDashboard />} />
          <Route path="/intern-dashboard" element={<InternDashboard />} />

          {/* Protect Admin Dashboard route */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
