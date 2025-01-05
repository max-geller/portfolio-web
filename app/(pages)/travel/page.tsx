"use client";
import Image from "next/image";
import TravelGrid from "../../_components/grids/TravelGrid";
import ClientLayout from "@/app/_layout/ClientLayout";

export default function TravelHome() {
  return (
    <ClientLayout>
      <main className="flex flex-col">
        <TravelGrid />
      </main>
    </ClientLayout>
  );
}
