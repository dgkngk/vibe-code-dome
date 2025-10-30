import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useParams,
} from "react-router-dom";
import { WebSocketProvider } from "./contexts/WebSocketContext.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext.tsx";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext.tsx";
import Login from "./components/Auth/Login.tsx";
import Register from "./components/Auth/Register.tsx";
import Navbar from "./components/common/Navbar.tsx";
import Sidebar from "./components/common/Sidebar.tsx";
import WorkspaceWrapper from "./components/Workspace/WorkspaceWrapper.tsx";
import KanbanBoard from "./components/Board/KanbanBoard.tsx";
import KanbanBoardWrapper from "./components/Board/KanbanBoardWrapper.tsx";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
};

const DashboardPlaceholder: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500 dark:text-gray-400">
        {t("select.workspace")}
      </p>
    </div>
  );
};

const AppContent: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<DashboardPlaceholder />} />
      <Route path="/workspace/:id" element={<WorkspaceWrapper />} />
      <Route path="/board/:boardId" element={<KanbanBoardWrapper />} />
    </Route>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const Footer: React.FC = () => {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <div>{t("footer.message")}</div>
        <div className="mt-2 flex justify-center space-x-4 items-center">
          <button
            onClick={() => setLang("en")}
            className={`px-2 py-1 rounded ${lang === "en" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-600"}`}
          >
            {t("language.english")}
          </button>
          <button
            onClick={() => setLang("tr")}
            className={`px-2 py-1 rounded ${lang === "tr" ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-600"}`}
          >
            {t("language.turkish")}
          </button>
          <button
            onClick={toggleTheme}
            className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
              <AppContent />
              <Footer />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
