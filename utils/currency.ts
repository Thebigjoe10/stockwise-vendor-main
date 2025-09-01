export const countryToCurrency: Record<string, { code: string; locale: string }> = {
  NG: { code: "NGN", locale: "en-US" }, // Nigeria
  US: { code: "USD", locale: "en-US" }, // USA
  GB: { code: "GBP", locale: "en-GB" }, // UK
  EU: { code: "EUR", locale: "en-IE" }, // Eurozone
  KE: { code: "KES", locale: "en-KE" }, // Kenya
  GH: { code: "GHS", locale: "en-GH" }, // Ghana
  PL: { code: "PLN", locale: "pl-PL" }, // Poland
};



export function fmtMoney(
  amount: number,
  country?: string,
  withCents = false
): string {
  const region = country ?? "NG"; // ✅ Default to Nigeria

  switch (region) {
    case "NG":
      return "₦" + amount.toLocaleString("en-US", {
        minimumFractionDigits: withCents ? 2 : 0,
        maximumFractionDigits: withCents ? 2 : 0,
      });
    case "GH":
      return "₵" + amount.toLocaleString("en-US", {
        minimumFractionDigits: withCents ? 2 : 0,
        maximumFractionDigits: withCents ? 2 : 0,
      });
    case "KE":
      return "KSh " + amount.toLocaleString("en-US", {
        minimumFractionDigits: withCents ? 2 : 0,
        maximumFractionDigits: withCents ? 2 : 0,
      });
    case "PL":
      return amount.toLocaleString("pl-PL", {
        style: "currency",
        currency: "PLN",
        minimumFractionDigits: withCents ? 2 : 0,
        maximumFractionDigits: withCents ? 2 : 0,
      });
  }

  // ✅ fallback (still works if you later add more countries)
  const currency = countryToCurrency[region];
  if (!currency) return "₦" + amount.toLocaleString("en-US"); // fallback to Naira

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  }).format(amount);
}


