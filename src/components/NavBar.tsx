
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">QA App</Link>
        <div>
          <Link to="/" className="mx-4">Home</Link>
          <Link to="/search" className="mx-4">Search</Link>
          <Link to="/dashboard" className="mx-4">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
}