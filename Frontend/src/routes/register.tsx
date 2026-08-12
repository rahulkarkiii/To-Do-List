import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { friendlyError } from "@/lib/api";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create your account — TaskFlow" },
      { name: "description", content: "Register for a free TaskFlow account and start organizing your work today." },
      { property: "og:title", content: "Create your account — TaskFlow" },
      { property: "og:description", content: "Register for a free TaskFlow account and start organizing your work today." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "" });
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) void navigate({ to: "/dashboard", replace: true });
  }, [ready, isAuthenticated, navigate]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (form.username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.password2) return "Passwords do not match.";
    return "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = validate();
    setError(message);
    if (message) return;

    setLoading(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        password2: form.password2,
      });
      setSuccess(true);
      toast.success("Account created! You can log in now.");
      setTimeout(() => void navigate({ to: "/login" }), 1200);
    } catch (err) {
      const msg = friendlyError(err, "Registration failed. Please check your details.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
            <Zap className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </Link>

        <div className="card-surface p-7 shadow-elevated">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Free forever. Start organizing in seconds.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="r-username">Username</Label>
              <Input id="r-username" value={form.username} onChange={set("username")} placeholder="rahul" autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-email">Email</Label>
              <Input id="r-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-password">Password</Label>
              <div className="relative">
                <Input
                  id="r-password"
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-password2">Confirm password</Label>
              <div className="relative">
                <Input
                  id="r-password2"
                  type={show2 ? "text" : "password"}
                  value={form.password2}
                  onChange={set("password2")}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow2((s) => !s)}
                  aria-label={show2 ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            {success && (
              <p className="flex items-center gap-2 rounded-lg border border-success/25 bg-success-soft px-3 py-2 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" /> Account created. Redirecting to login...
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
