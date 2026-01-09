import { authMiddleware } from "@/lib/middleware";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  server: {
    middleware: [authMiddleware],
  },
});
