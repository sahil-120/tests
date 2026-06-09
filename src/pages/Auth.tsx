import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { BookOpen, Lock, Mail, User as UserIcon, Eye, EyeOff, ShieldCheck, Trophy, BarChart3 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || "/";

  useEffect(() => {
    if (!authLoading && user) navigate(from, { replace: true });
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: "https://tests-lyart-five.vercel.app/",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created! You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Left: hero/brand panel */}
      <div className="hidden lg:flex flex-col justify-between flex-1 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-12 text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold mb-12">
            <div className="bg-white/10 backdrop-blur p-2 rounded-xl">
              <BookOpen size={22} />
            </div>
            Computer Operator Pro
          </Link>

          <h2 className="text-4xl font-heading font-bold leading-tight mb-4">
            Master the Loksewa<br />Computer Operator exam.
          </h2>
          <p className="text-white/70 text-lg max-w-md">
            15,000+ practice questions, 19 mock exams, real-time leaderboard, and personal performance analytics.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 max-w-md">
          <Feature icon={<Trophy size={20} />} label="Leaderboard" />
          <Feature icon={<BarChart3 size={20} />} label="Analytics" />
          <Feature icon={<ShieldCheck size={20} />} label="Secure Auth" />
        </div>

        <p className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} Computer Operator Pro · Built for अग्रिम तयारी
        </p>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <BookOpen size={28} className="text-blue-600" />
            </div>
            <p className="font-bold text-slate-700">Computer Operator Pro</p>
          </div>

          {/* Tab switcher */}
          <div className="bg-slate-200/60 rounded-xl p-1 flex mb-8">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <h1 className="text-3xl font-heading font-bold text-slate-900 mb-1">
            {mode === "signin" ? "Welcome back 👋" : "Create your account"}
          </h1>
          <p className="text-slate-500 mb-8">
            {mode === "signin"
              ? "Sign in to continue your prep journey."
              : "Join thousands preparing for Loksewa."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Full Name" icon={<UserIcon size={18} />}>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ram Bahadur"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
            )}

            <Field label="Email address" icon={<Mail size={18} />}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>

            <Field label="Password" icon={<Lock size={18} />}>
              <input
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm"
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)} className="text-slate-400 hover:text-slate-600">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === "signin" ? "No account yet?" : "Already a member?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>

          <p className="text-center text-xs text-slate-400 mt-8">
            <Link to="/" className="hover:underline">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
    <div className="flex justify-center mb-1.5 text-white/90">{icon}</div>
    <p className="text-xs text-white/80">{label}</p>
  </div>
);

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
      {label}
    </label>
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition">
      <span className="text-slate-400">{icon}</span>
      {children}
    </div>
  </div>
);

export default Auth;
