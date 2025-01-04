"use client";
import React from "react";

export default function SubscribeHero() {
  return (
    <section className="w-full bg-black py-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-400 text-lg">
            Subscribe to our newsletter for photography insights and exclusive content
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-6 py-4 bg-white/10 border border-white/20 
                     text-white placeholder:text-gray-500
                     focus:outline-none focus:border-white/40
                     transition-colors duration-200"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-white text-black font-medium
                     hover:bg-white/90 transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Subscribe
          </button>
        </form>

        {/* Optional: Additional Info */}
        <p className="text-gray-500 text-sm text-center mt-6">
          Join our growing community. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
