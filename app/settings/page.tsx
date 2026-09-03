import type { Metadata } from "next";
import { SettingsScreen } from "@/components/settings-screen";

export const metadata: Metadata = {
  title: "Customize — SIGMA",
  description: "Choose the theme, accent, font, and layout for your clock.",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
