"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useAssetTranslations } from "@/hooks/useTranslations";
import { AssetEntity as Asset } from "@/types";

interface DeleteAssetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  asset: Asset | null;
  isDeleting?: boolean;
}

export default function DeleteAssetDialog({
  open,
  onClose,
  onConfirm,
  asset,
  isDeleting = false,
}: DeleteAssetDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useAssetTranslations();

  // Reset confirmation text and submitting state when dialog closes
  useEffect(() => {
    if (!open) {
      setConfirmationText("");
      setIsSubmitting(false);
    }
  }, [open]);

  if (!asset) return null;

  const expectedText = "DELETE";
  const canDelete = confirmationText === expectedText;
  const isDisabled = !canDelete || isDeleting || isSubmitting;

  const handleConfirm = () => {
    console.log("DeleteAssetDialog handleConfirm called", {
      canDelete,
      isDeleting,
      isSubmitting,
      timestamp: new Date().toISOString(),
    });

    if (isDisabled) {
      console.log("DeleteAssetDialog handleConfirm blocked - button disabled");
      return;
    }

    console.log("Calling onConfirm from DeleteAssetDialog");
    setIsSubmitting(true);
    onConfirm();
  };

  const handleClose = () => {
    // Only clear confirmation text when dialog is explicitly closed
    setConfirmationText("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t("deleteAssetTitle")}
          </DialogTitle>
          <DialogDescription>{t("deleteAssetDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Asset Information */}
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 font-medium">
              <Trash2 className="h-4 w-4" />
              {asset.name}
            </div>
            <div className="text-muted-foreground text-sm">
              <p>
                <span className="font-medium">{t("fields.serialNumber")}:</span>{" "}
                {asset.serialNumber || "-"}
              </p>
              <p>
                <span className="font-medium">{t("table.category")}:</span>{" "}
                {asset.categoryId || "-"}
              </p>
              <p>
                <span className="font-medium">{t("table.location")}:</span>{" "}
                {asset.locationId || "-"}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-destructive/10 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-destructive mt-0.5 h-4 w-4" />
              <div className="text-sm">
                <p className="text-destructive font-medium">
                  {t("deleteWarningTitle")}
                </p>
                <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
                  <li>{t("deleteWarning1")}</li>
                  <li>{t("deleteWarning2")}</li>
                  <li>{t("deleteWarning3")}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              {t("deleteConfirmationLabel")}{" "}
              <code className="text-destructive font-mono">{expectedText}</code>
              :
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={e => setConfirmationText(e.target.value)}
              placeholder={expectedText}
              className="font-mono"
              disabled={isDeleting || isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting || isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDisabled}
            className="min-w-[100px]"
          >
            {isDeleting || isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {t("deleting")}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("deleteAsset")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
