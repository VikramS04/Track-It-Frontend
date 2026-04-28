import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const BudgetCard = ({ budget, onEdit }) => {
  const pct = budget.total ? Math.min(100, Math.round((budget.spent / budget.total) * 100)) : 0;
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

const EditModal = ({ budget, saving, onClose, onSave }) => {
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
            min="0"
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
            onClick={() => onSave(budget.id, Number(value))}
            disabled={saving}
            className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700 disabled:text-slate-400 rounded-xl text-white font-bold text-sm transition-all"
          >
            {saving ? "Saving..." : "Save Budget"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BudgetManager() {
  const [budgets, setBudgets] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalBudget = budgets.reduce((a, b) => a + b.total, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  const overBudgetCount = budgets.filter((b) => b.spent > b.total).length;
  const overallPct = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const loadBudgets = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/budgets");
      setBudgets(data.budgets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleSave = async (id, newTotal) => {
    if (Number.isNaN(newTotal) || newTotal < 0) return;
    setSaving(true);
    setError("");

    try {
      const data = await apiRequest(`/api/budgets/${id}`, {
        method: "PUT",
        body: JSON.stringify({ total: newTotal }),
      });
      setBudgets((prev) => prev.map((budget) => budget.id === id ? data.budget : budget));
      setEditingBudget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newName || !newAmount) return;
    setSaving(true);
    setError("");

    try {
      const data = await apiRequest("/api/budgets", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          category: newName,
          total: Number(newAmount),
          icon: "📦",
          color: "bg-blue-500",
          colorHex: "#3b82f6",
        }),
      });
      setBudgets((prev) => [...prev, data.budget]);
      setNewName("");
      setNewAmount("");
      setShowAdd(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      {editingBudget && (
        <EditModal budget={editingBudget} saving={saving} onClose={() => setEditingBudget(null)} onSave={handleSave} />
      )}

      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-800/50 bg-slate-950/90 px-4 py-4 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="flex-1">
          <h1 className="text-lg font-black">Budget Manager</h1>
          <p className="text-xs text-slate-500">Current month</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/25 hover:bg-blue-400 sm:w-auto"
        >
          ＋ New Budget
        </button>
      </header>

      <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:space-y-8 lg:px-8">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-bold text-white">Overall Monthly Progress</span>
            <span className="text-sm font-bold text-slate-400">{overallPct}%</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, overallPct)}%` }}
            />
          </div>
          <div className="mt-2 flex flex-col gap-1 text-xs sm:flex-row sm:justify-between">
            <span className="text-xs text-slate-600">₹{totalSpent.toLocaleString()} spent</span>
            <span className="text-xs text-slate-600">₹{Math.max(totalBudget - totalSpent, 0).toLocaleString()} remaining</span>
          </div>
        </div>

        {showAdd && (
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-4 sm:p-6">
            <h3 className="font-bold text-white mb-4">New Budget Category</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Category name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none transition-colors"
              />
              <div className="relative sm:w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Budget"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-600 text-sm outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={saving || !newName || !newAmount}
                className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-blue-400 disabled:bg-slate-700 disabled:text-slate-400"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        )}

        <div>
          <h2 className="font-bold text-white mb-4">Category Budgets</h2>
          {loading ? (
            <div className="text-center py-20 text-slate-600">Loading budgets...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {budgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} onEdit={setEditingBudget} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
