import { useState } from "react";

const allExpenses = [
  { id: 1, title: "Netflix Subscription", category: "Entertainment", amount: 649, date: "2026-03-31", icon: "🎬", method: "Credit Card" },
  { id: 2, title: "Grocery Store", category: "Food", amount: 1820, date: "2026-03-31", icon: "🛒", method: "UPI" },
  { id: 3, title: "Uber Ride", category: "Transport", amount: 340, date: "2026-03-30", icon: "🚗", method: "UPI" },
  { id: 4, title: "Electricity Bill", category: "Utilities", amount: 2100, date: "2026-03-28", icon: "⚡", method: "Net Banking" },
  { id: 5, title: "Gym Membership", category: "Health", amount: 999, date: "2026-03-27", icon: "💪", method: "Debit Card" },
  { id: 6, title: "Amazon Shopping", category: "Shopping", amount: 3499, date: "2026-03-26", icon: "🛍️", method: "Credit Card" },
  { id: 7, title: "Swiggy Order", category: "Food", amount: 480, date: "2026-03-25", icon: "🛒", method: "UPI" },
  { id: 8, title: "Metro Card Recharge", category: "Transport", amount: 500, date: "2026-03-24", icon: "🚗", method: "UPI" },
  { id: 9, title: "Movie Tickets", category: "Entertainment", amount: 760, date: "2026-03-23", icon: "🎬", method: "Credit Card" },
  { id: 10, title: "Doctor Visit", category: "Health", amount: 800, date: "2026-03-22", icon: "💪", method: "Cash" },
  { id: 11, title: "Internet Bill", category: "Utilities", amount: 999, date: "2026-03-20", icon: "⚡", method: "Net Banking" },
  { id: 12, title: "Books", category: "Education", amount: 650, date: "2026-03-18", icon: "📚", method: "UPI" },
];

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

const categories = ["All", ...Object.keys(categoryColors)];

export default function ExpensesList({ onBack }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [selectedIds, setSelectedIds] = useState([]);

  const filtered = allExpenses
    .filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "All" || e.category === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "amount") return b.amount - a.amount;
      return a.title.localeCompare(b.title);
    });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const totalFiltered = filtered.reduce((a, b) => a + b.amount, 0);

  const groupedByDate = filtered.reduce((acc, exp) => {
    const d = new Date(exp.date);
    const label = d.toDateString() === new Date().toDateString()
      ? "Today"
      : d.toDateString() === new Date(Date.now() - 86400000).toDateString()
      ? "Yesterday"
      : d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
    if (!acc[label]) acc[label] = [];
    acc[label].push(exp);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800/50 px-8 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">←</button>
          <div className="flex-1">
            <h1 className="text-lg font-black">All Expenses</h1>
            <p className="text-xs text-slate-500">{filtered.length} transactions · ₹{totalFiltered.toLocaleString()} total</p>
          </div>
          {selectedIds.length > 0 && (
            <button className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg font-semibold">
              Delete {selectedIds.length}
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-3">
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
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-400 text-sm outline-none"
          >
            <option value="date">By Date</option>
            <option value="amount">By Amount</option>
            <option value="title">By Name</option>
          </select>
        </div>
      </header>

      <div className="p-8 space-y-6">

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
        {Object.keys(groupedByDate).length === 0 ? (
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
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all group cursor-pointer ${
                      selectedIds.includes(exp.id)
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                    onClick={() => toggleSelect(exp.id)}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-md border transition-all shrink-0 flex items-center justify-center ${
                      selectedIds.includes(exp.id)
                        ? "bg-blue-500 border-blue-500"
                        : "border-slate-700 group-hover:border-slate-500"
                    }`}>
                      {selectedIds.includes(exp.id) && <span className="text-white text-xs">✓</span>}
                    </div>

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${categoryColors[exp.category] || "bg-slate-700 text-white"}`}>
                      {exp.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{exp.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[exp.category]}`}>{exp.category}</span>
                        <span className="text-xs text-slate-600">· {exp.method}</span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">−₹{exp.amount.toLocaleString()}</p>
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
