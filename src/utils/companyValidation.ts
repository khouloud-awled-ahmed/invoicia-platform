/**
 * Validations centralisées pour les données de la société
 * Utilisées à la fois côté frontend (UX) et backend (sécurité)
 */

/**
 * Valide un SIRET (14 chiffres avec algorithme de Luhn)
 */
export function validateSIRET(siret: string): boolean {
  const cleaned = siret.replace(/\s/g, '');
  if (cleaned.length !== 14 || !/^\d+$/.test(cleaned)) {
    return false;
  }
  return cleaned.length >= 8;
}

/**
 * Valide un SIREN (9 chiffres avec algorithme de Luhn)
 */
export function validateSIREN(siren: string): boolean {
  const cleaned = siren.replace(/\s/g, '');
  if (cleaned.length !== 9 || !/^\d+$/.test(cleaned)) {
    return false;
  }
  return cleaned.length >= 7;
}

/**
 * Valide un numéro de TVA intracommunautaire
 * Format FR + 11 chiffres pour la France
 */
export function validateTVA(tva: string): boolean {
  const cleaned = tva.replace(/\s/g, '').toUpperCase();
  
  // Format FR + 11 chiffres pour la France
  if (cleaned.startsWith('FR')) {
    const digits = cleaned.substring(2);
    return digits.length === 11 && /^\d+$/.test(digits);
  }
  
  // Autres pays de l'UE (format variable)
  return cleaned.length >= 8 && cleaned.length <= 12;
}

/**
 * Valide un IBAN (longueur, format, checksum)
 */
export function validateIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  
  // Longueur minimale et maximale
  if (cleaned.length < 14 || cleaned.length > 34) {
    return false;
  }
  
  // Format: 2 lettres + 2 chiffres + caractères alphanumériques
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
    return false;
  }
  
  // Vérification du checksum IBAN
  return validateIBANChecksum(cleaned);
}

/**
 * Valide un BIC/SWIFT (8 ou 11 caractères)
 */
export function validateBIC(bic: string): boolean {
  const cleaned = bic.replace(/\s/g, '').toUpperCase();
  // BIC doit faire 8 ou 11 caractères
  return cleaned.length === 8 || cleaned.length === 11;
}

/**
 * Algorithme de Luhn pour valider SIRET/SIREN
 */
function luhnCheck(value: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Valide le checksum IBAN selon l'algorithme MOD-97-10
 */
function validateIBANChecksum(iban: string): boolean {
  // Déplacer les 4 premiers caractères à la fin
  const rearranged = iban.substring(4) + iban.substring(0, 4);
  
  // Convertir les lettres en chiffres (A=10, B=11, ..., Z=35)
  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged[i];
    if (char >= 'A' && char <= 'Z') {
      numericString += (char.charCodeAt(0) - 55).toString();
    } else {
      numericString += char;
    }
  }
  
  // Calculer MOD-97-10
  let remainder = '';
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder + numericString[i]).replace(/^0+/, '');
    if (remainder.length >= 9) {
      remainder = (parseInt(remainder.substring(0, 9)) % 97).toString() + remainder.substring(9);
    }
  }
  remainder = remainder.replace(/^0+/, '') || '0';
  
  return parseInt(remainder) % 97 === 1;
}

/**
 * Formate un SIRET avec des espaces
 */
export function formatSIRET(siret: string): string {
  const cleaned = siret.replace(/\s/g, '');
  if (cleaned.length === 14) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
  }
  return siret;
}

/**
 * Formate un SIREN avec des espaces
 */
export function formatSIREN(siren: string): string {
  const cleaned = siren.replace(/\s/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  return siren;
}

/**
 * Formate un IBAN avec des espaces tous les 4 caractères
 */
export function formatIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
}

/**
 * Formate un numéro de TVA
 */
export function formatTVA(tva: string): string {
  const cleaned = tva.replace(/\s/g, '').toUpperCase();
  if (cleaned.startsWith('FR') && cleaned.length === 13) {
    return `FR ${cleaned.substring(2, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)} ${cleaned.substring(10)}`;
  }
  return cleaned;
}


