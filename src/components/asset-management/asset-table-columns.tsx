"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  MapPin,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useAssetTranslations } from "@/hooks/useTranslations";
import { Asset } from "@/services/asset-api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  getAssetStatusBadgeVariant,
  getAssetConditionBadgeVariant,
} from "@/lib/badge-variants";

export interface AssetTableActions {
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
}

// Status and condition translation helper
const translateStatus = (
  status: string,
  t: ReturnType<typeof useAssetTranslations>
) => {
  return t(`status.${status}`) || status;
};

const translateCondition = (
  condition: string,
  t: ReturnType<typeof useAssetTranslations>
) => {
  return t(`conditions.${condition}`) || condition;
};

export function createAssetColumns(
  actions: AssetTableActions,
  t: ReturnType<typeof useAssetTranslations>
): ColumnDef<Asset>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            {t("table.asset")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div>
            <div className="font-medium">{asset.name}</div>
            <div className="text-sm text-gray-500">{asset.assetNumber}</div>
            {asset.serialNumber && (
              <div className="text-xs text-gray-400">
                {t("table.serialNumber")}: {asset.serialNumber}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            {t("table.category")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? (
          <div className="flex items-center">
            <Package className="mr-2 h-4 w-4 text-gray-400" />
            {category.name}
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "location",
      header: t("table.location"),
      cell: ({ row }) => {
        const location = row.original.location;
        return location ? (
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
            {location.name}
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "assignee",
      header: t("table.assignee"),
      cell: ({ row }) => {
        const assignee = row.original.assignee;
        return assignee ? (
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4 text-gray-400" />
            {assignee.firstName} {assignee.lastName}
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            {t("table.status")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={getAssetStatusBadgeVariant(status)}>
            {translateStatus(status, t)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "condition",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            {t("table.condition")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const condition = row.getValue("condition") as string;
        return (
          <Badge variant={getAssetConditionBadgeVariant(condition)}>
            {translateCondition(condition, t)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "purchaseCost",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            {t("table.purchaseCost")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <DollarSign className="mr-1 h-4 w-4 text-gray-400" />
            {formatCurrency(row.getValue("purchaseCost"))}
          </div>
        );
      },
    },
    {
      accessorKey: "purchaseDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            {t("table.purchaseDate")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4 text-gray-400" />
            {formatDate(row.getValue("purchaseDate"))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t("table.actions"),
      cell: ({ row }) => {
        const asset = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("table.openMenu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onView(asset)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("table.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onEdit(asset)}>
                <Edit className="mr-2 h-4 w-4" />
                {t("table.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onDelete(asset.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("table.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
