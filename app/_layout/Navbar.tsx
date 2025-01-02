"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import { Switch } from "@headlessui/react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const navLinks = [
  { id: 1, name: "TRAVEL", href: "/travel" },
  { id: 2, name: "STILLS", href: "/" },
  { id: 3, name: "FPV", href: "/fpv" },
  { id: 4, name: "ABOUT", href: "/about" },
  { id: 5, name: "CONTACT", href: "contact" },

];

export default function Navbar() {
  const [enabled, setEnabled] = useState(true);
  return (
    <nav className="flex items-center justify-between flex-wrap  p-6">
      <div className="flex items-center flex-shrink-0   mr-6">
        <span className="font-medium text-xl tracking-tight">
          <Link href="/">MAX GELLER</Link>
        </span>
      </div>

      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <span className="lg:flex-grow"></span>
        <div className="text-xs font-medium ">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              passHref
              className="pl-4 hover:text-gray-400"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
