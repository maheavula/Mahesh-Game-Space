/**
 * Format monetary amount in Paise to Indian Rupees (INR ₹)
 * Section 81 requirement: Never use floating point representation for canonical storage
 */
export function formatINR(paise: number, showFreeTag = true): string {
  if (paise === 0 && showFreeTag) {
    return 'Free';
  }
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function truncateText(text: string, maxLen: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '...';
}
