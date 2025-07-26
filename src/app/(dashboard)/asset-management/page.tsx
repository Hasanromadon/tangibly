"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Package,
  MapPin,
  Wrench,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
} from "lucide-react";

interface DashboardMetrics {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  criticalAssets: number;
  totalValue: number;
  depreciationThisMonth: number;
  overdueMaintenances: number;
  upcomingMaintenances: number;
  complianceScore: number;
  totalCompanies: number;
  totalUsers: number;
  totalLocations: number;
}

interface RecentAsset {
  id: string;
  assetNumber: string;
  name: string;
  category: string;
  status: string;
  location: string;
  createdAt: string;
}

export default function AssetManagementDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAssets: 0,
    activeAssets: 0,
    maintenanceAssets: 0,
    criticalAssets: 0,
    totalValue: 0,
    depreciationThisMonth: 0,
    overdueMaintenances: 0,
    upcomingMaintenances: 0,
    complianceScore: 0,
    totalCompanies: 0,
    totalUsers: 0,
    totalLocations: 0,
  });

  const [recentAssets, setRecentAssets] = useState<RecentAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls - replace with real API calls
    const fetchDashboardData = async () => {
      try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data for demonstration
        setMetrics({
          totalAssets: 1247,
          activeAssets: 1098,
          maintenanceAssets: 47,
          criticalAssets: 23,
          totalValue: 2450000000, // 2.45 billion IDR
          depreciationThisMonth: 45000000, // 45 million IDR
          overdueMaintenances: 12,
          upcomingMaintenances: 38,
          complianceScore: 94,
          totalCompanies: 5,
          totalUsers: 156,
          totalLocations: 23,
        });

        setRecentAssets([
          {
            id: "1",
            assetNumber: "LAP-2025-0001",
            name: "Dell Laptop Latitude 5520",
            category: "IT Equipment",
            status: "active",
            location: "Jakarta Office",
            createdAt: "2025-01-15T10:30:00Z",
          },
          {
            id: "2",
            assetNumber: "VEH-2025-0001",
            name: "Toyota Avanza 2024",
            category: "Vehicle",
            status: "active",
            location: "Surabaya Branch",
            createdAt: "2025-01-14T14:20:00Z",
          },
          {
            id: "3",
            assetNumber: "MAC-2025-0001",
            name: "Production Machine Type A",
            category: "Machinery",
            status: "maintenance",
            location: "Factory Bekasi",
            createdAt: "2025-01-13T09:15:00Z",
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      inactive: "bg-gray-100 text-gray-800",
      disposed: "bg-red-100 text-red-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Asset Management Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Comprehensive SAAS platform for Indonesian enterprise asset
                management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                ISO 27001 Compliant
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                ISO 14001 Certified
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                PSAK 16 Ready
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Assets
              </CardTitle>
              <Package className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalAssets.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">
                {metrics.activeAssets} active, {metrics.maintenanceAssets} in
                maintenance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Asset Value
              </CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.totalValue)}
              </div>
              <p className="text-muted-foreground text-xs">
                -{formatCurrency(metrics.depreciationThisMonth)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Maintenance Status
              </CardTitle>
              <Wrench className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {metrics.overdueMaintenances}
              </div>
              <p className="text-muted-foreground text-xs">
                {metrics.upcomingMaintenances} upcoming this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Compliance Score
              </CardTitle>
              <CheckCircle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.complianceScore}%
              </div>
              <p className="text-muted-foreground text-xs">
                ISO & Indonesian standards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Company & User Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>System Statistics</CardTitle>
                  <CardDescription>
                    Multi-tenant SAAS platform overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Active Companies</span>
                    </div>
                    <span className="font-semibold">
                      {metrics.totalCompanies}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Total Users</span>
                    </div>
                    <span className="font-semibold">{metrics.totalUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Total Locations</span>
                    </div>
                    <span className="font-semibold">
                      {metrics.totalLocations}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Critical Assets</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      {metrics.criticalAssets}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Assets */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Assets</CardTitle>
                  <CardDescription>
                    Latest assets added to the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentAssets.map(asset => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between rounded-lg border p-2"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {asset.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {asset.assetNumber} • {asset.location}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`text-xs ${getStatusBadge(asset.status)}`}
                          >
                            {asset.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Management Features</CardTitle>
                <CardDescription>
                  Comprehensive asset lifecycle management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">QR Code Scanning</h3>
                    <p className="text-sm text-gray-600">
                      Mobile-first asset identification and tracking with QR
                      codes
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">
                      Depreciation Calculation
                    </h3>
                    <p className="text-sm text-gray-600">
                      PSAK 16 compliant depreciation with multiple methods
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">Asset Transfer</h3>
                    <p className="text-sm text-gray-600">
                      Seamless asset movement tracking with approval workflows
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">
                      Multi-location Support
                    </h3>
                    <p className="text-sm text-gray-600">
                      Hierarchical location management for enterprise scale
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">Custom Categories</h3>
                    <p className="text-sm text-gray-600">
                      Flexible asset categorization with custom fields
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">Audit Trail</h3>
                    <p className="text-sm text-gray-600">
                      Complete audit logging for compliance and security
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Management</CardTitle>
                <CardDescription>
                  Preventive and corrective maintenance scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">
                      Work Order Management
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Complete work order lifecycle from creation to completion
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Preventive maintenance scheduling</li>
                      <li>• Emergency work orders</li>
                      <li>• Vendor coordination</li>
                      <li>• Parts and labor tracking</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">
                      Maintenance Analytics
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Data-driven insights for maintenance optimization
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• MTBF (Mean Time Between Failures)</li>
                      <li>• MTTR (Mean Time To Repair)</li>
                      <li>• Cost analysis and budgeting</li>
                      <li>• Performance trending</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Standards</CardTitle>
                <CardDescription>
                  ISO standards and Indonesian regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold text-blue-600">
                      ISO 27001
                    </h3>
                    <p className="mb-2 text-sm text-gray-600">
                      Information Security Management
                    </p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>• IT asset inventory</li>
                      <li>• Risk assessment</li>
                      <li>• Access control</li>
                      <li>• Incident tracking</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold text-green-600">
                      ISO 14001
                    </h3>
                    <p className="mb-2 text-sm text-gray-600">
                      Environmental Management
                    </p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>• Environmental impact tracking</li>
                      <li>• Waste management</li>
                      <li>• Energy consumption</li>
                      <li>• Carbon footprint</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold text-purple-600">
                      Indonesian Standards
                    </h3>
                    <p className="mb-2 text-sm text-gray-600">
                      Local regulatory compliance
                    </p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>• PSAK 16 depreciation</li>
                      <li>• Tax regulation compliance</li>
                      <li>• NPWP integration</li>
                      <li>• Local reporting formats</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Management</CardTitle>
                <CardDescription>
                  Asset valuation and depreciation tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">Depreciation Methods</h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Multiple depreciation methods compliant with Indonesian
                      accounting standards
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Straight-line method</li>
                      <li>• Declining balance method</li>
                      <li>• Units of production method</li>
                      <li>• Custom depreciation schedules</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-semibold">Financial Reporting</h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Comprehensive financial reports for asset management
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Asset register reports</li>
                      <li>• Depreciation schedules</li>
                      <li>• Tax depreciation reports</li>
                      <li>• Insurance valuation reports</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
