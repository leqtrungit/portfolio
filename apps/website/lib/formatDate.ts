const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(date: string): string {
  const [year, month] = date.split("-");
  if (!month) return year;
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatPeriod(startDate: string, endDate?: string): string {
  return `${formatDate(startDate)} — ${endDate ? formatDate(endDate) : "Present"}`;
}
