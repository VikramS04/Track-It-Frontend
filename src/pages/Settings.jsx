import { useState } from "react";

export default function Settings({ onBack }) {
  const [name, setName] = useState("Vikram Saini");
  const [email, setEmail] = useState("vikram@example.com");
  const [currency, setCurrency] = useState("INR");
  const [notifications, setNotifications] = useState({ budget: true, weekly: true, tips: false });
  const [darkMode, setDarkMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative shrink-0 ${value ? "bg-blue-500" : "bg-slate-700"}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow ${value ? "left-6" : "left-1"}`} />
    </button>
  );

  const Section = ({ title, children }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <h3 className="font-bold text-white text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-slate-800">{children}</div>
    </div>
  );

  const Row = ({ label, sub, right }) => (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <div>{right}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800/50 px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">←</button>
        <div className="flex-1">
          <h1 className="text-lg font-black">Profile & Settings</h1>
          <p className="text-xs text-slate-500">Manage your account</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            saved ? "bg-green-500 text-white" : "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25"
          }`}
        >
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-8 space-y-6">

        {/* Avatar */}
        <div className="flex items-center gap-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-black shrink-0">
            A
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-lg">{name}</p>
            <p className="text-slate-500 text-sm">{email}</p>
            <p className="text-blue-400 text-xs mt-1 font-semibold">Pro Plan · Active</p>
          </div>
          <button className="px-4 py-2 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-400 hover:text-white text-sm font-semibold transition-all">
            Change Photo
          </button>
        </div>

        {/* Profile */}
        <Section title="Personal Information">
          <Row
            label="Full Name"
            right={
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm outline-none text-right w-44 transition-colors"
              />
            }
          />
          <Row
            label="Email Address"
            right={
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm outline-none text-right w-52 transition-colors"
              />
            }
          />
          <Row
            label="Currency"
            sub="Used across all expenses"
            right={
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
              >
                <option value="INR">₹ Indian Rupee</option>
                <option value="USD">$ US Dollar</option>
                <option value="EUR">€ Euro</option>
                <option value="GBP">£ British Pound</option>
              </select>
            }
          />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <Row
            label="Dark Mode"
            sub="App appearance"
            right={<Toggle value={darkMode} onChange={setDarkMode} />}
          />
          <Row
            label="Month Start Day"
            sub="When your billing cycle starts"
            right={
              <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                <option>1st</option>
                <option>15th</option>
                <option>Last day</option>
              </select>
            }
          />
          <Row
            label="Default View"
            right={
              <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none">
                <option>Dashboard</option>
                <option>Expenses</option>
                <option>Reports</option>
              </select>
            }
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Row
            label="Budget Alerts"
            sub="Notify when near or over budget"
            right={<Toggle value={notifications.budget} onChange={(v) => setNotifications(p => ({ ...p, budget: v }))} />}
          />
          <Row
            label="Weekly Summary"
            sub="Spending recap every Sunday"
            right={<Toggle value={notifications.weekly} onChange={(v) => setNotifications(p => ({ ...p, weekly: v }))} />}
          />
          <Row
            label="Saving Tips"
            sub="Personalized money-saving tips"
            right={<Toggle value={notifications.tips} onChange={(v) => setNotifications(p => ({ ...p, tips: v }))} />}
          />
        </Section>

        {/* Data */}
        <Section title="Data & Privacy">
          <Row
            label="Export All Data"
            sub="Download as CSV"
            right={
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 text-sm font-semibold transition-all">
                📤 Export
              </button>
            }
          />
          <Row
            label="Clear All Data"
            sub="This action cannot be undone"
            right={
              <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold transition-all">
                🗑️ Clear
              </button>
            }
          />
        </Section>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <h3 className="font-bold text-red-400 text-sm mb-1">Danger Zone</h3>
          <p className="text-xs text-slate-500 mb-4">Permanently delete your TrackIt account and all data.</p>
          <button className="px-5 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-white text-sm font-bold transition-all">
            Delete Account
          </button>
        </div>

        {/* Sign Out */}
        <button className="w-full py-4 border border-slate-800 hover:border-slate-700 rounded-2xl text-slate-400 hover:text-white font-semibold text-sm transition-all">
          Sign Out
        </button>

      </div>
    </div>
  );
}
