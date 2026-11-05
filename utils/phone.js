/**
 * Phone number sanitization and normalization utilities.
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

  // 1. If it has a decimal point (e.g. float from Excel/CSV/Python like "9413879444.0" or "919413879444.00")
  if (str.includes(".")) {
    str = str.split(".")[0];
  }

  // 2. Remove all non-digits
  let digits = str.replace(/\D/g, "");

  // 3. Trailing zero artifacts from stripped .0:
  // Case A: 13 digits starting with 91[6-9] and ending in 0 (e.g. 9194138794440 -> 919413879444)
  if (digits.length === 13 && /^91[6-9]\d{9}0$/.test(digits)) {
    digits = digits.slice(0, 12);
  }

  // Case B: 11 digits starting with [6-9] and ending in 0 (e.g. 94138794440 -> 9413879444)
  if (digits.length === 11 && /^[6-9]\d{9}0$/.test(digits)) {
    digits = digits.slice(0, 10);
  }

  // Case C: Standard 11 digits starting with 0 (e.g. STD format 09413879444)
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = "91" + digits.slice(1);
  } else if (digits.length === 10) {
    // Case D: Standard 10 digits -> prepend 91
    digits = "91" + digits;
  }

  return digits;
};

module.exports = {
  cleanPhoneNumber,
};
