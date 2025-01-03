"use client";
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrafficData, TimeFrame } from '../../lib/types/analytics';
import { getTrafficData } from '../../lib/services/analyticsService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function TrafficOverview() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('90');
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics?timeFrame=${timeFrame}`);
        const data = await response.json();
        if (response.ok) {
          setTrafficData(data);
        } else {
          console.error('Error fetching traffic data:', data.error);
        }
      } catch (error) {
        console.error('Error fetching traffic data:', error);
      }
      setLoading(false);
    }

    fetchData();
  }, [timeFrame]);

  return (
    <div className="widget md:col-span-3">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faChartLine} className="text-gray-500" />
          <h2 className="widget-title">Visitor Traffic</h2>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="30">Last 30 Days</option>
            <option value="60">Last 60 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="quarter">This Quarter</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      <div className="widget-content h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <FontAwesomeIcon icon={faSpinner} spin className="text-gray-400 text-2xl" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="visitors" stroke="#3b82f6" name="Visitors" />
              <Line type="monotone" dataKey="pageViews" stroke="#10b981" name="Page Views" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}




