"use client";
import React from "react";
import ClientLayout from "@/app/_layout/ClientLayout";

export default function GearPage() {
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Photography Gear</h1>
        <div className="space-y-8">
          {/* Your gear content here */}
        </div>
      </div>
    </ClientLayout>
  );
}
