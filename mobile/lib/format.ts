// Money is stored in integer cents on the backend.
export function formatPrice(cents: number, currency = "USD"): string {
  const value = (cents ?? 0) / 100;
  const symbol = currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${value.toFixed(2)}`;
}
