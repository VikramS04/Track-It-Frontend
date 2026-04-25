import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";

const categories = [
  { icon: "🛒", label: "Food", color: "bg-green-500/20 border-green-500/40 text-green-400" },
  { icon: "🚗", label: "Transport", color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" },
  { icon: "🎬", label: "Entertainment", color: "bg-red-500/20 border-red-500/40 text-red-400" },
  { icon: "⚡", label: "Utilities", color: "bg-blue-500/20 border-blue-500/40 text-blue-400" },
  { icon: "💪", label: "Health", color: "bg-purple-500/20 border-purple-500/40 text-purple-400" },
  { icon: "🛍️", label: "Shopping", color: "bg-pink-500/20 border-pink-500/40 text-pink-400" },
  { icon: "📚", label: "Education", color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" },
  { icon: "🏠", label: "Housing", color: "bg-orange-500/20 border-orange-500/40 text-orange-400" },
];

const paymentMethods = ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking"];

export default function AddExpense() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!amount || !title || !selectedCategory) return;
    setSaving(true);
    setError("");

    try {
      await apiRequest("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          title,
          category: selectedCategory,
          date,
          method: paymentMethod,
          note,
          recurring,
        }),
      });

      setSubmitted(true);
      setAmount("");
      setTitle("");
      setSelectedCategory(null);
      setPaymentMethod("UPI");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
      setRecurring(false);
      setTimeout(() => navigate("/expenses"), 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800/50 px-8 py-4 flex items-center gap-4">
        {/* <button
          onClick={onBack}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        >
          ←
        </button> */}
        <div>
          <h1 className="text-lg font-black">Add Expense</h1>
          <p className="text-xs text-slate-500">Record a new transaction</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-8 space-y-8">

        {/* Amount Input — Hero */}
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 rounded-3xl p-8 text-center">
          <p className="text-slate-400 text-sm tracking-widest uppercase mb-4">Amount Spent</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-blue-400">₹</span>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-5xl font-black text-white placeholder-slate-700 outline-none w-48 text-center"
            />
          </div>
          {amount && (
            <p className="text-slate-500 text-sm mt-3">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2">
            Description
          </label>
          <input
            type="text"
            placeholder="What did you spend on?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm outline-none transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">
            Category
          </label>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                  selectedCategory === cat.label
                    ? cat.color + " scale-105 shadow-lg"
                    : "border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-semibold">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Payment */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors"
            >
              {paymentMethods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2">
            Note <span className="text-slate-600 normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="Any additional details..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm outline-none transition-colors resize-none"
          />
        </div>

        {/* Recurring Toggle */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-white">Recurring Expense</p>
            <p className="text-xs text-slate-500 mt-0.5">Repeat this expense monthly</p>
          </div>
          <button
            onClick={() => setRecurring(!recurring)}
            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${recurring ? "bg-blue-500" : "bg-slate-700"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow-md ${recurring ? "left-6" : "left-0.5"}`} />
          </button>
        </div>

        {/* Submit */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!amount || !title || !selectedCategory || saving}
          className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-200 ${
            submitted
              ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
              : amount && title && selectedCategory && !saving
              ? "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0"
              : "bg-slate-800 text-slate-600 cursor-not-allowed"
          }`}
        >
          {submitted ? "✓ Expense Saved!" : saving ? "Saving..." : "Save Expense"}
        </button>

      </div>
    </div>
  );
}
