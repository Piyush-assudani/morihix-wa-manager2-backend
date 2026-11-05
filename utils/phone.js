/**
 * Phone number sanitization and normalization utilities.
 * Enforces:
 * - With 91: exactly 12 digits (91 + 10 digits). If > 12, takes first 12 digits.
 * - Without 91: exactly 10 digits. If > 10, takes first 10 digits and prepends 91 -> 12 digits.
 * - Strips any leading 0s or floating point artifacts (.0).
 */

const cleanPhoneNumber = (raw) => {
  if (raw === undefined || raw === null || raw === "") return "";
  let str = String(raw).trim();

  // If scientific notation e.g. "9.41388E+09" or "9.19414E+11"
  if (/[eE][+-]?\d+/.test(str)) {
    const num = Number(str);
    if (!isNaN(num)) {
      try {
        str = BigInt(Math.floor(num)).toString();
      } catch (e) {
        str = num.toLocaleString("fullwide", { useGrouping: false });
      }
    }
  }

  // If it has a decimal point (e.g. float from Excel/CSV/Python like "9413879444.0")
  if (str.includes(".")) {
    str = str.split(".")[0];
  }

  // Remove all non-digits
  let digits = str.replace(/\D/g, "");

  // If number starts with 0 (e.g. 09413879444) -> strip leading 0s
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  // Enforce rule:
  // 1. If starts with 91: exactly 12 digits
  if (digits.startsWith("91")) {
    digits = digits.slice(0, 12);
  } else if (digits.length >= 10) {
    // 2. If without 91: exactly 10 digits, prepended with 91 -> 12 digits
    digits = "91" + digits.slice(0, 10);
  }

  return digits;
};

module.exports = {
  cleanPhoneNumber,
};
