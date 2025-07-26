"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import UserManagement from "@/components/asset-management/UserManagement";
import { useAuth, RoleGuard } from "@/contexts/AuthContext";

interface TabConfig {
  id: string;
  label: string;
  component: React.ComponentType;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

const tabs: TabConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    component: DashboardOverview,
  },
  {
    id: "assets",
    label: "Assets",
    component: AssetList,
  },
  {
    id: "maintenance",
    label: "Maintenance",
    component: MaintenanceSchedule,
  },
  {
    id: "reports",
    label: "Reports",
    component: Reports,
    requiredRoles: ["admin", "manager", "super_admin"],
  },
  {
    id: "users",
    label: "Users",
    component: UserManagement,
    requiredRoles: ["admin", "super_admin"],
  },
  {
    id: "settings",
    label: "Settings",
    component: Settings,
    requiredRoles: ["admin", "super_admin"],
  },
];

// Placeholder components - replace with actual implementations
function DashboardOverview() {
  const { user, company } = useAuth();

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h1 className="mb-2 text-2xl font-bold">
          Welcome back, {user?.firstName} {user?.lastName}!
        </h1>
        <p className="text-blue-100">
          {company?.name} - Asset Management Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-blue-100 p-2">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-green-100 p-2">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Assets</p>
              <p className="text-2xl font-bold text-gray-900">1,150</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-yellow-100 p-2">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Needs Maintenance
              </p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-red-100 p-2">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Out of Service
              </p>
              <p className="text-2xl font-bold text-gray-900">61</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Asset LAP001 maintenance completed
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  New asset PRN003 added to inventory
                </p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Asset DES002 requires maintenance
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Upcoming Maintenance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div>
                <p className="font-medium">Server Rack A1</p>
                <p className="text-sm text-gray-600">Scheduled cleaning</p>
              </div>
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                Tomorrow
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div>
                <p className="font-medium">Printer HP-001</p>
                <p className="text-sm text-gray-600">Regular maintenance</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                3 days
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AssetList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Add New Asset
        </Button>
      </div>
      <Card className="p-6">
        <p className="text-gray-600">
          Asset list and management functionality will be implemented here.
        </p>
      </Card>
    </div>
  );
}

function MaintenanceSchedule() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Maintenance Schedule</h1>
      <Card className="p-6">
        <p className="text-gray-600">
          Maintenance scheduling and tracking functionality will be implemented
          here.
        </p>
      </Card>
    </div>
  );
}

function Reports() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      <Card className="p-6">
        <p className="text-gray-600">
          Reporting and analytics functionality will be implemented here.
        </p>
      </Card>
    </div>
  );
}

function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
      <Card className="p-6">
        <p className="text-gray-600">
          Company settings and configuration will be implemented here.
        </p>
      </Card>
    </div>
  );
}

export default function AssetManagementPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, logout } = useAuth();

  if (!user) {
    return null; // Will be handled by AuthProvider redirect
  }

  // Filter tabs based on user role and permissions
  const visibleTabs = tabs.filter(tab => {
    if (tab.requiredRoles && !tab.requiredRoles.includes(user.role)) {
      return false;
    }
    // Add permission checks here if needed
    return true;
  });

  const ActiveComponent =
    tabs.find(tab => tab.id === activeTab)?.component || DashboardOverview;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-blue-600 p-2">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tangibly</h1>
                <p className="text-sm text-gray-600">Asset Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-600 capitalize">{user.role}</p>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-white">
        <div className="px-6">
          <div className="flex space-x-8">
            {visibleTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <div className="p-6">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
