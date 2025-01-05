"use client";
import StillsGrid from "../../_components/grids/StillsGrid";
import ClientLayout from "@/app/_layout/ClientLayout";

export default function StillsHome() {
  return (
    <ClientLayout>
      <main className="flex flex-col">
        <StillsGrid category="stills" />
      </main>
    </ClientLayout>
  );
}
