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
import ViewAssetDialog from "./ViewAssetDialog";
import DeleteAssetDialog from "./DeleteAssetDialog";
import { Search, Plus, Download } from "lucide-react";
import { useAssets, useDeleteAsset } from "@/hooks/useAssets";
import { useAssetTranslations } from "@/hooks/useTranslations";
import { AssetEntity as Asset } from "@/types";
import { toast } from "sonner";

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
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Initialize translations
  const t = useAssetTranslations();

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

  // Handle view asset
  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowViewDialog(true);
    onViewAsset(asset); // Call the parent handler as well
  };

  // Enhanced delete with confirmation dialog
  const handleDeleteAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowDeleteDialog(true);
  };

  // Handle delete asset by ID (for backward compatibility)
  const handleDeleteAssetById = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      handleDeleteAsset(asset);
    }
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    try {
      console.log("handleConfirmDelete called with asset:", selectedAsset);
      if (!selectedAsset) {
        console.error("No asset selected for deletion");
        return;
      }

      // Call the mutation directly
      await deleteAssetMutation.mutateAsync(selectedAsset.id);
      setShowDeleteDialog(false);
      setSelectedAsset(null);
      toast.success(t("assetDeletedSuccessfully"));
    } catch (error) {
      toast.error(t("failedToDeleteAsset"));
    }
  };

  // Close dialogs
  const handleCloseViewDialog = () => {
    setShowViewDialog(false);
    setSelectedAsset(null);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedAsset(null);
  };

  // Create columns with actions and translations
  const columns = createAssetColumns(
    {
      onView: handleViewAsset,
      onEdit: onEditAsset,
      onDelete: handleDeleteAssetById,
    },
    t
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
          <Button
            onClick={onAddAsset}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("add")}
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
                placeholder={t("search")}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="active">{t("status.active")}</SelectItem>
                <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
                <SelectItem value="maintenance">
                  {t("status.maintenance")}
                </SelectItem>
                <SelectItem value="disposed">{t("status.disposed")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("filters.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {/* TODO: Add actual categories */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={assets}
        loading={loading}
        loadingMessage={t("loading")}
        emptyMessage={t("noAssets")}
        emptyDescription={t("noAssetsDescription")}
        emptyAction={
          <Button onClick={onAddAsset} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("add")}
          </Button>
        }
        searchKey="name"
        searchPlaceholder={t("searchPlaceholder")}
        showSearch={false} // We're using custom filters above
        showColumnToggle={true}
        pagination={true}
        pageSize={10}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* View Asset Dialog */}
      <ViewAssetDialog
        open={showViewDialog}
        onClose={handleCloseViewDialog}
        asset={selectedAsset || undefined}
      />

      {/* Delete Asset Dialog */}
      <DeleteAssetDialog
        open={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        asset={selectedAsset}
        isDeleting={deleteAssetMutation.isPending}
      />
    </div>
  );
}
