declare const decimalpoint: string | undefined;

/**
 * Decimal separator of the hosting page: its global variable `decimalpoint` (see index.html), '.' when the page
 * defines none. Read on each call, the page may define it after the library is loaded.
 */
export const decimalPoint = (): string =>
  (typeof decimalpoint === 'string' && decimalpoint !== '') ? decimalpoint : '.';
