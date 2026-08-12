import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loading } from "@/components/Feedback";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      void navigate({ to: "/login", replace: true });
    }
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) return <Loading label="Checking your session..." />;

  return <Outlet />;
}
