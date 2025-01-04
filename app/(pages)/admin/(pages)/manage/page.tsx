"use client";
import React from "react";
import Link from "next/link";
export default function ContactPage() {
  return (
    <>
      <h1>Manage Content</h1>
      <ul>
        <li><Link href="/admin/galleries/new">New Gallery</Link></li>
      </ul>
    </>
  );
}
