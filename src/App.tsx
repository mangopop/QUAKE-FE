import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Providers } from "./lib/providers";
import { AuthLayout } from "./components/auth/AuthLayout";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import TestList from "./pages/TestList";
import EditTest from "./pages/EditTest";
import Templates from "./pages/Templates";
import EditTemplate from "./pages/EditTemplate";
import Stories from "./pages/Stories";
import EditStory from "./pages/EditStory";
import AddTestToStory from "./pages/AddTestToStory";
import RunStory from "./pages/RunStory";
import StoryDetails from "./pages/StoryDetails";
import Layout from "./components/common/Layout";

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
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
                <Layout>
                  <Outlet />
                </Layout>
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