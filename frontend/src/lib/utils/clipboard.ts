/**
 * Safe clipboard copy utility with two-tier fallback for TikTok, Facebook, and Instagram In-App WebViews.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Layer 1: Modern asynchronous Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to Layer 2 if permission denied or WebView blocked it
    }
  }

  // Layer 2: Synchronous execCommand('copy') fallback with off-screen textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Prevent scrolling to bottom of screen in iOS
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy text using fallback method: ', err);
    return false;
  }
}
