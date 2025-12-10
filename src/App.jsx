import SideNav from './Components/Sidenav';
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home.jsx';
import Jobs from './Pages/Jobs.jsx';
import Profile from './Pages/Profile.jsx';
import PostJob from './Pages/JobPost.jsx';
import Applications from './Pages/Applications.jsx';
import SignIn from './Pages/SignIn.jsx';
import JobDashboard from './Pages/JobDashboard.jsx';
import SignUp from './Pages/SignUp.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx'; // ✅ add this

function App() {
  return (
    <div className="app-shell">
      <SideNav />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/companies" element={<Jobs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post" element={<PostJob />} />
          <Route path="/applications" element={<Applications />} />

          {/* New Auth / Dashboard Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/job-dashboard" element={<JobDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} /> {/* ✅ admin */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
