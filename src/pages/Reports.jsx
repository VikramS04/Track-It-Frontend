import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const emptyReport = {
  totalSpent: 0,
  avgMonthly: 0,
  highestMonth: { month: "N/A", amount: 0 },
  savingsRate: 0,
  monthlyData: [],
  categoryBreakdown: [],
  insights: [],
};

const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d, i) => {
        const height = Math.max(8, (d.amount / max) * 140);
        const isLast = i === data.length - 1;
        return (
          <div key={`${d.month}-${i}`} className="flex-1 flex flex-col items-center gap-2">
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
  const chartData = data.length ? data : [{ name: "No data", pct: 100, amount: 0, color: "#334155" }];
  const withOffsets = chartData.reduce((acc, item) => {
    const dash = (item.pct / 100) * circumference;
    acc.items.push({ ...item, dash, offset: acc.total });
    acc.total += dash;
    return acc;
  }, { items: [], total: 0 }).items;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1e293b" strokeWidth="22" />
      {withOffsets.map((item) => {
        const gap = circumference - item.dash;
        return (
          <circle
            key={item.name}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth="22"
            strokeDasharray={`${Math.max(item.dash - 2, 0)} ${gap + 2}`}
            strokeDashoffset={-item.offset}
          />
        );
      })}
    </svg>
  );
};

export default function Reports() {
  const [period, setPeriod] = useState("month");
  const [report, setReport] = useState(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest(`/api/reports?period=${period}`);
        setReport(data.report || emptyReport);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [period]);

  const totalSpent = report.totalSpent || 0;
  const categoryBreakdown = report.categoryBreakdown || [];
  const monthlyData = report.monthlyData || [];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800/50 px-8 py-4 flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-lg font-black">Reports & Analytics</h1>
          <p className="text-xs text-slate-500">Insights into your spending</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
          📤 Export CSV
        </button>
      </header>

      <div className="p-8 space-y-8">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

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

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: loading ? "Loading" : `This ${period}`, value: `₹${totalSpent.toLocaleString()}`, icon: "💸", delta: "Live data", up: null },
            { label: "Monthly Avg", value: `₹${report.avgMonthly.toLocaleString()}`, icon: "📊", delta: "6 months", up: null },
            { label: "Highest Month", value: report.highestMonth.month, icon: "📈", delta: `₹${report.highestMonth.amount.toLocaleString()}`, up: null },
            { label: "Savings Rate", value: `${report.savingsRate}%`, icon: "🏦", delta: "Budget based", up: null },
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-white">Monthly Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Current month</p>
              <p className="text-lg font-black text-blue-400">₹{(monthlyData.at(-1)?.amount || 0).toLocaleString()}</p>
            </div>
          </div>
          <BarChart data={monthlyData} />
        </div>

        <div className="grid grid-cols-5 gap-6">
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

          <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Breakdown</h2>
            {categoryBreakdown.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-600">
                No spending data for this period
              </div>
            ) : (
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
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(report.insights || []).map((card) => (
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
