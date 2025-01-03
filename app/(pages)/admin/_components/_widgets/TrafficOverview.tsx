
"use client";
import React from "react";

export default function Footer() {
    return (
        <>
          {/* Traffic Overview Widget - 3x1 */}
          <div className="widget md:col-span-3">
            <div className="widget-header">
              <h2 className="widget-title">Visitor Traffic</h2>
              <span className="text-sm text-gray-500">Last 90 days</span>
            </div>
            <div className="widget-content h-64 bg-gray-50 rounded-lg">
              {/* Chart will go here */}
            </div>
          </div>
        </>
    );
}




