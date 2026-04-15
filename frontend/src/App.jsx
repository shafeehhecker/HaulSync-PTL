import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookingsPage from "./pages/Bookings/BookingsPage";
import ManifestsPage from "./pages/Manifests/ManifestsPage";
import LabelsPage from "./pages/Labels/LabelsPage";
import ePODPage from "./pages/ePOD/ePODPage";
import ReversePage from "./pages/Reverse/ReversePage";
import VendorsPage from "./pages/Vendors/VendorsPage";
import AnalyticsPage from "./pages/Analytics/AnalyticsPage";
import MISPage from "./pages/MIS/MISPage";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="manifests" element={<ManifestsPage />} />
        <Route path="labels" element={<LabelsPage />} />
        <Route path="epod" element={<ePODPage />} />
        <Route path="reverse" element={<ReversePage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="mis" element={<MISPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
