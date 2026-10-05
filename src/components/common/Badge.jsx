export default function Badge({ tone = 'gray', children }) {
  const tones = {
    green: ['var(--status-green-bg)', 'var(--status-green-fg)'],
    amber: ['var(--status-amber-bg)', 'var(--status-amber-fg)'],
    red:   ['var(--status-red-bg)',   'var(--status-red-fg)'],
    blue:  ['var(--status-blue-bg)',  'var(--status-blue-fg)'],
    gray:  ['var(--surface-sunken)',  'var(--ink-muted)'],
  };
  const [bg, fg] = tones[tone] || tones.gray;
  return <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide" style={{ backgroundColor: bg, color: fg }}>{children}</span>;
}

export const statusBadge = (s) => {
  const map = {
    ativo: 'green', trial: 'amber', inativo: 'gray',
    aprovado: 'green', pendente: 'amber', recusado: 'red',
    aberta: 'blue', em_andamento: 'amber', aguardando_peca: 'amber', concluida: 'green', cancelada: 'red',
    confirmado: 'green', cancelado: 'red',
    pago: 'green', parcial: 'amber',
    inadimplente: 'red', suspenso: 'red',
    entrada: 'green', saida: 'red',
    alta: 'red', normal: 'gray', baixa: 'gray',
  };
  return map[s] || 'gray';
};

