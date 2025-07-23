// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Navbar.tsx";
import Ku from "./components/Ku.tsx";
import WeatherStation from "./components/WeatherStation.tsx";
import Ka from "./components/Ka.tsx";
import Download from "./components/Download.tsx";
import Login from "./components/Login.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

// Routes layout
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const hideSidebar = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-white">
      {!hideSidebar && <Sidebar />}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <WeatherStation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ku"
            element={
              <ProtectedRoute>
                <Ku />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ka"
            element={
              <ProtectedRoute>
                <Ka />
              </ProtectedRoute>
            }
          />
         
          <Route
            path="/download"
            element={
              <ProtectedRoute>
                <Download />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

// Main app entry
const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
