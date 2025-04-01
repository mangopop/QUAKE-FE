import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet } from "react-router-dom";
import { Providers } from "./lib/providers";
import { AuthLayout } from "./components/auth/AuthLayout";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import TestList from "./pages/TestList";
import NewTestEntry from "./pages/NewTestEntry";
import EditTest from "./pages/EditTest";
import Templates from "./pages/Templates";
import EditTemplate from "./pages/EditTemplate";
import Stories from "./pages/Stories";
import EditStory from "./pages/EditStory";
import ViewStory from "./pages/ViewStory";
import CreateStory from "./pages/CreateStory";
import AddTestToStory from "./pages/AddTestToStory";
import RunStory from "./pages/RunStory";
import StoryDetails from "./pages/StoryDetails";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-4 py-2 text-sm font-medium ${
        isActive
          ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Main layout with navigation
function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Q.U.A.K.E</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
                <NavLink to="/tests">View Tests</NavLink>
                <NavLink to="/templates">Templates</NavLink>
                <NavLink to="/stories">Stories</NavLink>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Providers>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="login" element={<LoginForm />} />
            <Route path="register" element={<RegisterForm />} />
          </Route>

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="tests">
              <Route index element={<TestList />} />
              <Route path=":testId/edit" element={<EditTest />} />
            </Route>
            <Route path="templates">
              <Route index element={<Templates />} />
              <Route path=":templateId/edit" element={<EditTemplate />} />
            </Route>
            <Route path="stories">
              <Route index element={<Stories />} />
              <Route path=":storyId" element={<StoryDetails />} />
              <Route path=":storyId/add-test" element={<AddTestToStory />} />
              <Route path=":storyId/edit" element={<EditStory />} />
              <Route path=":storyId/run" element={<RunStory />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </Providers>
  );
}