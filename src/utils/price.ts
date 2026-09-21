/**
 * Helpers for turning rendered price strings into numbers we can actually assert on.
 *
 * The point of this module: asserting that three products are *visible* after sorting by
 * price proves nothing, because visibility is true in any order. To test sorting you have to
 * read the prices off the page and check their order.
 */

/**
 * Pull every currency amount out of a rendered string.
 *
 * WooCommerce renders a discounted product as the original and the sale price together --
 * "₹450.00 ₹400.00" -- so a single card can yield more than one number.
 */
export function parsePrices(text: string): number[] {
  const matches = text.match(/[\d,]+\.\d{2}/g) ?? [];
  return matches.map((m) => Number(m.replace(/,/g, '')));
}

/**
 * The price a customer actually pays. For a discounted product WooCommerce prints the
 * struck-through original first and the sale price last, so the effective price is the last
 * amount in the string.
 */
export function effectivePrice(text: string): number {
  const prices = parsePrices(text);
  if (prices.length === 0) {
    throw new Error(`No price found in ${JSON.stringify(text)}`);
  }
  return prices[prices.length - 1];
}

export function isAscending(values: number[]): boolean {
  return values.every((value, i) => i === 0 || values[i - 1] <= value);
}

export function isDescending(values: number[]): boolean {
  return values.every((value, i) => i === 0 || values[i - 1] >= value);
}
