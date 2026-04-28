import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getStoredUser } from "../lib/api";

const categoryColors = {
  Entertainment: "bg-red-500/20 text-red-400",
  Food: "bg-green-500/20 text-green-400",
  Transport: "bg-yellow-500/20 text-yellow-400",
  Utilities: "bg-blue-500/20 text-blue-400",
  Health: "bg-purple-500/20 text-purple-400",
  Shopping: "bg-pink-500/20 text-pink-400",
  Education: "bg-cyan-500/20 text-cyan-400",
  Housing: "bg-orange-500/20 text-orange-400",
};

const categoryIcons = {
  Entertainment: "🎬",
  Food: "🛒",
  Transport: "🚗",
  Utilities: "⚡",
  Health: "💪",
  Shopping: "🛍️",
  Education: "📚",
  Housing: "🏠",
};

const chartColors = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#0ea5e9", "#ec4899", "#f59e0b"];
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const StatCard = ({ label, value, sub, accent, icon }) => (
  <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-hidden group hover:border-slate-700 transition-all duration-300">
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
  const chartData = data.length ? data : [{ name: "No spending yet", amount: 0, percent: 100, color: "#334155" }];
  const chartSegments = chartData.reduce((acc, item) => {
    const dash = (item.percent / 100) * circumference;
    acc.items.push({ ...item, dash, offset: acc.total });
    acc.total += dash;
    return acc;
  }, { items: [], total: 0 }).items;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} className="-rotate-90 shrink-0">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1e293b" strokeWidth="14" />
        {chartSegments.map((item) => {
          const gap = circumference - item.dash;
          return (
            <circle
              key={item.name}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="14"
              strokeDasharray={`${item.dash} ${gap}`}
              strokeDashoffset={-item.offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}
      </svg>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between min-w-0">
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
  const height = Math.max(8, max ? (amount / max) * 80 : 8);
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

const getGreeting = (hour) => {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [summary, setSummary] = useState({
    totalSpent: 0,
    transactions: 0,
    biggestSpend: 0,
    weekly: [],
    categories: [],
    recent: [],
  });
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError("");

      try {
        const [summaryData, budgetData] = await Promise.all([
          apiRequest("/api/expenses/summary"),
          apiRequest("/api/budgets"),
        ]);
        setSummary(summaryData.summary);
        setBudgets(budgetData.budgets || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const weekData = useMemo(() => {
    const byDay = new Map(summary.weekly.map((item) => [item._id, item.amount]));
    return [2, 3, 4, 5, 6, 7, 1].map((dayNumber) => ({
      day: dayLabels[dayNumber - 1],
      amount: byDay.get(dayNumber) || 0,
    }));
  }, [summary.weekly]);

  const categoryData = useMemo(() => {
    const total = summary.categories.reduce((sum, item) => sum + item.amount, 0);
    return summary.categories.map((item, index) => ({
      ...item,
      percent: total ? Math.round((item.amount / total) * 100) : 0,
      color: chartColors[index % chartColors.length],
    }));
  }, [summary.categories]);

  const maxAmount = Math.max(...weekData.map((d) => d.amount));
  const monthlyBudget = budgets.reduce((sum, budget) => sum + budget.total, 0);
  const remainingBudget = monthlyBudget - summary.totalSpent;
  const today = currentTime;
  const todayDay = dayLabels[today.getDay()];
  const greeting = getGreeting(today.getHours());
  const dateLabel = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      <main className="min-w-0">
        <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-800/50 bg-slate-950/80 px-4 py-4 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="min-w-0">
            <h1 className="text-lg font-black sm:text-xl">{greeting}, {user?.firstName || "there"} 👋</h1>
            <p className="text-xs text-slate-500">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-3 self-start lg:self-auto">
            <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <button
              onClick={() => navigate("/add-expense")}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/25 hover:bg-blue-400"
            >
              <span>＋</span> Add Expense
            </button>
          </div>
        </header>

        <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:space-y-8 lg:px-8">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Spent" value={`₹${summary.totalSpent.toLocaleString()}`} sub={loading ? "Loading" : "This month"} accent="bg-blue-500 text-white" icon="💸" />
            <StatCard label="Monthly Budget" value={`₹${monthlyBudget.toLocaleString()}`} sub={`₹${Math.max(remainingBudget, 0).toLocaleString()} left`} accent="bg-indigo-500 text-white" icon="🎯" />
            <StatCard label="Transactions" value={summary.transactions.toString()} sub="This month" accent="bg-violet-500 text-white" icon="📊" />
            <StatCard label="Biggest Spend" value={`₹${summary.biggestSpend.toLocaleString()}`} sub="This month" accent="bg-cyan-500 text-white" icon="🔺" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold text-white">Weekly Spending</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Current week</p>
                </div>
                <span className="w-fit rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-500">This Week</span>
              </div>
              <div className="overflow-x-auto">
                <div className="flex min-w-[24rem] items-end justify-between gap-3 px-2">
                {weekData.map((d) => (
                  <SpendingBar key={d.day} day={d.day} amount={d.amount} max={maxAmount} isToday={d.day === todayDay} />
                ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-slate-500 text-xs">Total this week</span>
                <span className="text-white font-bold">₹{weekData.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
              <h2 className="font-bold text-white mb-1">By Category</h2>
              <p className="text-xs text-slate-500 mb-5">This month</p>
              <DonutChart data={categoryData} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-bold text-white">Budget Overview</h2>
              <button onClick={() => navigate("/budget")} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Manage →</button>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {(budgets.length ? budgets.slice(0, 3) : [
                { name: "Food & Dining", spent: 0, total: 0, color: "bg-blue-500" },
                { name: "Transport", spent: 0, total: 0, color: "bg-indigo-500" },
                { name: "Entertainment", spent: 0, total: 0, color: "bg-red-500" },
              ]).map((b) => {
                const pct = b.total ? Math.min(100, Math.round((b.spent / b.total) * 100)) : 0;
                const over = b.spent > b.total;
                return (
                  <div key={b.name}>
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

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-bold text-white">Recent Transactions</h2>
              <button onClick={() => navigate("/expenses")} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</button>
            </div>
            <div className="space-y-1">
              {summary.recent.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-600">
                  No transactions yet
                </div>
              ) : summary.recent.map((exp) => (
                <div key={exp.id} className="group flex flex-col gap-3 rounded-xl p-3 transition-colors hover:bg-slate-800/50 sm:flex-row sm:items-center sm:gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${categoryColors[exp.category] || "bg-slate-700 text-white"}`}>
                    {categoryIcons[exp.category] || "•"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{exp.title}</p>
                    <p className="text-xs text-slate-500">{exp.category} · {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-white">−₹{exp.amount.toLocaleString()}</p>
                  </div>
                  <button className="self-end text-lg text-slate-600 transition-all hover:text-slate-400 sm:self-auto sm:opacity-0 sm:group-hover:opacity-100">⋯</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
