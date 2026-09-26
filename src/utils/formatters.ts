export function formatCurrencyBRL(value: number): string {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateBR(dateString?: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

export function isOverdue(dateString?: string): boolean {
  if (!dateString) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString + 'T00:00:00');
    return target < today;
  } catch {
    return false;
  }
}
