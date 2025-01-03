"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import { Switch } from "@headlessui/react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const navLinks = [
  { id: 1, name: "STILLS", href: "/stills" },
  { id: 2, name: "TRAVEL", href: "/travel" },
  { id: 3, name: "AERIAL", href: "/aerial" },
  { id: 4, name: "PRINTS", href: "/prints" },
  { id: 5, name: "ABOUT", href: "/about" },
  { id: 6, name: "CONTACT", href: "contact" },
];

export default function Navbar() {
  const [enabled, setEnabled] = useState(true);
  return (
    <nav className="flex items-center justify-between flex-wrap  p-6">
      <div className="flex items-center flex-shrink-0   mr-6">
        <span className="font-normal text-xl tracking-tight">
          <Link href="/" className="pl-4 hover:text-gray-400">
            MAX GELLER
          </Link>
        </span>
      </div>

      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <span className="lg:flex-grow"></span>
        <div className="text-xs font-light ">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              passHref
              className="pl-4 hover:text-gray-400 hover:font-normal "
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
