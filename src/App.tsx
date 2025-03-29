import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import TestList from "./pages/TestList";
import NewTestEntry from "./pages/TestEntry";
import Templates from "./pages/Templates";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">Q.U.A.K.E</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <NavLink to="/tests">View Tests</NavLink>
                  <NavLink to="/tests/new">Create Test</NavLink>
                  <NavLink to="/templates">Templates</NavLink>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<TestList />} />
            <Route path="/tests" element={<TestList />} />
            <Route path="/tests/new" element={<NewTestEntry />} />
            <Route path="/templates" element={<Templates />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}