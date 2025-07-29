/**
 * Asset Management Utilities
 * Functions for asset numbering, work orders, and depreciation calculations
 */
import { ASSET_CONFIG, WORK_ORDER_CONFIG } from "@/constants/business";

/**
 * Asset number generation
 */
export function generateAssetNumber(
  companyCode: string,
  categoryCode: string,
  year?: number
): string {
  const currentYear = year || new Date().getFullYear();
  const randomNum = Math.floor(
    ASSET_CONFIG.NUMBER_GENERATION.MIN_RANDOM +
      Math.random() *
        (ASSET_CONFIG.NUMBER_GENERATION.MAX_RANDOM -
          ASSET_CONFIG.NUMBER_GENERATION.MIN_RANDOM)
  );

  return `${categoryCode}-${currentYear}-${randomNum
    .toString()
    .padStart(ASSET_CONFIG.NUMBER_GENERATION.RANDOM_DIGITS, "0")}`;
}

/**
 * Work order number generation
 */
export function generateWorkOrderNumber(
  companyCode: string,
  year?: number
): string {
  const currentYear = year || new Date().getFullYear();
  const randomNum = Math.floor(
    ASSET_CONFIG.NUMBER_GENERATION.MIN_RANDOM +
      Math.random() *
        (ASSET_CONFIG.NUMBER_GENERATION.MAX_RANDOM -
          ASSET_CONFIG.NUMBER_GENERATION.MIN_RANDOM)
  );

  return `${WORK_ORDER_CONFIG.NUMBER_PREFIX}-${currentYear}-${randomNum
    .toString()
    .padStart(ASSET_CONFIG.NUMBER_GENERATION.RANDOM_DIGITS, "0")}`;
}

/**
 * Depreciation calculation methods
 */
export function calculateDepreciation(
  purchaseCost: number,
  salvageValue: number,
  usefulLifeYears: number,
  method: (typeof ASSET_CONFIG.DEPRECIATION.METHODS)[number],
  unitsProduced?: number,
  totalUnitsExpected?: number
): number {
  switch (method) {
    case "straight_line":
      return (purchaseCost - salvageValue) / usefulLifeYears;

    case "declining_balance":
      const rate =
        ASSET_CONFIG.DEPRECIATION.DECLINING_BALANCE_RATE / usefulLifeYears;
      return purchaseCost * rate;

    case "units_of_production":
      if (!unitsProduced || !totalUnitsExpected || totalUnitsExpected === 0) {
        throw new Error(
          "Units produced and total units expected are required for units of production method"
        );
      }
      return (
        ((purchaseCost - salvageValue) / totalUnitsExpected) * unitsProduced
      );

    default:
      throw new Error(`Unsupported depreciation method: ${method}`);
  }
}

/**
 * Asset status helpers
 */
export function isActiveAsset(status: string): boolean {
  return status === ASSET_CONFIG.STATUS.ACTIVE;
}

export function isAssetInMaintenance(status: string): boolean {
  return status === ASSET_CONFIG.STATUS.MAINTENANCE;
}

export function isDisposedAsset(status: string): boolean {
  return status === ASSET_CONFIG.STATUS.DISPOSED;
}

/**
 * Asset condition helpers
 */
export function getAssetConditionScore(condition: string): number {
  const scores = {
    [ASSET_CONFIG.CONDITION.EXCELLENT]: 100,
    [ASSET_CONFIG.CONDITION.GOOD]: 75,
    [ASSET_CONFIG.CONDITION.FAIR]: 50,
    [ASSET_CONFIG.CONDITION.POOR]: 25,
  };

  return scores[condition as keyof typeof scores] || 0;
}

/**
 * Work order status helpers
 */
export function isWorkOrderPending(status: string): boolean {
  return status === WORK_ORDER_CONFIG.STATUS.PENDING;
}

export function isWorkOrderCompleted(status: string): boolean {
  return status === WORK_ORDER_CONFIG.STATUS.COMPLETED;
}

export function isWorkOrderCancelled(status: string): boolean {
  return status === WORK_ORDER_CONFIG.STATUS.CANCELLED;
}
