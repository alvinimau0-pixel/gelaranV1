import { createFileRoute } from "@tanstack/react-router";
import { TowerPage } from "@/components/tower-page";

export const Route = createFileRoute("/tower-b")({
  component: () => <TowerPage tower="B" />,
});
