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
import { useCreateAssetWithValidation } from "@/hooks/useAssets";
import { createAssetSchema } from "@/schemas/assets-schemas";
import { transformFormToApiData } from "@/types/asset-types";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useAssetTranslations } from "@/hooks/useTranslations";
import { toast } from "sonner";
import { AssetFormFields } from "./AssetFormFields";

interface AddAssetFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAssetForm({
  open,
  onClose,
  onSuccess,
}: AddAssetFormProps) {
  const createAssetMutation = useCreateAssetWithValidation();

  // Initialize translations
  const t = useAssetTranslations();

  const form = useForm({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      model: "",
      serialNumber: "",
      barcode: "",
      status: "active",
      condition: "good",
      criticality: "medium",
      purchaseCost: 0,
      purchaseDate: undefined,
      purchaseOrderNumber: "",
      invoiceNumber: "",
      warrantyExpiresAt: undefined,
      salvageValue: 0,
      depreciationMethod: "straight_line",
      usefulLifeYears: 0,
      ipAddress: "",
      macAddress: "",
      operatingSystem: "",
      securityClassification: "public",
      energyRating: "",
      carbonFootprint: 0,
      recyclable: false,
      notes: "",
      lastAuditDate: undefined,
      nextAuditDate: undefined,
      complianceStatus: "compliant",
      images: [],
      documents: [],
    },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      const submitData = transformFormToApiData(
        data as Record<string, unknown>
      );

      // Ensure required fields are present for AssetCreateData
      const createData = {
        ...submitData,
        categoryId: submitData.categoryId || "",
        locationId: submitData.locationId || "",
        serialNumber: submitData.serialNumber || "",
        // Ensure status field matches AssetCreateData type
        status: submitData.status as
          | "active"
          | "inactive"
          | "maintenance"
          | "disposed"
          | undefined,
        // Ensure condition field matches AssetCreateData type
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

      console.log("Submitting asset data:", createData);
      await createAssetMutation.mutateAsync(createData);

      // Show success message
      toast.success(t("createSuccess"));

      // Reset form and close dialog
      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error(error instanceof Error ? error.message : t("createError"));
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("addNewAsset")}</DialogTitle>
          <DialogDescription>{t("createAssetRecord")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AssetFormFields form={form} t={t} />

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createAssetMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createAssetMutation.isPending}>
                {createAssetMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t("creating")}
                  </>
                ) : (
                  t("create")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
