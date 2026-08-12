import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  ListTodo,
  Loader2,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  User,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard", search: undefined },
  { label: "All Tasks", icon: ListTodo, to: "/tasks", search: { status: "all" } },
  { label: "Pending", icon: Clock, to: "/tasks", search: { status: "pending" } },
  { label: "In Progress", icon: Loader2, to: "/tasks", search: { status: "in_progress" } },
  { label: "Completed", icon: CheckCircle2, to: "/tasks", search: { status: "complete" } },
  { label: "Add Task", icon: Plus, to: "/tasks", search: { status: "all", new: true } },
  { label: "Profile", icon: User, to: "/profile", search: undefined },
  { label: "Settings", icon: Settings, to: "/settings", search: undefined },
] as const;

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname, search } = useRouterState({ select: (s) => s.location });
  const currentStatus = (search as { status?: string })?.status ?? "all";

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {NAV.map((item) => {
        const active =
          pathname === item.to &&
          (item.to !== "/tasks" || (item.search?.status ?? "all") === currentStatus) &&
          !(item.label === "Add Task");
        return (
          <Link
            key={item.label}
            to={item.to}
            search={item.search as never}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-4 py-5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
        <Zap className="h-5 w-5" />
      </span>
      <span className="text-lg font-bold tracking-tight">TaskFlow</span>
    </Link>
  );
}

export function DashboardLayout({
  title,
  subtitle,
  children,
  searchValue,
  onSearchChange,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
    void navigate({ to: "/login", replace: true });
  };

  const initials = (user?.username ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <Brand />
        <NavItems />
        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="flex h-full flex-col">
                    <Brand />
                    <NavItems onNavigate={() => setMobileOpen(false)} />
                    <div className="border-t border-border p-3">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <LogOut className="h-4.5 w-4.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {onSearchChange && (
                <div className="relative hidden md:block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchValue ?? ""}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-56 pl-9"
                  />
                </div>
              )}
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-accent">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground">
                      {initials}
                    </span>
                    <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:block">
                      {user?.username ?? "Account"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="truncate">
                    {user?.username ?? "Account"}
                    {user?.email && (
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {onSearchChange && (
            <div className="px-4 pb-3 md:hidden sm:px-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue ?? ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-9"
                />
                {searchValue && (
                  <button
                    onClick={() => onSearchChange("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
