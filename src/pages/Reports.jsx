import { useState } from "react";

const monthlyData = [
  { month: "Oct", amount: 18200 },
  { month: "Nov", amount: 22400 },
  { month: "Dec", amount: 31200 },
  { month: "Jan", amount: 19800 },
  { month: "Feb", amount: 21000 },
  { month: "Mar", amount: 24069 },
];

const categoryBreakdown = [
  { name: "Food & Dining", amount: 8420, pct: 35, icon: "🛒", color: "#3b82f6", trend: "+8%" },
  { name: "Utilities", amount: 4100, pct: 17, icon: "⚡", color: "#6366f1", trend: "-3%" },
  { name: "Transport", amount: 3200, pct: 13, icon: "🚗", color: "#8b5cf6", trend: "+2%" },
  { name: "Shopping", amount: 3499, pct: 15, icon: "🛍️", color: "#06b6d4", trend: "+22%" },
  { name: "Entertainment", amount: 2400, pct: 10, icon: "🎬", color: "#0ea5e9", trend: "-5%" },
  { name: "Health", amount: 2450, pct: 10, icon: "💪", color: "#818cf8", trend: "+1%" },
];

const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.amount));
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d, i) => {
        const height = Math.max(8, (d.amount / max) * 140);
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <span className={`text-xs font-bold ${isLast ? "text-blue-400" : "text-slate-600"}`}>
              ₹{(d.amount / 1000).toFixed(1)}k
            </span>
            <div className="w-full flex items-end" style={{ height: "120px" }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-700 ${isLast ? "bg-gradient-to-t from-blue-600 to-blue-400" : "bg-slate-800 hover:bg-slate-700"}`}
                style={{ height: `${height}px` }}
              />
            </div>
            <span className={`text-xs ${isLast ? "text-blue-400 font-bold" : "text-slate-600"}`}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
};

const DonutRing = ({ data }) => {
  const size = 180;
  const radius = 70;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1e293b" strokeWidth="22" />
      {data.map((item, i) => {
        const dash = (item.pct / 100) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
            stroke={item.color} strokeWidth="22"
            strokeDasharray={`${dash - 2} ${gap + 2}`}
            strokeDashoffset={-offset}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
};

export default function Reports({ onBack }) {
  const [period, setPeriod] = useState("month");

  const totalSpent = categoryBreakdown.reduce((a, b) => a + b.amount, 0);
  const avgMonthly = Math.round(monthlyData.reduce((a, b) => a + b.amount, 0) / monthlyData.length);
  const highestMonth = monthlyData.reduce((a, b) => a.amount > b.amount ? a : b);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800/50 px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">←</button>
        <div className="flex-1">
          <h1 className="text-lg font-black">Reports & Analytics</h1>
          <p className="text-xs text-slate-500">Insights into your spending</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
          📤 Export CSV
        </button>
      </header>

      <div className="p-8 space-y-8">

        {/* Period Toggle */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          {["week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                period === p ? "bg-blue-500 text-white shadow-md" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "This Month", value: `₹${totalSpent.toLocaleString()}`, icon: "💸", delta: "+14%", up: true },
            { label: "Monthly Avg", value: `₹${avgMonthly.toLocaleString()}`, icon: "📊", delta: "6 months", up: null },
            { label: "Highest Month", value: highestMonth.month, icon: "📈", delta: `₹${highestMonth.amount.toLocaleString()}`, up: null },
            { label: "Savings Rate", value: "31%", icon: "🏦", delta: "+3% vs last", up: true },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{kpi.icon}</span>
                {kpi.up !== null && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kpi.up ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {kpi.delta}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-xl font-black text-white">{kpi.value}</p>
              {kpi.up === null && <p className="text-xs text-slate-600 mt-1">{kpi.delta}</p>}
            </div>
          ))}
        </div>

        {/* Monthly Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-white">Monthly Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Current month</p>
              <p className="text-lg font-black text-blue-400">₹24,069</p>
            </div>
          </div>
          <BarChart data={monthlyData} />
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-5 gap-6">
          {/* Donut */}
          <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            <h2 className="font-bold text-white mb-4 self-start">Category Split</h2>
            <div className="relative">
              <DonutRing data={categoryBreakdown} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-lg font-black text-white">₹{(totalSpent / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Breakdown</h2>
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-sm font-medium text-slate-300">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold ${cat.trend.startsWith("+") ? "text-red-400" : "text-green-400"}`}>
                        {cat.trend}
                      </span>
                      <span className="text-sm font-bold text-white">₹{cat.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title: "💡 Biggest Overspend",
              body: "Shopping exceeded your budget by ₹499 this month. Consider reducing impulse buys.",
              color: "border-red-500/20 bg-red-500/5"
            },
            {
              title: "✅ On Track",
              body: "You're within budget for Transport and Health. Keep it up through the month!",
              color: "border-green-500/20 bg-green-500/5"
            },
            {
              title: "📅 Forecast",
              body: "At current pace, you'll spend ~₹26,400 by month end — ₹1,400 over your total budget.",
              color: "border-blue-500/20 bg-blue-500/5"
            },
          ].map((card) => (
            <div key={card.title} className={`border rounded-2xl p-5 ${card.color}`}>
              <p className="font-bold text-white text-sm mb-2">{card.title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
