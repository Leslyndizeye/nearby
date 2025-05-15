import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserDashboard from './pages/userDashboard.jsx';
import PharmacyDashboard from './pages/pharmacyDashboard.jsx';
import LoginPage from './pages/loginPage.jsx';
import OnboardPharmacy from './pages/onboardPharmacy.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/pharmacy" element={<PharmacyDashboard />} />
        <Route path="/onboard-pharmacy" element={<OnboardPharmacy />} />
      </Routes>
    </Router>
  );
}

export default App;
