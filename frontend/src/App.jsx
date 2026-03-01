import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* If the URL is just "/", show the Login Page */}
        <Route path="/" element={<LoginPage />} />
        
        {/* If the URL is "/dashboard", show the Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;