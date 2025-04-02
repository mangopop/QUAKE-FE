import { Link, Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="mt-6 text-4xl font-bold text-white">UATOPIA</h1>
          <p className="mt-2 text-sm text-white/80">
            Your Testing Utopia
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <Outlet />
        </div>

        <div className="text-center">
          <p className="text-sm text-white/80">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-white hover:text-white/90">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}