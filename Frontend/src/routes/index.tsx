import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Gauge,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskFlow — Organize Your Work, Accomplish More" },
      {
        name: "description",
        content:
          "TaskFlow is a simple, powerful task manager. Track pending, in-progress and completed work from one clean dashboard.",
      },
      { property: "og:title", content: "TaskFlow — Organize Your Work, Accomplish More" },
      {
        property: "og:description",
        content: "Manage your daily tasks easily with a simple and powerful task management system.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: ListChecks, title: "Easy Task Management", text: "Create, edit and complete tasks in a couple of clicks." },
  { icon: BarChart3, title: "Track Progress", text: "See pending, in-progress and completed work at a glance." },
  { icon: Sparkles, title: "Organize Your Work", text: "Filter, search and sort so the right task is always on top." },
  { icon: ShieldCheck, title: "Secure Authentication", text: "JWT-protected sessions keep your tasks private." },
  { icon: Zap, title: "Fast & Responsive", text: "Instant interactions on desktop, tablet and mobile." },
  { icon: Gauge, title: "Productivity Dashboard", text: "Live statistics that update as you get things done." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
              <Zap className="h-5 w-5" />
            </span>
            <span className="truncate text-lg font-bold tracking-tight">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -top-40 h-[420px] bg-gradient-hero opacity-60 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Your daily work, beautifully organized
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Organize Your Work.
              <span className="block bg-gradient-brand bg-clip-text text-transparent">Accomplish More.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Manage your daily tasks easily with a simple and powerful task management system.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/register">
                  Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
            </div>

            <div className="mx-auto mt-16 max-w-4xl">
              <div className="card-surface overflow-hidden p-4 shadow-elevated sm:p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Pending", value: "8", tone: "bg-warning-soft text-warning" },
                    { label: "In Progress", value: "3", tone: "bg-info-soft text-info" },
                    { label: "Completed", value: "24", tone: "bg-success-soft text-success" },
                  ].map((c) => (
                    <div key={c.label} className="rounded-xl border border-border p-4 text-left">
                      <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold ${c.tone}`}>
                        {c.label}
                      </span>
                      <p className="mt-3 text-3xl font-bold">{c.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {["Prepare weekly report", "Review pull requests", "Plan sprint backlog"].map((t, i) => (
                    <div key={t} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left">
                      <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 ${i === 2 ? "text-success" : "text-muted-foreground"}`} />
                      <span className="truncate text-sm font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to stay on track</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              A focused set of tools that keeps your day moving forward.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-surface p-6 transition-all hover:-translate-y-1 hover:shadow-elevated">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="rounded-3xl bg-gradient-brand px-6 py-14 text-center text-primary-foreground shadow-elevated">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to get organized?</h2>
            <p className="mx-auto mt-3 max-w-lg opacity-90">
              Create your free account and turn your to-do list into done.
            </p>
            <Button size="lg" variant="secondary" asChild className="mt-8">
              <Link to="/register">
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-sm text-muted-foreground sm:px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">TaskFlow</span>
          </div>
          <p>Organize your work. Accomplish more.</p>
        </div>
      </footer>
    </div>
  );
}
