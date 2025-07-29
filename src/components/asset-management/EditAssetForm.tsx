"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useUpdateAsset } from "@/hooks/useAssets";

import { transformFormToApiData } from "@/types/asset-types";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useAssetTranslations } from "@/hooks/useTranslations";
import { toast } from "sonner";
import { AssetEntity as Asset } from "@/types";
import { useEffect } from "react";
import { updateAssetSchema } from "@/schemas/assets-schemas";

import { AssetFormFields } from "./AssetFormFields";

interface EditAssetFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset: Asset | null;
}

export default function EditAssetForm({
  open,
  onClose,
  onSuccess,
  asset,
}: EditAssetFormProps) {
  const updateAssetMutation = useUpdateAsset();

  // Initialize translations
  const t = useAssetTranslations();

  const form = useForm({
    resolver: zodResolver(updateAssetSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      model: "",
      serialNumber: "",
      barcode: "",
      status: "active" as const,
      condition: "good" as const,
      criticality: "medium" as const,
      purchaseCost: "",
      purchaseDate: undefined,
      purchaseOrderNumber: "",
      invoiceNumber: "",
      warrantyExpiresAt: undefined,
      salvageValue: "0",
      depreciationMethod: "straight_line" as const,
      usefulLifeYears: "",
      ipAddress: "",
      macAddress: "",
      operatingSystem: "",
      securityClassification: "public" as const,
      energyRating: "",
      carbonFootprint: "",
      recyclable: false,
      notes: "",
    },
  });

  // Populate form when asset data is available
  useEffect(() => {
    if (asset && open) {
      form.reset({
        name: asset.name || "",
        description: asset.description || "",
        brand: asset.brand || "",
        model: asset.model || "",
        serialNumber: asset.serialNumber || "",
        barcode: asset.barcode || "",
        status: asset.status || "active",
        condition: asset.condition || "good",
        criticality: asset.criticality || "medium",
        purchaseCost: asset?.purchaseCost
          ? asset?.purchaseCost?.toString()
          : "",
        purchaseDate: asset?.purchaseDate || undefined,
        purchaseOrderNumber: asset?.purchaseOrderNumber || "",
        invoiceNumber: asset?.invoiceNumber || "",
        warrantyExpiresAt: asset?.warrantyExpiresAt || undefined,
        salvageValue: asset?.salvageValue?.toString() || "0",
        depreciationMethod: asset?.depreciationMethod || "straight_line",
        usefulLifeYears: asset?.usefulLifeYears?.toString() || "",
        ipAddress: asset?.ipAddress || "",
        macAddress: asset?.macAddress || "",
        operatingSystem: asset?.operatingSystem || "",
        securityClassification: asset.securityClassification || "public",
        energyRating: asset.energyRating || "",
        carbonFootprint: asset.carbonFootprint?.toString() || "",
        recyclable: asset.recyclable || false,
        notes: asset.notes || "",
      });
    }
  }, [asset, open, form]);

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!asset) return;

    try {
      const submitData = transformFormToApiData(
        data as Record<string, unknown>
      );

      // Convert AssetCreateRequest to AssetUpdateData format
      const updateData = {
        ...submitData,
        // Ensure status field matches AssetUpdateData type
        status: submitData.status as
          | "active"
          | "inactive"
          | "maintenance"
          | "disposed"
          | undefined,
        // Ensure condition field matches AssetUpdateData type
        condition:
          submitData.condition === "damaged"
            ? "poor"
            : (submitData.condition as
                | "excellent"
                | "good"
                | "fair"
                | "poor"
                | undefined),
      };

      console.log("Updating asset data:", updateData);
      await updateAssetMutation.mutateAsync({
        id: asset.id,
        data: updateData,
      });

      // Show success message
      toast.success(t("updateSuccess") || "Asset updated successfully!");

      // Reset form
      form.reset();

      // Close dialog and call success callback
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error updating asset:", error);
      toast.error(
        t("updateError") || "Failed to update asset. Please try again."
      );
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = updateAssetMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("updateAsset")}</DialogTitle>
          <DialogDescription>{t("editAssetDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AssetFormFields form={form} t={t} />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t("updating") || "Updating..."}
                  </>
                ) : (
                  t("updateAsset") || "Update Asset"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
