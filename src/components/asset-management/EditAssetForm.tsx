"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateAsset } from "@/hooks/useAssets";
import { assetFormSchema } from "@/schemas/assets-schemas";
import { transformFormToApiData, dateUtils } from "@/types/asset-types";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useAssetTranslations } from "@/hooks/useTranslations";
import { toast } from "sonner";
import { Asset } from "@/types/entities";
import { useEffect } from "react";

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
    resolver: zodResolver(assetFormSchema),
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
      purchaseDate: "",
      purchaseOrderNumber: "",
      invoiceNumber: "",
      warrantyExpiresAt: "",
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
      // Use the date utility function for proper format conversion
      const formatDate = (date: string | null) => {
        return dateUtils.isoToDateTimeLocal(date);
      };

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
        purchaseCost: asset.purchaseCost?.toString() || "",
        purchaseDate: formatDate(asset.purchaseDate || null),
        purchaseOrderNumber: asset.purchaseOrderNumber || "",
        invoiceNumber: asset.invoiceNumber || "",
        warrantyExpiresAt: formatDate(asset.warrantyExpiresAt || null),
        salvageValue: asset.salvageValue?.toString() || "0",
        depreciationMethod: asset.depreciationMethod || "straight_line",
        usefulLifeYears: asset.usefulLifeYears?.toString() || "",
        ipAddress: asset.ipAddress || "",
        macAddress: asset.macAddress || "",
        operatingSystem: asset.operatingSystem || "",
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

      console.log("Updating asset data:", submitData);
      await updateAssetMutation.mutateAsync({
        id: asset.id,
        data: submitData,
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
            {/* Basic Information */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("basicInformation")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.name")} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterAssetName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.brand")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterBrandName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.model")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterModel")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.serialNumber")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterSerialNumber")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.barcode")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterBarcode")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.status")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("selectPlaceholders.selectStatus")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">
                            {t("status.active")}
                          </SelectItem>
                          <SelectItem value="inactive">
                            {t("status.inactive")}
                          </SelectItem>
                          <SelectItem value="maintenance">
                            {t("status.maintenance")}
                          </SelectItem>
                          <SelectItem value="disposed">
                            {t("status.disposed")}
                          </SelectItem>
                          <SelectItem value="stolen">
                            {t("status.stolen")}
                          </SelectItem>
                          <SelectItem value="lost">
                            {t("status.lost")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.condition")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "selectPlaceholders.selectCondition"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">
                            {t("conditions.excellent")}
                          </SelectItem>
                          <SelectItem value="good">
                            {t("conditions.good")}
                          </SelectItem>
                          <SelectItem value="fair">
                            {t("conditions.fair")}
                          </SelectItem>
                          <SelectItem value="poor">
                            {t("conditions.poor")}
                          </SelectItem>
                          <SelectItem value="damaged">
                            {t("conditions.damaged")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="criticality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.criticality")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "selectPlaceholders.selectCriticality"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="critical">
                            {t("criticality.critical")}
                          </SelectItem>
                          <SelectItem value="high">
                            {t("criticality.high")}
                          </SelectItem>
                          <SelectItem value="medium">
                            {t("criticality.medium")}
                          </SelectItem>
                          <SelectItem value="low">
                            {t("criticality.low")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("placeholders.enterDescription")}
                          className="mt-2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Financial Information */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("financialInformation")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="purchaseCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.purchaseCost")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("placeholders.enterPurchaseCost")}
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.purchaseDate")}</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseOrderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.purchaseOrderNumber")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "placeholders.enterPurchaseOrderNumber"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.invoiceNumber")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterInvoiceNumber")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warrantyExpiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.warrantyExpires")}</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salvageValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.salvageValue")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("placeholders.enterSalvageValue")}
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Depreciation */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("depreciation")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="depreciationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.depreciationMethod")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                "selectPlaceholders.selectDepreciationMethod"
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="straight_line">
                            Straight Line
                          </SelectItem>
                          <SelectItem value="declining_balance">
                            Declining Balance
                          </SelectItem>
                          <SelectItem value="units_of_production">
                            Units of Production
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usefulLifeYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.usefulLifeYears")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          min="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* IT Asset Information */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("itAssetInformation")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="ipAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.ipAddress")}</FormLabel>
                      <FormControl>
                        <Input placeholder="192.168.1.100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="macAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.macAddress")}</FormLabel>
                      <FormControl>
                        <Input placeholder="00:1B:44:11:3A:B7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingSystem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.operatingSystem")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Windows 11 Pro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="securityClassification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("fields.securityClassification")}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select classification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="confidential">
                            Confidential
                          </SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Environmental Information */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("environmentalInformation")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="energyRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.energyRating")}</FormLabel>
                      <FormControl>
                        <Input placeholder="A++" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carbonFootprint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("fields.carbonFootprint")} (kg CO2)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recyclable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("fields.recyclable")}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Additional Notes */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("fields.additionalNotes")}
              </h3>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t("placeholders.enterAnyAdditionalNotes")}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

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
