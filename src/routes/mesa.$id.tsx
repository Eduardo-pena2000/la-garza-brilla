import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/mesa/$id")({
  component: () => <Outlet />,
});