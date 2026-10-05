import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const fmtCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

export const fmtDate = (v, pat = 'dd/MM/yyyy') => {
  if (!v) return '-';
  try { return format(typeof v === 'string' ? parseISO(v) : v, pat, { locale: ptBR }); }
  catch { return '-'; }
};

export const daysUntil = (date) => {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
};

