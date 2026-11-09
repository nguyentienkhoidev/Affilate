import { copyToClipboard } from '@/lib/utils/clipboard';
import { ROUTES } from '@/constants/routes';

export interface TriggerCouponOptions {
  /** Optional promo / coupon code to auto-copy */
  code?: string;
  /** Merchant store slug used for /go/[slug] redirect */
  storeSlug: string;
  /** Offer or Deal identifier */
  offerId?: string | number;
  /** Direct or custom affiliate URL if available */
  customUrl?: string;
  /** Callback to open the CouponModal dialog in the current tab */
  onOpenModal?: () => void;
}

/**
 * Executes the industry-standard dual-action affiliate conversion flow:
 * 1. Synchronously opens the merchant store in a new background tab
 *    (secures the affiliate cookie, tracks the click, and bypasses browser popup blockers).
 * 2. Automatically copies the coupon code to the user's clipboard.
 * 3. Opens the CouponModal in the current tab with visual confirmation & guidance.
 */
export function triggerDualActionCoupon({
  code,
  storeSlug,
  offerId,
  customUrl,
  onOpenModal,
}: TriggerCouponOptions) {
  // 1. Calculate the affiliate redirect URL
  const destination =
    customUrl ||
    (ROUTES.PUBLIC.GO_AFFILIATE(storeSlug) + (offerId ? `?offer=${offerId}` : ''));

  // 2. Open merchant partner site in a new tab immediately on user click gesture
  if (typeof window !== 'undefined') {
    try {
      const newWindow = window.open(destination, '_blank', 'noopener,noreferrer');
      // If the browser allows, keep focus or allow smooth tab transition
      if (newWindow) {
        newWindow.opener = null;
      }
    } catch (error) {
      console.warn('Popup blocked, modal fallback available:', error);
    }
  }

  // 3. Automatically copy the code to clipboard
  if (code) {
    copyToClipboard(code);
  }

  // 4. Open the modal dialog in the current tab
  if (onOpenModal) {
    onOpenModal();
  }
}
