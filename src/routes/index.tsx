import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/register">Register</Link>
        </Button>
      </div>
    </div>
  );
}
