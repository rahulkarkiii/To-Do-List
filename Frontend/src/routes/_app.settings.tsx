import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, Server, Sun } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_app/settings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Settings — TaskFlow" },
      { name: "description", content: "Manage appearance, API connection details and session settings in TaskFlow." },
      { property: "og:title", content: "Settings — TaskFlow" },
      { property: "og:description", content: "Manage appearance, API connection details and session settings in TaskFlow." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
    void navigate({ to: "/login", replace: true });
  };

  return (
    <DashboardLayout title="Settings" subtitle="Preferences and connection">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface p-6">
          <h3 className="text-base font-semibold">Appearance</h3>
          <p className="text-sm text-muted-foreground">Switch between light and dark mode. Your choice is saved.</p>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sun className="h-4.5 w-4.5 dark:hidden" />
                <Moon className="hidden h-4.5 w-4.5 dark:block" />
              </span>
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">Light / Dark</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </section>

        <section className="card-surface p-6">
          <h3 className="text-base font-semibold">API connection</h3>
          <p className="text-sm text-muted-foreground">The backend this app talks to.</p>
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-border p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-info-soft text-info">
              <Server className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">Base URL</p>
              <p className="break-all text-sm text-muted-foreground">{API_BASE_URL}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Change it with the <code className="rounded bg-muted px-1">VITE_API_URL</code> environment variable.
              </p>
            </div>
          </div>
        </section>

        <section className="card-surface p-6 lg:col-span-2">
          <h3 className="text-base font-semibold">Session</h3>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.username ?? "user"}</span>. Tokens are
            attached automatically to every API request.
          </p>
          <Button variant="outline" className="mt-5 text-destructive hover:text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </section>
      </div>
    </DashboardLayout>
  );
}
