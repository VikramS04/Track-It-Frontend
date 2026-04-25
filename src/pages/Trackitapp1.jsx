import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearAuth, getStoredUser, isAuthenticated } from "../lib/api";

export default function Trackitapp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const navItems = [
    { icon: "⊞", label: "Dashboard", path: "dashboard" },
    { icon: "＋", label: "Add Expense", path: "add-expense" },
    { icon: "☰", label: "Expenses", path: "expenses" },
    { icon: "◎", label: "Budgets", path: "budget" },
    { icon: "↗", label: "Reports", path: "reports" },
    { icon: "⊙", label: "Settings", path: "settings" },
  ];

  const activePage = navItems.find(
    (item) => location.pathname.includes(item.path)
  )?.path ?? "dashboard";

  return (
    <div className="min-h-screen flex bg-slate-950 text-white">

      {/* Sidebar */}
      <aside
        style={{ width: sidebarOpen ? "15rem" : "4.5rem" }}
        className="bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 shrink-0 overflow-hidden"
      >
        {/* Logo + Hamburger Button*/}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 rotate-12">
                  <span className="text-white font-black text-base -rotate-12">₹</span>
                </div>
                <span className="text-xl font-black tracking-tight">
                  Track<span className="text-blue-400">It</span>
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Collapse sidebar"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full flex items-center justify-center py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Expand sidebar"
            >
              ☰
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                activePage === item.path
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
              {user?.firstName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "TrackIt User"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email || "Not signed in"}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => {
                clearAuth();
                navigate("/login", { replace: true });
              }}
              className="mt-3 w-full rounded-lg border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
            >
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

    </div>
  );
}
