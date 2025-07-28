"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { createAssetColumns } from "./asset-table-columns";
import { Search, Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAssets, useDeleteAsset } from "@/hooks/useAssets";
import { Asset } from "@/services/asset-api";

interface AssetListProps {
  onAddAsset: () => void;
  onEditAsset: (asset: Asset) => void;
  onViewAsset: (asset: Asset) => void;
}

export default function AssetList({
  onAddAsset,
  onEditAsset,
  onViewAsset,
}: AssetListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // Build query options for React Query in the correct format
  const queryOptions = {
    filters: {
      ...(searchTerm && { search: searchTerm }),
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(categoryFilter !== "all" && { categoryId: categoryFilter }),
    },
    pagination: {
      page: currentPage,
      limit: 10,
    },
  };

  // Use React Query hooks
  const { data, isLoading: loading } = useAssets(queryOptions);
  const deleteAssetMutation = useDeleteAsset();

  // Extract data from React Query response
  const assets = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalCount = data?.pagination?.total || 0;

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) {
      return;
    }

    try {
      await deleteAssetMutation.mutateAsync(assetId);
      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        title: "Error",
        description: "Failed to delete asset. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Create columns with actions
  const columns = createAssetColumns({
    onView: onViewAsset,
    onEdit: onEditAsset,
    onDelete: handleDeleteAsset,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600">Manage your company assets</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={onAddAsset}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search assets by name, serial number, or barcode..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {/* TODO: Add actual categories */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={assets}
        loading={loading}
        loadingMessage="Loading assets..."
        emptyMessage="No assets found"
        emptyDescription="Get started by adding your first asset"
        emptyAction={
          <Button onClick={onAddAsset} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        }
        searchKey="name"
        searchPlaceholder="Search assets..."
        showSearch={false} // We're using custom filters above
        showColumnToggle={true}
        pagination={true}
        pageSize={10}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
