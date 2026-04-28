import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

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

const categories = ["All", ...Object.keys(categoryColors)];

export default function ExpensesList() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          sortBy,
          limit: "100",
        });

        if (search) params.set("search", search);
        if (selectedCategory !== "All") params.set("category", selectedCategory);

        const data = await apiRequest(`/api/expenses?${params.toString()}`);
        setExpenses(data.expenses || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [search, selectedCategory, sortBy]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const totalFiltered = expenses.reduce((a, b) => a + b.amount, 0);

  const groupedByDate = useMemo(() => expenses.reduce((acc, exp) => {
    const d = new Date(exp.date);
    const label = d.toDateString() === new Date().toDateString()
      ? "Today"
      : d.toDateString() === new Date(Date.now() - 86400000).toDateString()
      ? "Yesterday"
      : d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
    if (!acc[label]) acc[label] = [];
    acc[label].push(exp);
    return acc;
  }, {}), [expenses]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    setError("");

    try {
      await apiRequest("/api/expenses", {
        method: "DELETE",
        body: JSON.stringify({ ids: selectedIds }),
      });
      setExpenses((prev) => prev.filter((expense) => !selectedIds.includes(expense.id)));
      setSelectedIds([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800/50 bg-slate-950/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* <button onClick={onBack} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">←</button> */}
          <div className="flex-1">
            <h1 className="text-lg font-black">All Expenses</h1>
            <p className="text-xs text-slate-500">{expenses.length} transactions · ₹{totalFiltered.toLocaleString()} total</p>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg font-semibold disabled:opacity-60"
            >
              {deleting ? "Deleting..." : `Delete ${selectedIds.length}`}
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-600 text-sm outline-none transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-slate-400 outline-none sm:w-40"
          >
            <option value="date">By Date</option>
            <option value="amount">By Amount</option>
            <option value="title">By Name</option>
          </select>
        </div>
      </header>

      <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grouped Transactions */}
        {loading ? (
          <div className="text-center py-20 text-slate-600">
            <p className="font-semibold">Loading expenses...</p>
          </div>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No expenses found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateLabel, exps]) => (
            <div key={dateLabel}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{dateLabel}</span>
                <span className="text-xs text-slate-600">₹{exps.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                {exps.map((exp) => (
                  <div
                    key={exp.id}
                    className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                      selectedIds.includes(exp.id)
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                    onClick={() => toggleSelect(exp.id)}
                  >
                    <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all sm:mt-0 ${
                        selectedIds.includes(exp.id)
                          ? "bg-blue-500 border-blue-500"
                          : "border-slate-700 group-hover:border-slate-500"
                      }`}>
                        {selectedIds.includes(exp.id) && <span className="text-white text-xs">✓</span>}
                      </div>

                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${categoryColors[exp.category] || "bg-slate-700 text-white"}`}>
                        {categoryIcons[exp.category] || "•"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{exp.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${categoryColors[exp.category]}`}>{exp.category}</span>
                          <span className="text-xs text-slate-600">{exp.method}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-white">−₹{exp.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
