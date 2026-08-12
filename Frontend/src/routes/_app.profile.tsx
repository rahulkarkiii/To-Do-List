import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AtSign, BadgeCheck, LogOut, RefreshCw, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { computeStats, useTasks } from "@/hooks/useTasks";

export const Route = createFileRoute("/_app/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your Profile — TaskFlow" },
      { name: "description", content: "View your TaskFlow account details and task activity summary." },
      { property: "og:title", content: "Your Profile — TaskFlow" },
      { property: "og:description", content: "View your TaskFlow account details and task activity summary." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { data } = useTasks();
  const stats = computeStats(data ?? []);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
    toast.success("Profile refreshed.");
  };

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
    void navigate({ to: "/login", replace: true });
  };

  const rows = [
    { label: "Username", value: user?.username ?? "—", icon: User },
    { label: "Email", value: (user?.email as string) ?? "Not provided", icon: AtSign },
    { label: "User ID", value: user?.id ? `#${user.id}` : "—", icon: BadgeCheck },
    { label: "Authentication", value: "JWT Bearer token", icon: ShieldCheck },
  ];

  return (
    <DashboardLayout title="Profile" subtitle="Your account information">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="card-surface p-6 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-brand text-2xl font-bold text-primary-foreground">
            {(user?.username ?? "U").slice(0, 2).toUpperCase()}
          </div>
          <h2 className="mt-4 truncate text-lg font-semibold">{user?.username ?? "Account"}</h2>
          <p className="truncate text-sm text-muted-foreground">{(user?.email as string) ?? "No email on file"}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Total tasks</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-xl font-bold">{stats.complete}</p>
            </div>
          </div>
          <Button variant="outline" className="mt-4 w-full" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh profile
          </Button>
        </div>

        <div className="card-surface divide-y divide-border">
          <div className="p-6">
            <h3 className="text-base font-semibold">Account information</h3>
            <p className="text-sm text-muted-foreground">Details returned by your API.</p>
          </div>
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-4 px-6 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <row.icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</p>
                <p className="truncate font-medium">{String(row.value)}</p>
              </div>
            </div>
          ))}
          <div className="p-6">
            <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
