export const EXCHANGE_RATE = 2.71;

/**
 * Converts GEL amount to USD
 * @param {number} gelAmount 
 * @returns {number}
 */
export const convertGelToUsd = (gelAmount) => {
  if (!gelAmount || isNaN(gelAmount)) return 0;
  return Math.round(gelAmount / EXCHANGE_RATE);
};

/**
 * Formats price with lari symbol: ₾ 450
 * Standard display format for all pages.
 * @param {number} gelAmount 
 * @returns {string}
 */
export const formatPrice = (gelAmount) => {
  if (gelAmount === null || gelAmount === undefined) return '';
  return `₾${Number(gelAmount).toLocaleString()}`;
};

/**
 * Formats price in detailed format: ₾450 (~$166)
 * Used for detail pages and breakdowns.
 * @param {number} gelAmount 
 * @returns {string}
 */
export const formatPriceDetail = (gelAmount) => {
  if (gelAmount === null || gelAmount === undefined) return '';
  const usd = convertGelToUsd(gelAmount);
  return `₾${Number(gelAmount).toLocaleString()} (~$${usd})`;
};

/**
 * Returns formatted price components for custom styling
 * @param {number} gelAmount 
 * @returns {{gel: string, usd: string}}
 */
export const getPriceDetails = (gelAmount) => {
  if (gelAmount === null || gelAmount === undefined) return { gel: '0', usd: '0' };
  return {
    gel: Number(gelAmount).toLocaleString(),
    usd: convertGelToUsd(gelAmount).toString()
  };
};