import { useState } from "react";

const navItems = [
  { icon: "⊞", label: "Dashboard", path: "dashboard", active: true },
  { icon: "＋", label: "Add Expense", path: "add" },
  { icon: "☰", label: "Expenses", path: "expenses" },
  { icon: "◎", label: "Budgets", path: "budgets" },
  { icon: "↗", label: "Reports", path: "reports" },
  { icon: "⊙", label: "Settings", path: "settings" },
];

const expenses = [
  { id: 1, title: "Netflix Subscription", category: "Entertainment", amount: 649, date: "Today", icon: "🎬", color: "bg-red-500/20 text-red-400" },
  { id: 2, title: "Grocery Store", category: "Food", amount: 1820, date: "Today", icon: "🛒", color: "bg-green-500/20 text-green-400" },
  { id: 3, title: "Uber Ride", category: "Transport", amount: 340, date: "Yesterday", icon: "🚗", color: "bg-yellow-500/20 text-yellow-400" },
  { id: 4, title: "Electricity Bill", category: "Utilities", amount: 2100, date: "Mar 28", icon: "⚡", color: "bg-blue-500/20 text-blue-400" },
  { id: 5, title: "Gym Membership", category: "Health", amount: 999, date: "Mar 27", icon: "💪", color: "bg-purple-500/20 text-purple-400" },
];

const categoryData = [
  { name: "Food", amount: 8420, percent: 35, color: "#3b82f6" },
  { name: "Transport", amount: 3200, percent: 18, color: "#6366f1" },
  { name: "Utilities", amount: 4100, percent: 22, color: "#8b5cf6" },
  { name: "Entertainment", amount: 2400, percent: 14, color: "#06b6d4" },
  { name: "Health", amount: 2100, percent: 11, color: "#0ea5e9" },
];

const StatCard = ({ label, value, sub, accent, icon }) => (
  <div className={`relative bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-hidden group hover:border-slate-700 transition-all duration-300`}>
    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 ${accent}`} />
    <div className="flex items-start justify-between mb-4">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${accent} bg-opacity-20 border border-current border-opacity-20`}>
        {sub}
      </span>
    </div>
    <p className="text-slate-500 text-xs tracking-widest uppercase mb-1">{label}</p>
    <p className="text-white text-2xl font-black">{value}</p>
  </div>
);

const DonutChart = ({ data }) => {
  const size = 120;
  const radius = 44;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Smaller, centered donut */}
      <svg width={size} height={size} className="-rotate-90 shrink-0">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1e293b" strokeWidth="14" />
        {data.map((item, i) => {
          const dash = (item.percent / 100) * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>

      {/* Legend wraps into a 2-col grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-slate-400 text-xs truncate">{item.name}</span>
            </div>
            <span className="text-slate-300 text-xs font-semibold shrink-0 ml-1">
              ₹{item.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SpendingBar = ({ day, amount, max, isToday }) => {
  const height = Math.max(8, (amount / max) * 80);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-20 flex items-end">
        <div
          className={`w-8 rounded-t-lg transition-all duration-500 ${isToday ? "bg-blue-500" : "bg-slate-700 hover:bg-slate-600"}`}
          style={{ height: `${height}px` }}
        />
      </div>
      <span className={`text-xs ${isToday ? "text-blue-400 font-bold" : "text-slate-600"}`}>{day}</span>
    </div>
  );
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const weekData = [
    { day: "Mon", amount: 1200 },
    { day: "Tue", amount: 3400 },
    { day: "Wed", amount: 800 },
    { day: "Thu", amount: 2100 },
    { day: "Fri", amount: 1600 },
    { day: "Sat", amount: 4200 },
    { day: "Sun", amount: 2469 },
  ];
  const maxAmount = Math.max(...weekData.map(d => d.amount));

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-white">

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-white transition-colors text-xl"
            >
              ☰
            </button> */}
            <div>
              <h1 className="text-lg font-black">Good morning, Vikram 👋</h1>
              <p className="text-xs text-slate-500">Tuesday, 31 March 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/25" >
              <span>＋</span> Add Expense
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Spent" value="₹24,069" sub="↑ 12% this month" accent="bg-blue-500 text-white-400" icon="💸" />
            <StatCard label="Monthly Budget" value="₹35,000" sub="₹10,931 left" accent="bg-indigo-500 text-white-400" icon="🎯" />
            <StatCard label="Transactions" value="47" sub="This month" accent="bg-violet-500 text-white-400" icon="📊" />
            <StatCard label="Biggest Spend" value="₹4,200" sub="Saturday" accent="bg-cyan-500 text-white-400" icon="🔺" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6">

            {/* Weekly Bar Chart */}
            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-white">Weekly Spending</h2>
                  <p className="text-xs text-slate-500 mt-0.5">March 25 – 31</p>
                </div>
                <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">This Week</span>
              </div>
              <div className="flex items-end justify-between px-2">
                {weekData.map((d, i) => (
                  <SpendingBar key={i} day={d.day} amount={d.amount} max={maxAmount} isToday={i === 6} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 text-xs">Total this week</span>
                <span className="text-white font-bold">₹{weekData.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Donut Category */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="font-bold text-white mb-1">By Category</h2>
              <p className="text-xs text-slate-500 mb-5">This month</p>
              <DonutChart data={categoryData} />
            </div>
          </div>

          {/* Budget Progress */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">Budget Overview</h2>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Manage →</button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { name: "Food & Dining", spent: 8420, total: 10000, color: "bg-blue-500" },
                { name: "Transport", spent: 3200, total: 4000, color: "bg-indigo-500" },
                { name: "Entertainment", spent: 2400, total: 2000, color: "bg-red-500" },
              ].map((b, i) => {
                const pct = Math.min(100, Math.round((b.spent / b.total) * 100));
                const over = b.spent > b.total;
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-300">{b.name}</span>
                      <span className={`text-xs font-bold ${over ? "text-red-400" : "text-slate-500"}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${over ? "bg-red-500" : b.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-slate-600">₹{b.spent.toLocaleString()}</span>
                      <span className="text-xs text-slate-600">₹{b.total.toLocaleString()}</span>
                    </div>
                    {over && (
                      <p className="text-xs text-red-400 mt-1 font-semibold">Over budget by ₹{(b.spent - b.total).toLocaleString()}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">Recent Transactions</h2>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</button>
            </div>
            <div className="space-y-1">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${exp.color}`}>
                    {exp.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{exp.title}</p>
                    <p className="text-xs text-slate-500">{exp.category} · {exp.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">−₹{exp.amount.toLocaleString()}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 transition-all text-lg">⋯</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
