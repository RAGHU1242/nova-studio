import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="max-w-md w-full mx-auto px-4">
        <div className="text-center space-y-6">
          <div className="text-7xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            404
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
            <p className="text-slate-400 text-lg">
              Looks like this arena doesn't exist or has been destroyed in battle.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <p className="text-sm text-slate-300 mb-4">
              Check the URL or head back to the main arena to continue your journey.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 font-semibold transition hover:shadow-lg hover:shadow-violet-600/50"
            >
              Back to Home
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700 font-semibold transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
