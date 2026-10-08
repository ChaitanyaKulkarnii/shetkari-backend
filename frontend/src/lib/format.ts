export const formatCurrency = (amount: number, locale: string = "en-IN") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string, locale: string = "en-IN") => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const formatRelativeTime = (days: number, locale: string = "en") => {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  return rtf.format(days, "day");
};
