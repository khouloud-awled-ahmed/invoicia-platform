/** Devise Tunisie : TND avec 3 décimales (millimes) */

export const CURRENCY_TND = 'TND';
export const DEFAULT_TIMBRE_FISCAL = 1; // 1.000 TND

/** Formate un montant en TND avec 3 décimales (ex: 10,500 TND) */
export function formatTND(amount: number): string {
  return `${Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${CURRENCY_TND}`;
}

/** Arrondit à 3 décimales pour stockage/affichage cohérent */
export function roundMillimes(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Taux TVA Tunisie courants */
export const TVA_RATES_TN = [19, 13, 7] as const;
