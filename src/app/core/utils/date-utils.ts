// yyyy-MM-dd in local time, used as min for the date inputs
export function todayString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// 0 = lands the same day, 1 = next day
export function arrivalDayOffset(departureTime: string, arrivalTime: string): number {
  const toUtcDay = (value: string) => {
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtcDay(arrivalTime) - toUtcDay(departureTime)) / 86_400_000);
}
