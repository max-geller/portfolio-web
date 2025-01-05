"use client";
import React from "react";
import "./styles/dashboard.css";
import TrafficOverview from "./_components/_widgets/TrafficOverview";
import ClientLayout from "@/app/_layout/ClientLayout";

export default function AdminDashboard() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-100">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

          <TrafficOverview />

          {/* Quick Stats - 1x1 each */}
          <div className="widget">
            <div className="widget-header">
              <h2 className="widget-title">Page Views</h2>
            </div>
            <div className="widget-content">
              <div className="text-3xl font-bold text-blue-600">12,345</div>
              <div className="text-sm text-gray-500">+12% from last month</div>
            </div>
            <div>Popular Pages</div>
          </div>

          {/* Session Stats - 1x1 each */}
          <div className="widget">
            <div className="widget-header">
              <h2 className="widget-title">Average Session Duration</h2>
            </div>
            <div className="widget-content">
              <div className="text-3xl font-bold text-blue-600">12,345</div>
              <div className="text-sm text-gray-500">+12% from last month</div>
            </div>
            <div>Popular Pages</div>
          </div>

          {/* Bounce Rate - 1x1 each */}
          <div className="widget">
            <div className="widget-header">
              <h2 className="widget-title">Bounce Rate</h2>
            </div>
            <div className="widget-content">
              <div className="text-3xl font-bold text-blue-600">12,345</div>
              <div className="text-sm text-gray-500">+12% from last month</div>
            </div>
            <div>Popular Pages</div>
          </div>

          {/* Popular Content - 2x2 */}
          <div className="widget md:col-span-2 md:row-span-2">
            <div className="widget-header">
              <h2 className="widget-title">Popular Photos</h2>
            </div>
            <div className="widget-content">
              <div className="space-y-4">
                {/* Photo list will go here */}
                <div className="h-64 bg-gray-50 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Analytics Widgets - 1x1 each */}
          <div className="widget">
            <div className="widget-header">
              <h2 className="widget-title">Top Countries</h2>
            </div>
            <div className="widget-content">
              {/* Country list will go here */}
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h2 className="widget-title">Top Devices</h2>
            </div>
            <div className="widget-content">
              {/* Device chart will go here */}
            </div>
          </div>

          {/* Popular Prints - 2x2 */}
          <div className="widget md:col-span-2 md:row-span-2">
            <div className="widget-header">
              <h2 className="widget-title">Popular Prints</h2>
            </div>
            <div className="widget-content">
              <div className="space-y-4">
                {/* Photo list will go here */}
                <div className="h-64 bg-gray-50 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Email Subscriptions - 1x1 each */}
          <div className="widget">
            <div className="widget-header">
              <h2 className="widget-title">Email Subscriptions</h2>
            </div>
            <div className="widget-content">
              <div className="text-3xl font-bold text-blue-600">12,345</div>
              <div className="text-sm text-gray-500">+12% from last month</div>
            </div>
            <div>Popular Pages</div>
          </div>

          {/* Social Media Clicks - 1x1 each */}
          <div className="widget">
            <div className="widget-header">
              <h2 className="widget-title">Social Media Clicks (Outbound)</h2>
            </div>
            <div className="widget-content">
              <div className="text-3xl font-bold text-blue-600">12,345</div>
              <div className="text-sm text-gray-500">+12% from last month</div>
            </div>
            <div>Popular Pages</div>
          </div>

          {/* Sales Widget - 2x1 */}
          <div className="widget md:col-span-2">
            <div className="widget-header">
              <h2 className="widget-title">Print Sales</h2>
            </div>
            <div className="widget-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    $1,234
                  </div>
                  <div className="text-sm text-gray-500">This Month</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">23</div>
                  <div className="text-sm text-gray-500">Orders</div>
                </div>
              </div>
            </div>
          </div>

          {/* Inbound Sources - 1x1 each */}
          <div className="widget">
            <div className="widget-header">
              <h2 className="widget-title">Inbound Sources</h2>
            </div>
            <div className="widget-content">
              <div className="text-3xl font-bold text-blue-600">12,345</div>
              <div className="text-sm text-gray-500">+12% from last month</div>
            </div>
            <div>Popular Pages</div>
          </div>
        </div>
      </div>
      <ul>
        <li>Popular Pages</li>
        <li>User Demographics</li>
        <li>Top Referring Sites</li>
        <li>Top Browsers</li>
        <li>Top Operating Systems</li>
        <li>Top Devices</li>
        <li>Bounce Rate Calculations</li>
        <li>Geographic Distribution</li>
        <li>Conversion Funnels for Print Sales</li>
        <li>Photo Interactions</li>
        <li>Add to Cart Events</li>
        <li>Purchase Events</li>
        <li>User Engagement Metrics</li>
        <li>User Retention Metrics</li>
        <li>User Acquisition Metrics</li>
      </ul>
    </div>
    </ClientLayout>
  );
}
