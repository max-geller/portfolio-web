"use client";
import React from "react";
import Link from "next/link";

export default function About() {
  return (
    <div className="flex flex-col items-center justify-center  w-full p-24">
      <h1 className="text-4xl font-bold">About Section</h1>
      <div className="flex flex-row">
        <div className="flex flex-col">

          <div className="card w-96 bg-slate-700 text-primary-content">
            <div className="card-body">
              <h2 className="card-title">Gear</h2>
              <ul>
                <li>Gear</li>
                <li>Equipment</li>
                <li>Background</li>
                <li>Experience</li>
                <li>Skills</li>
                <li>Services</li>
                <li>Interests</li>
              </ul>
              <div className="card-actions justify-end">
                <button className="btn hover:text-green-400">Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
