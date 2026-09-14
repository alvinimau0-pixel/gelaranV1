import { createFileRoute } from "@tanstack/react-router";
import { TowerPage } from "@/components/tower-page";

export const Route = createFileRoute("/tower-a")({
  component: () => <TowerPage tower="A" />,
});
