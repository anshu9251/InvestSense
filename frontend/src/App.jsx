import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/layout/Sidebar";
import MobileNav from "./components/layout/MobileNav";
import DashboardPage from "./pages/DashboardPage";
import PortfolioPage from "./pages/PortfolioPage";
import AIResearchPage from "./pages/AIResearchPage";
import MarketsPage from "./pages/MarketsPage";
import WatchlistPage from "./pages/WatchlistPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FloatingAIAgent from "./components/agent/FloatingAIAgent";
import "./App.css";

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
      <MobileNav />
      <FloatingAIAgent />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout><DashboardPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <AppLayout><PortfolioPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-research"
              element={
                <ProtectedRoute>
                  <AppLayout><AIResearchPage /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/markets" element={<ProtectedRoute><AppLayout><MarketsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/watchlist" element={<ProtectedRoute><AppLayout><WatchlistPage /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
