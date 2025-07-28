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
import { useCreateAssetWithValidation } from "@/hooks/useAssets";
import { assetFormSchema } from "@/schemas/asset-schemas";
import { transformFormToApiData } from "@/types/asset-types";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import {
  useAssetTranslations,
  useCommonTranslations,
} from "@/hooks/useTranslations";
import { toast } from "sonner";

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
  const commonT = useCommonTranslations();

  const form = useForm({
    resolver: zodResolver(assetFormSchema),
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
      purchaseCost: "",
      purchaseDate: "",
      purchaseOrderNumber: "",
      invoiceNumber: "",
      warrantyExpiresAt: "",
      salvageValue: "0",
      depreciationMethod: "straight_line",
      usefulLifeYears: "",
      ipAddress: "",
      macAddress: "",
      operatingSystem: "",
      securityClassification: "public",
      energyRating: "",
      carbonFootprint: "",
      recyclable: false,
      notes: "",
    },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      const submitData = transformFormToApiData(
        data as Record<string, unknown>
      );

      console.log("Submitting asset data:", submitData);
      await createAssetMutation.createAssetAsync(submitData);

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
                        defaultValue={field.value}
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
                        defaultValue={field.value}
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
                        defaultValue={field.value}
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
                          placeholder={t("placeholders.zero")}
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
                          placeholder={t("placeholders.enterPONumber")}
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
                          placeholder={t("placeholders.zero")}
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
              <h3 className="mb-4 text-lg font-semibold">Depreciation</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="depreciationMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.depreciationMethod")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
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
                          placeholder="0"
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
                        <Input placeholder="00:00:00:00:00:00" {...field} />
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
                        <Input
                          placeholder="Windows 11, Ubuntu 22.04, etc."
                          {...field}
                        />
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
                        defaultValue={field.value}
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
                      <FormLabel>Energy Rating</FormLabel>
                      <FormControl>
                        <Input placeholder="A+, B, C, etc." {...field} />
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
                      <FormLabel>Carbon Footprint (kg CO2)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
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
                        <FormLabel>Recyclable</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">Additional Notes</h3>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes or comments"
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
                  t("createAsset")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
