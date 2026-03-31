import { useState } from "react";

const initialBudgets = [
  { id: 1, name: "Food & Dining", icon: "🛒", spent: 8420, total: 10000, color: "bg-green-500", colorHex: "#22c55e" },
  { id: 2, name: "Transport", icon: "🚗", spent: 3200, total: 4000, color: "bg-yellow-500", colorHex: "#eab308" },
  { id: 3, name: "Entertainment", icon: "🎬", spent: 2400, total: 2000, color: "bg-red-500", colorHex: "#ef4444" },
  { id: 4, name: "Utilities", icon: "⚡", spent: 3100, total: 5000, color: "bg-blue-500", colorHex: "#3b82f6" },
  { id: 5, name: "Health", icon: "💪", spent: 1800, total: 3000, color: "bg-purple-500", colorHex: "#a855f7" },
  { id: 6, name: "Shopping", icon: "🛍️", spent: 5499, total: 5000, color: "bg-pink-500", colorHex: "#ec4899" },
];

const BudgetCard = ({ budget, onEdit }) => {
  const pct = Math.min(100, Math.round((budget.spent / budget.total) * 100));
  const over = budget.spent > budget.total;
  const remaining = budget.total - budget.spent;

  return (
    <div className={`bg-slate-900 border rounded-2xl p-5 transition-all hover:border-slate-700 ${over ? "border-red-500/30" : "border-slate-800"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${over ? "bg-red-500/20" : "bg-slate-800"}`}>
            {budget.icon}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{budget.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              ₹{budget.spent.toLocaleString()} of ₹{budget.total.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {over && (
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
              Over!
            </span>
          )}
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 text-slate-600 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all text-sm"
          >
            ✏️
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${over ? "bg-red-500" : budget.color}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${over ? "text-red-400" : pct > 80 ? "text-yellow-400" : "text-slate-400"}`}>
          {pct}% used
        </span>
        <span className={`text-xs font-semibold ${over ? "text-red-400" : "text-slate-500"}`}>
          {over ? `₹${Math.abs(remaining).toLocaleString()} over` : `₹${remaining.toLocaleString()} left`}
        </span>
      </div>
    </div>
  );
};

const EditModal = ({ budget, onClose, onSave }) => {
  const [value, setValue] = useState(budget.total.toString());

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{budget.icon}</span>
            <h3 className="font-bold text-white">{budget.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <label className="block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2">
          Monthly Budget (₹)
        </label>
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold">₹</span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-4 py-3.5 text-white text-lg font-bold outline-none transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all text-sm font-semibold">
            Cancel
          </button>
          <button
            onClick={() => { onSave(budget.id, parseInt(value)); onClose(); }}
            className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 rounded-xl text-white font-bold text-sm transition-all"
          >
            Save Budget
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BudgetManager({ onBack }) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const totalBudget = budgets.reduce((a, b) => a + b.total, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  const overBudgetCount = budgets.filter(b => b.spent > b.total).length;

  const handleSave = (id, newTotal) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, total: newTotal } : b));
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      {editingBudget && (
        <EditModal budget={editingBudget} onClose={() => setEditingBudget(null)} onSave={handleSave} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800/50 px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">←</button>
        <div className="flex-1">
          <h1 className="text-lg font-black">Budget Manager</h1>
          <p className="text-xs text-slate-500">March 2026</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/25"
        >
          ＋ New Budget
        </button>
      </header>

      <div className="p-8 space-y-8">

        {/* Summary Strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, icon: "🎯", color: "text-blue-400" },
            { label: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, icon: "💸", color: "text-indigo-400" },
            { label: "Over Budget", value: `${overBudgetCount} categories`, icon: "⚠️", color: overBudgetCount > 0 ? "text-red-400" : "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{s.icon}</span>
                <span className="text-xs text-slate-500 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Overall Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-white">Overall Monthly Progress</span>
            <span className="text-sm font-bold text-slate-400">
              {Math.round((totalSpent / totalBudget) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-600">₹{totalSpent.toLocaleString()} spent</span>
            <span className="text-xs text-slate-600">₹{(totalBudget - totalSpent).toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Add Budget Form */}
        {showAdd && (
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">New Budget Category</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Category name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none transition-colors"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="Budget"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-36 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-600 text-sm outline-none transition-colors"
                />
              </div>
              <button
                onClick={() => {
                  if (newName && newAmount) {
                    setBudgets(prev => [...prev, {
                      id: Date.now(), name: newName, icon: "📦",
                      spent: 0, total: parseInt(newAmount),
                      color: "bg-blue-500", colorHex: "#3b82f6"
                    }]);
                    setNewName(""); setNewAmount(""); setShowAdd(false);
                  }
                }}
                className="px-5 py-3 bg-blue-500 hover:bg-blue-400 rounded-xl text-white font-bold text-sm transition-all"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Budget Cards Grid */}
        <div>
          <h2 className="font-bold text-white mb-4">Category Budgets</h2>
          <div className="grid grid-cols-2 gap-4">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} onEdit={setEditingBudget} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
