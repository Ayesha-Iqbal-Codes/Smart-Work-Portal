import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // import the AuthProvider
import LoginPage from './pages/LoginPage';
import TeamLeadDashboard from './pages/TeamLeadDashboard';
import InternDashboard from './pages/InternDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/teamlead-dashboard" element={<TeamLeadDashboard />} />
          <Route path="/intern-dashboard" element={<InternDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
