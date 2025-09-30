import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import Login from './components/Auth/Login.tsx';
import Register from './components/Auth/Register.tsx';
import Navbar from './components/common/Navbar.tsx';
import Workspaces from './components/Dashboard/Workspaces.tsx';
import Boards from './components/Workspace/Boards.tsx';
import KanbanBoard from './components/Board/KanbanBoard.tsx';

const ProtectedRoute: React.FC = () => {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => (
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
);

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <AppContent />
      </div>
    </AuthProvider>
  </Router>
);

export default App;
