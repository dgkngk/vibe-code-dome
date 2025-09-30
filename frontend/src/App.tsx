import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import Login from './components/Auth/Login.tsx';
import Register from './components/Auth/Register.tsx';
import Navbar from './components/common/Navbar.tsx';
import Sidebar from './components/common/Sidebar.tsx';
import Boards from './components/Workspace/Boards.tsx';
import KanbanBoard from './components/Board/KanbanBoard.tsx';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const DashboardLayout: React.FC = () => (
  <>
    <Navbar />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </>
);

const DashboardPlaceholder: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <p className="text-gray-500">Select a workspace from the sidebar to get started.</p>
  </div>
);

const AppContent: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<DashboardPlaceholder />} />
      <Route path="/workspace/:id" element={<Boards />} />
      <Route path="/board/:boardId" element={<KanbanBoard />} />
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
