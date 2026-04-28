import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, storeAuth } from "../lib/api";

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`} />
);

const InputField = ({ label, type, placeholder, icon, value, onChange }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative group">
      <label className="block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2">
        {label}
      </label>
      <div
        className={`relative flex items-center border rounded-xl transition-all duration-300 ${
          focused
            ? "border-blue-400 bg-slate-800/80 shadow-lg shadow-blue-500/10"
            : "border-slate-700 bg-slate-800/40"
        }`}
      >
        <span className="pl-4 text-slate-400 text-lg">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent py-3.5 px-3 text-slate-100 placeholder-slate-600 text-sm outline-none font-light"
        />
        {value && (
          <span className="pr-4 text-blue-400 text-sm">✓</span>
        )}
      </div>
    </div>
  );
};

const LoginForm = ({ form, loading, onChange, onSubmit, onSwitch }) => (
  <div className="space-y-5">
    <InputField label="Email" type="email" placeholder="you@example.com" icon="✉" value={form.email} onChange={(value) => onChange("email", value)} />
    <InputField label="Password" type="password" placeholder="••••••••" icon="⬡" value={form.password} onChange={(value) => onChange("password", value)} />

    <div className="flex items-center justify-between pt-1">
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="w-4 h-4 rounded border border-slate-600 group-hover:border-blue-400 transition-colors flex items-center justify-center">
          <div className="w-2 h-2 rounded-sm bg-blue-400 opacity-0 group-hover:opacity-40 transition-opacity" />
        </div>
        <span className="text-xs text-slate-500">Remember me</span>
      </label>
      <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors tracking-wide">
        Forgot password?
      </button>
    </div>

    <button
      onClick={onSubmit}
      disabled={loading}
      className="w-full mt-2 py-4 bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-900 font-bold rounded-xl transition-all duration-200 tracking-widest text-sm uppercase shadow-lg shadow-blue-500/25 hover:shadow-blue-400/40 hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0"
    >
      {loading ? "Signing In..." : "Sign In"}
    </button>

    <p className="text-center text-slate-500 text-sm pt-2">
      No account?{" "}
      <button onClick={onSwitch} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
        Create one →
      </button>
    </p>
  </div>
);

const RegisterForm = ({ form, loading, onChange, onSubmit, onSwitch }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <InputField label="First Name" type="text" placeholder="Vikram" icon="⬡" value={form.firstName} onChange={(value) => onChange("firstName", value)} />
      <InputField label="Last Name" type="text" placeholder="Saini" icon="⬡" value={form.lastName} onChange={(value) => onChange("lastName", value)} />
    </div>
    <InputField label="Email" type="email" placeholder="you@example.com" icon="✉" value={form.email} onChange={(value) => onChange("email", value)} />
    <InputField label="Password" type="password" placeholder="••••••••" icon="⬡" value={form.password} onChange={(value) => onChange("password", value)} />
    <InputField label="Confirm Password" type="password" placeholder="••••••••" icon="⬡" value={form.confirmPassword} onChange={(value) => onChange("confirmPassword", value)} />

    <div className="pt-1">
      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full py-4 bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-900 font-bold rounded-xl transition-all duration-200 tracking-widest text-sm uppercase shadow-lg shadow-blue-500/25 hover:shadow-blue-400/40 hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
    </div>

    <p className="text-center text-slate-500 text-sm">
      Already have an account?{" "}
      <button onClick={onSwitch} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
        Sign in →
      </button>
    </p>
  </div>
);

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const updateLoginForm = (field, value) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateRegisterForm = (field, value) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/api/users/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      storeAuth(data);
      navigate(`/${data.user?.settings?.defaultView || "dashboard"}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword: _confirmPassword, ...payload } = registerForm;
      const data = await apiRequest("/api/users/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      storeAuth(data);
      navigate(`/${data.user?.settings?.defaultView || "dashboard"}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Background orbs */}
      <FloatingOrb className="w-96 h-96 bg-blue-500 -top-20 -left-20" />
      <FloatingOrb className="w-80 h-80 bg-blue-400 bottom-10 right-10" style={{ animationDelay: "1s" }} />
      <FloatingOrb className="w-64 h-64 bg-indigo-500 top-1/2 left-1/3" style={{ animationDelay: "2s" }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md">

        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 rotate-12">
              <span className="text-slate-900 font-black text-lg -rotate-12">₹</span>
            </div>
            <span className="text-3xl font-black tracking-tight text-white">
              Track<span className="text-blue-400">It</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm tracking-widest uppercase">
            {mode === "login" ? "Welcome back" : "Start tracking smarter"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/50">

          {/* Mode toggle tabs */}
          <div className="flex bg-slate-800/60 rounded-xl p-1 mb-8">
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold tracking-widest uppercase transition-all duration-200 ${
                  mode === tab
                    ? "bg-blue-500 text-slate-900 shadow-md shadow-blue-500/30"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Form */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {mode === "login" ? (
            <LoginForm
              form={loginForm}
              loading={loading}
              onChange={updateLoginForm}
              onSubmit={handleLogin}
              onSwitch={() => {
                setError("");
                setMode("register");
              }}
            />
          ) : (
            <RegisterForm
              form={registerForm}
              loading={loading}
              onChange={updateRegisterForm}
              onSubmit={handleRegister}
              onSwitch={() => {
                setError("");
                setMode("login");
              }}
            />
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-600 text-xs tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Google", icon: "G" },
              { label: "GitHub", icon: "⌥" },
            ].map(({ label, icon }) => (
              <button
                key={label}
                className="flex items-center justify-center gap-2 py-3 border border-slate-700 rounded-xl text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/40 transition-all duration-200 text-sm font-medium"
              >
                <span className="font-bold">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs mt-6 tracking-wide">
          By continuing, you agree to our{" "}
          <span className="text-slate-500 hover:text-blue-400 cursor-pointer transition-colors">Terms</span>
          {" & "}
          <span className="text-slate-500 hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
