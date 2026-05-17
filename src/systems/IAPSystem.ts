/**
 * IAP System
 * 
 * Simulated in-app purchases for gems.
 * This is a UI-only implementation - real IAP integration requires
 * platform plugins (Capacitor/Cordova).
 */

import { EconomySystem, IAP_BUNDLES } from './EconomySystem';

export interface IAPCallback {
  onSuccess: (gems: number) => void;
  onFailure: (error: string) => void;
}

export interface IAPResult {
  success: boolean;
  gems: number;
  bundleId: string;
}

export class IAPSystem {
  private economy: EconomySystem;
  
  // Callback for purchase completion
  private pendingPurchase: {
    bundle: typeof IAP_BUNDLES[0];
    callback: IAPCallback;
  } | null = null;

  constructor(economy: EconomySystem) {
    this.economy = economy;
  }

  /**
   * Get available IAP bundles.
   */
  getBundles() {
    return IAP_BUNDLES;
  }

  /**
   * Initiate a purchase. Shows confirmation, then processes.
   * In a real implementation, this would call the platform payment API.
   * 
   * @param bundleId - ID of the bundle to purchase
   * @param callback - Callbacks for success/failure
   */
  async purchase(bundleId: string, callback: IAPCallback): Promise<void> {
    const bundle = IAP_BUNDLES.find(b => b.id === bundleId);
    if (!bundle) {
      callback.onFailure('Invalid bundle');
      return;
    }

    this.pendingPurchase = { bundle, callback };

    // Simulate payment processing
    // In a real app, this would call:
    //   const { result } = await Plugins.InAppPurchase.purchase({ id: bundleId });
    //   if (result.status === 'approved') { ... }
    
    console.log(`[IAP Stub] Processing purchase: ${bundle.displayName} for ${bundle.price}`);
    console.log('[IAP Stub] To enable real IAP, integrate @capacitor/purchases or cordova-plugin-inapppurchase');
    
    // Simulate successful purchase after brief delay
    setTimeout(() => {
      this.processPurchase();
    }, 100);
  }

  /**
   * Confirm purchase after user confirmation.
   * Called by the purchase confirmation UI.
   */
  confirmPurchase(): void {
    if (!this.pendingPurchase) return;
    this.processPurchase();
  }

  /**
   * Cancel pending purchase.
   */
  cancelPurchase(): void {
    this.pendingPurchase = null;
  }

  /**
   * Process the actual purchase - grant gems.
   */
  private processPurchase(): void {
    if (!this.pendingPurchase) return;

    const { bundle, callback } = this.pendingPurchase;
    
    // Grant gems
    this.economy.addGems(bundle.gems);
    this.economy.save();

    console.log(`[IAP] Purchase successful: ${bundle.displayName}, added ${bundle.gems} gems`);
    
    callback.onSuccess(bundle.gems);
    this.pendingPurchase = null;
  }

  /**
   * Check if a purchase is pending.
   */
  hasPendingPurchase(): boolean {
    return this.pendingPurchase !== null;
  }

  /**
   * Get pending purchase bundle name.
   */
  getPendingBundleName(): string | null {
    return this.pendingPurchase?.bundle.displayName ?? null;
  }
}

/**
 * Template for real IAP integration when wrapping with Capacitor/Cordova:
 * 
 * ```typescript
 * import { Plugins } from '@capacitor/core';
 * 
 * async function processPurchase(bundleId: string): Promise<boolean> {
 *   try {
 *     const result = await Plugins.InAppPurchase.purchase({ id: bundleId });
 *     if (result.status === 'approved') {
 *       // Grant gems based on bundleId
 *       return true;
 *     }
 *     return false;
 *   } catch (error) {
 *     console.error('Purchase failed:', error);
 *     return false;
 *   }
 * }
 * ```
 */