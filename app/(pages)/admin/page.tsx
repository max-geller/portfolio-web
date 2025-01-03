"use client";
import React from "react";
import { useState } from 'react'

import Link from "next/link";
export default function ContactPage() {
  return (
    <>
      <h1>Admin</h1>
      Links to Pages:
      <div>
        <div> 
          <Link href="/admin/manage">Manage Content</Link>
        </div>
        <div>
          <Link href="/admin/settings">Application Settings</Link>
        </div>
      </div>
    </>
  );
}
