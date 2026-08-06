export const MONTH_NAMES: string[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  const monthName = MONTH_NAMES[parseInt(month, 10) - 1];
  return `${parseInt(day, 10)} de ${monthName}`;
}

export function formatShortDate(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function getMonthName(date: Date): string {
  return MONTH_NAMES[date.getMonth()];
}

export function getMonthYearLabel(date: Date): string {
  return `${getMonthName(date)} ${date.getFullYear()}`;
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  const startMonthStr = String(startDate.getMonth() + 1).padStart(2, '0');
  const startDayStr = String(startDate.getDate()).padStart(2, '0');
  
  const endMonthStr = String(endDate.getMonth() + 1).padStart(2, '0');
  const endDayStr = String(endDate.getDate()).padStart(2, '0');

  return {
    start: `${startDate.getFullYear()}-${startMonthStr}-${startDayStr}`,
    end: `${endDate.getFullYear()}-${endMonthStr}-${endDayStr}`
  };
}

export function getTodayString(): string {
  const today = new Date();
  const monthStr = String(today.getMonth() + 1).padStart(2, '0');
  const dayStr = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${monthStr}-${dayStr}`;
}
