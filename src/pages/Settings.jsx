import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, clearAuth, getStoredUser, setStoredUser } from "../lib/api";

const defaultNotifications = {
  budget: true,
  weekly: true,
  tips: false,
};

const defaultForm = {
  fullName: "",
  email: "",
  currency: "INR",
  darkMode: true,
  monthStartDay: "1st",
  defaultView: "dashboard",
  notifications: defaultNotifications,
};

const Toggle = ({ value, onChange }) => (
  <button
    type="button"
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
  <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
    <div className="min-w-0 md:max-w-xs">
      <p className="text-sm font-medium text-white">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
    <div className="w-full md:w-auto md:shrink-0">{right}</div>
  </div>
);

const toFormState = (user) => {
  const settings = user?.settings || {};
  const notifications = {
    ...defaultNotifications,
    ...(settings.notifications || {}),
  };

  return {
    fullName: [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim(),
    email: user?.email || "",
    currency: settings.currency || "INR",
    darkMode: settings.darkMode ?? true,
    monthStartDay: settings.monthStartDay || "1st",
    defaultView: settings.defaultView || "dashboard",
    notifications,
  };
};

const splitName = (fullName) => {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = trimmed.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(" "),
  };
};

export default function Settings() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [workingAction, setWorkingAction] = useState("");

  useEffect(() => {
    const localUser = getStoredUser();
    if (localUser) {
      setForm(toFormState(localUser));
    }

    const loadUser = async () => {
      try {
        const data = await apiRequest("/api/users/me");
        setStoredUser(data.user);
        setForm(toFormState(data.user));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setNotification = (field, value) => {
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    const { firstName, lastName } = splitName(form.fullName);

    if (!firstName || !lastName) {
      setError("Please enter both first and last name");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const data = await apiRequest("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          firstName,
          lastName,
          email: form.email,
          settings: {
            currency: form.currency,
            darkMode: form.darkMode,
            monthStartDay: form.monthStartDay,
            defaultView: form.defaultView,
            notifications: form.notifications,
          },
        }),
      });

      setStoredUser(data.user);
      setForm(toFormState(data.user));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setWorkingAction("export");
    setError("");

    try {
      const data = await apiRequest("/api/users/me/export");
      const blob = new Blob([JSON.stringify(data.export, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "trackit-export.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingAction("");
    }
  };

  const handleClearData = async () => {
    const confirmed = window.confirm("Clear all budgets and expenses for this account?");
    if (!confirmed) return;

    setWorkingAction("clear");
    setError("");

    try {
      await apiRequest("/api/users/me/data", {
        method: "DELETE",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setWorkingAction("");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Delete your account permanently? This cannot be undone.");
    if (!confirmed) return;

    setWorkingAction("delete");
    setError("");

    try {
      await apiRequest("/api/users/me", {
        method: "DELETE",
      });
      clearAuth();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
      setWorkingAction("");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 py-20 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-800/50 bg-slate-950/90 px-4 py-4 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="flex-1">
          <h1 className="text-lg font-black">Profile & Settings</h1>
          <p className="text-xs text-slate-500">Manage your account</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`w-full rounded-xl px-5 py-2 text-sm font-bold transition-all sm:w-auto ${
            saved ? "bg-green-500 text-white" : "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25"
          } ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-4 sm:px-6 sm:py-6">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-black shrink-0">
            {form.fullName.trim().charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-lg truncate">{form.fullName || "TrackIt User"}</p>
            <p className="text-slate-500 text-sm truncate">{form.email}</p>
            <p className="text-blue-400 text-xs mt-1 font-semibold">Personal Workspace</p>
          </div>
        </div>

        <Section title="Personal Information">
          <Row
            label="Full Name"
            right={(
              <input
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500 md:w-44 md:text-right"
              />
            )}
          />
          <Row
            label="Email Address"
            right={(
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500 md:w-52 md:text-right"
              />
            )}
          />
          <Row
            label="Currency"
            sub="Used across all expenses"
            right={(
              <select
                value={form.currency}
                onChange={(e) => setField("currency", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none md:w-auto"
              >
                <option value="INR">₹ Indian Rupee</option>
                <option value="USD">$ US Dollar</option>
                <option value="EUR">€ Euro</option>
                <option value="GBP">£ British Pound</option>
              </select>
            )}
          />
        </Section>

        <Section title="Preferences">
          <Row
            label="Dark Mode"
            sub="Saved for your account"
            right={<Toggle value={form.darkMode} onChange={(value) => setField("darkMode", value)} />}
          />
          <Row
            label="Month Start Day"
            sub="When your cycle starts"
            right={(
              <select
                value={form.monthStartDay}
                onChange={(e) => setField("monthStartDay", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none md:w-auto"
              >
                <option value="1st">1st</option>
                <option value="15th">15th</option>
                <option value="Last day">Last day</option>
              </select>
            )}
          />
          <Row
            label="Default View"
            sub="Where TrackIt opens after login"
            right={(
              <select
                value={form.defaultView}
                onChange={(e) => setField("defaultView", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none md:w-auto"
              >
                <option value="dashboard">Dashboard</option>
                <option value="expenses">Expenses</option>
                <option value="budget">Budgets</option>
                <option value="reports">Reports</option>
                <option value="settings">Settings</option>
              </select>
            )}
          />
        </Section>

        <Section title="Notifications">
          <Row
            label="Budget Alerts"
            sub="Notify when near or over budget"
            right={<Toggle value={form.notifications.budget} onChange={(value) => setNotification("budget", value)} />}
          />
          <Row
            label="Weekly Summary"
            sub="Spending recap every week"
            right={<Toggle value={form.notifications.weekly} onChange={(value) => setNotification("weekly", value)} />}
          />
          <Row
            label="Saving Tips"
            sub="Personalized money-saving tips"
            right={<Toggle value={form.notifications.tips} onChange={(value) => setNotification("tips", value)} />}
          />
        </Section>

        <Section title="Data & Privacy">
          <Row
            label="Export All Data"
            sub="Download a JSON snapshot"
            right={(
              <button
                type="button"
                onClick={handleExport}
                disabled={workingAction === "export"}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 text-sm font-semibold transition-all disabled:opacity-60"
              >
                {workingAction === "export" ? "Exporting..." : "Export"}
              </button>
            )}
          />
          <Row
            label="Clear All Data"
            sub="Removes budgets and expenses"
            right={(
              <button
                type="button"
                onClick={handleClearData}
                disabled={workingAction === "clear"}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold transition-all disabled:opacity-60"
              >
                {workingAction === "clear" ? "Clearing..." : "Clear"}
              </button>
            )}
          />
        </Section>

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <h3 className="font-bold text-red-400 text-sm mb-1">Danger Zone</h3>
          <p className="text-xs text-slate-500 mb-4">Permanently delete your TrackIt account and all data.</p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={workingAction === "delete"}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60"
          >
            {workingAction === "delete" ? "Deleting..." : "Delete Account"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            clearAuth();
            navigate("/login", { replace: true });
          }}
          className="w-full py-4 border border-slate-800 hover:border-slate-700 rounded-2xl text-slate-400 hover:text-white font-semibold text-sm transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
