/**
 * Converts a number to Nigerian Naira currency format.
 *
 * @param amount - The number to be converted.
 * @param includeCurrency - Whether to include the currency in the output.
 * @returns The converted amount in the desired format.
 */
export const convertNumberToNaira = (
  amount: number,
  includeCurrency = true
) => {
  if (includeCurrency) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-NG', {
      style: 'decimal',
      maximumFractionDigits: 2,
    }).format(amount);
  }
};



export function formatAmount(value: number): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1)?.replace(/\.0$/, "") + "b";
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000)?.toFixed(1).replace(/\.0$/, "") + "m";
  }
  if (value >= 1_000) {
    return (value / 1_000)?.toFixed(1).replace(/\.0$/, "") + "k";
  }
  return value?.toString();
}
