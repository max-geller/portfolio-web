"use client";
import React from "react";

export default function ContactPage() {
  return (
    <>
      <h1>Manage Content</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2>Travel Galleries</h2>
        </div>
        <div className="flex flex-col gap-2">
          <h2>Still Galleries</h2>
        </div>
        <div className="flex flex-col gap-2">
          <h2>FPV Entries</h2>
        </div>
      </div>
    </>
  );
}
