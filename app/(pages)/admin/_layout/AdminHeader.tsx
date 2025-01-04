"use client";
import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGauge, 
  faPhotoFilm, 
  faGear, 
  faRightFromBracket,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";

function AdminHeader() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (pathname === "/admin/login") return null;

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: faGauge, current: pathname === '/admin' },
    { name: 'Content', href: '/admin/manage', icon: faPhotoFilm, current: pathname === '/admin/manage' },
    { name: 'Equipment', href: '/admin/equipment', icon: faPhotoFilm, current: pathname === '/admin/equipment' },
    { name: 'Settings', href: '/admin/settings', icon: faGear, current: pathname === '/admin/settings' },
  ];

  return (
    <div className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Left side - Logo/Brand */}
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <h1 
                className="text-xl font-semibold text-gray-800 cursor-pointer" 
                onClick={() => router.push("/admin")}
              >
                Admin Portal
              </h1>
            </div>
          </div>

          {/* Center - Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  item.current 
                    ? 'border-b-2 border-blue-500 text-gray-900' 
                    : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="mr-2 h-4 w-4" />
                {item.name}
              </button>
            ))}
          </div>

          {/* Right side - User menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative ml-3">
              <div>
                <button
                  type="button"
                  className="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-gray-700">Admin</span>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className="ml-2 h-4 w-4 text-gray-400" 
                  />
                </button>
              </div>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FontAwesomeIcon 
                      icon={faRightFromBracket} 
                      className="mr-2 h-4 w-4 text-gray-400" 
                    />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <FontAwesomeIcon icon={faChevronDown} className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isDropdownOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  setIsDropdownOpen(false);
                }}
                className={`block w-full py-2 pl-3 pr-4 text-base font-medium ${
                  item.current
                    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="mr-2 h-4 w-4" />
                {item.name}
              </button>
            ))}
            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="block w-full py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHeader;