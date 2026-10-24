export function formatDiscount(value: string | number): string {
  if (!value) return 'Special Offer';
  const str = String(value).trim();
  if (str.toLowerCase().includes('off') || str.toLowerCase().includes('free')) {
    return str;
  }
  return `${str}% Off`;
}

export function formatNumber(value: number | string): string {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatCurrentMonthYear(): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}
