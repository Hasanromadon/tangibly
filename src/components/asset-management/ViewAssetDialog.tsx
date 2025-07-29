"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  MapPin,
  DollarSign,
  Monitor,
  Leaf,
  FileText,
  QrCode,
  TrendingDown,
  Wrench,
  Move,
} from "lucide-react";
import { useAssetTranslations } from "@/hooks/useTranslations";
import { AssetEntity as Asset } from "@/types";
import { formatCurrency, formatDate, dateFormatters } from "@/lib/formatters";
import {
  getAssetStatusBadgeVariant,
  getAssetConditionBadgeVariant,
} from "@/lib/badge-variants";

interface ViewAssetDialogProps {
  open: boolean;
  onClose: () => void;
  asset?: Asset;
}

export default function ViewAssetDialog({
  open,
  onClose,
  asset,
}: ViewAssetDialogProps) {
  const t = useAssetTranslations();

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {asset.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Status and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getAssetStatusBadgeVariant(asset.status || "")}>
                {t(`status.${asset.status}`) || asset.status}
              </Badge>
              {asset.condition && (
                <Badge variant={getAssetConditionBadgeVariant(asset.condition)}>
                  {t(`conditions.${asset.condition}`) || asset.condition}
                </Badge>
              )}
              {asset.criticality && (
                <Badge variant="outline">
                  {t(`criticality.${asset.criticality}`) || asset.criticality}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <QrCode className="mr-2 h-4 w-4" />
                {t("qrCode")}
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                {t("cancel")}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
              <TabsTrigger value="financial">{t("financial")}</TabsTrigger>
              <TabsTrigger value="technical">{t("technical")}</TabsTrigger>
              <TabsTrigger value="maintenance">{t("maintenance")}</TabsTrigger>
              <TabsTrigger value="history">{t("history")}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t("basicInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.name")}
                        </p>
                        <p className="font-medium">{asset.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.brand")}
                        </p>
                        <p>{asset.brand || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.model")}
                        </p>
                        <p>{asset.model || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.serialNumber")}
                        </p>
                        <p className="font-mono text-sm">
                          {asset.serialNumber || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.barcode")}
                        </p>
                        <p className="font-mono text-sm">
                          {asset.barcode || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("table.category")}
                        </p>
                        <p>{asset.categoryId || "-"}</p>
                      </div>
                    </div>
                    {asset.description && (
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.description")}
                        </p>
                        <p className="text-sm">{asset.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Location & Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t("locationAndAssignment")}
                    </CardTitle>
                  </CardHeader>
                  {/* <CardContent className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        {t("table.location")}
                      </p>
                      <p>{asset.location?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        {t("table.assignee")}
                      </p>
                      <p>
                        {asset.assignee?.firstName && asset.assignee?.lastName
                          ? `${asset.assignee.firstName} ${asset.assignee.lastName}`
                          : t("unassigned")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        {t("fields.assignedDate")}
                      </p>
                      <p>-</p>
                    </div>
                  </CardContent> */}
                </Card>
              </div>

              {/* Environmental Information */}
              {(asset.energyRating ||
                asset.carbonFootprint ||
                asset.recyclable !== undefined) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-4 w-4" />
                      {t("environmentalInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.energyRating")}
                        </p>
                        <p>{asset.energyRating || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.carbonFootprint")}
                        </p>
                        <p>{asset.carbonFootprint || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.recyclable")}
                        </p>
                        <p>
                          {asset.recyclable !== undefined
                            ? asset.recyclable
                              ? t("yes")
                              : t("no")
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {asset.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t("additionalNotes")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{asset.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t("purchaseInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.purchaseCost")}
                        </p>
                        <p className="text-lg font-bold">
                          {formatCurrency(asset.purchaseCost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.purchaseDate")}
                        </p>
                        <p>{formatDate(asset.purchaseDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.purchaseOrderNumber")}
                        </p>
                        <p className="font-mono text-sm">
                          {asset.purchaseOrderNumber || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.invoiceNumber")}
                        </p>
                        <p className="font-mono text-sm">
                          {asset.invoiceNumber || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.warrantyExpiresAt")}
                        </p>
                        <p>{formatDate(asset.warrantyExpiresAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      {t("depreciationInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        {t("fields.depreciationMethod")}
                      </p>
                      <p>
                        {asset.depreciationMethod
                          ? t(`depreciationMethods.${asset.depreciationMethod}`)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        {t("fields.usefulLifeYears")}
                      </p>
                      <p>
                        {asset.usefulLifeYears
                          ? `${asset.usefulLifeYears} ${t("years")}`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        {t("fields.salvageValue")}
                      </p>
                      <p>{formatCurrency(asset.salvageValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        {t("currentValue")}
                      </p>
                      <p className="text-lg font-bold">
                        {formatCurrency(asset.bookValue)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-6">
              {/* IT Information */}
              {(asset.ipAddress ||
                asset.macAddress ||
                asset.operatingSystem ||
                asset.securityClassification) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      {t("itAssetInformation")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.ipAddress")}
                        </p>
                        <p className="font-mono">{asset.ipAddress || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.macAddress")}
                        </p>
                        <p className="font-mono">{asset.macAddress || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.operatingSystem")}
                        </p>
                        <p>{asset.operatingSystem || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {t("fields.securityClassification")}
                        </p>
                        <p>
                          {asset.securityClassification
                            ? t(
                                `securityClassifications.${asset.securityClassification}`
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Software Licenses */}
              {asset.softwareLicenses && asset.softwareLicenses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("softwareLicenses")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {asset.softwareLicenses.map((license, index) => (
                        <div
                          key={index}
                          className="rounded-lg border p-3 text-sm"
                        >
                          {license}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hazardous Materials */}
              {asset.hazardousMaterials &&
                asset.hazardousMaterials.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        {t("hazardousMaterials")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {asset.hazardousMaterials.map((material, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm"
                          >
                            {material}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    {t("maintenanceSchedule")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("noMaintenanceScheduled")}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Move className="h-4 w-4" />
                    {t("assetHistory")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{t("assetCreated")}</p>
                        <p className="text-muted-foreground text-sm">
                          {dateFormatters.withTime(asset.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline">{t("created")}</Badge>
                    </div>
                    {asset.updatedAt && asset.updatedAt !== asset.createdAt && (
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{t("assetUpdated")}</p>
                          <p className="text-muted-foreground text-sm">
                            {dateFormatters.withTime(asset.updatedAt)}
                          </p>
                        </div>
                        <Badge variant="outline">{t("updated")}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
