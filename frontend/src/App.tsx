import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/common/Navbar';
import Workspaces from './components/Dashboard/Workspaces';
import Boards from './components/Workspace/Boards';
import KanbanBoard from './components/Board/KanbanBoard';

const ProtectedRoute: React.FC = () => {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<><Navbar /><Workspaces /></>} />
        <Route path="/workspace/:id" element={<><Navbar /><Boards /></>} />
        <Route path="/board/:boardId" element={<><Navbar /><KanbanBoard /></>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Router>
);

const App: React.FC = () => (
  <AuthProvider>
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AppContent />
    </div>
  </AuthProvider>
);

export default App;
