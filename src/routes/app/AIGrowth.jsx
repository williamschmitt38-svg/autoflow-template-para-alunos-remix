import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEmpresa } from '@/lib/empresa';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import Badge from '@/components/common/Badge';
import Modal from '@/components/app/Modal';
import { Textarea } from '@/components/app/FormField';
import { fmtCurrency, fmtDate } from '@/lib/format';
import { Sparkles, Users, FileText, Car, Wrench, AlertTriangle, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

const PRIORIDADE_COR = { alta: 'red', media: 'amber', baixa: 'gray' };

export default function AIGrowth() {
  useDocumentTitle('AI Growth');
  const { empresaId, empresa } = useEmpresa();
  const [campaign, setCampaign] = useState(null);
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['ai-growth', empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const now = new Date();
      const d60 = new Date(now.getTime() - 60 * 86400000).toISOString();
      const d7 = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
      const d30 = new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10);
      const dToday = now.toISOString().slice(0, 10);

      const [inativos, orcs, revisoes, osParadas] = await Promise.all([
        supabase.from('cliente').select('id,nome,telefone,updated_at').eq('empresa_id', empresaId).lt('updated_at', d60).eq('status', 'ativo').limit(20),
        supabase.from('orcamento').select('*').eq('empresa_id', empresaId).eq('status', 'pendente').lte('data', d7).limit(20),
        supabase.from('veiculo').select('*').eq('empresa_id', empresaId).gte('proxima_revisao', dToday).lte('proxima_revisao', d30).limit(20),
        supabase.from('ordem_servico').select('*').eq('empresa_id', empresaId).in('status', ['em_andamento', 'aguardando_peca']).lte('data_abertura', d7).limit(20),
      ]);
      return {
        inativos: inativos.data || [],
        orcs: orcs.data || [],
        revisoes: revisoes.data || [],
        osParadas: osParadas.data || [],
      };
    },
  });

  const openCampaign = (item, suggestedMsg) => {
    setCampaign(item);
    setMessage(suggestedMsg);
  };

  const send = async () => {let phone=campaign?.telefone;if(!phone&&campaign?.cliente_id){const{data}=await supabase.from('cliente').select('telefone').eq('id',campaign.cliente_id).maybeSingle();phone=data?.telefone;}phone=String(phone||'').replace(/\D/g,'');if(phone.length<10){await navigator.clipboard.writeText(message);toast.info('Mensagem copiada. Cadastre um telefone com DDI para abrir o WhatsApp.');return;}if(phone.length<=11)phone='55'+phone;window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');};

  if (isLoading) return <div className="text-[13px]">Analisando dados…</div>;

  const oficina = empresa?.nome || 'sua oficina';

  return (
    <div>
      <PageHeader title="AI Growth" subtitle="Sugestões por regras para revisar clientes, revisões e orçamentos"
        actions={<Badge tone="amber">Beta</Badge>} />

      <div className="grid lg:grid-cols-2 gap-4">
        <InsightCard
          icon={Users} prioridade="alta" titulo="Clientes inativos há +60 dias"
          count={data?.inativos.length || 0}
          desc="Estes clientes não voltam há mais de 60 dias. Prepare uma mensagem de retorno com oferta especial."
          emptyMsg="Nenhum cliente inativo no momento. 🎉"
          items={data?.inativos.map((c) => ({
            id: c.id, title: c.nome, subtitle: `Última atividade: ${fmtDate(c.updated_at)}`,
            cta: 'Preparar WhatsApp',
            onAction: () => openCampaign(c, `Olá ${c.nome}! Como está seu veículo? A equipe da ${oficina} está à disposição para agendar uma revisão.`),
          }))} />

        <InsightCard
          icon={FileText} prioridade="alta" titulo="Orçamentos sem retorno há +7 dias"
          count={data?.orcs.length || 0}
          desc="Orçamentos antigos sem aprovação. Faça follow-up para entender a objeção."
          emptyMsg="Todos os orçamentos estão em dia."
          items={data?.orcs.map((o) => ({
            id: o.id, title: `${o.numero || 'Orçamento'} — ${o.cliente_nome}`,
            subtitle: `${o.veiculo_desc || ''} • ${fmtCurrency(o.total)}`,
            cta: 'Enviar lembrete',
            onAction: () => openCampaign(o, `Olá ${o.cliente_nome}, tudo bem? Estamos à disposição para tirar dúvidas sobre o orçamento ${o.numero || ''} (${fmtCurrency(o.total)}). Quer marcar o serviço?`),
          }))} />

        <InsightCard
          icon={Car} prioridade="media" titulo="Revisões nos próximos 30 dias"
          count={data?.revisoes.length || 0}
          desc="Antecipe-se: agende esses veículos antes do prazo para garantir a OS."
          emptyMsg="Nenhuma revisão programada."
          items={data?.revisoes.map((v) => ({
            id: v.id, title: `${v.marca} ${v.modelo} — ${v.placa}`,
            subtitle: `${v.cliente_nome} • Revisão em ${fmtDate(v.proxima_revisao)}`,
            cta: 'Preparar lembrete',
            onAction: () => openCampaign(v, `Olá ${v.cliente_nome}! A revisão do seu ${v.marca} ${v.modelo} está chegando (${fmtDate(v.proxima_revisao)}). Vamos agendar?`),
          }))} />

        <InsightCard
          icon={Wrench} prioridade="alta" titulo="OS paradas há +7 dias"
          count={data?.osParadas.length || 0}
          desc="OS em andamento ou aguardando peça por muito tempo. Acompanhe o técnico e atualize o cliente."
          emptyMsg="Nenhuma OS travada."
          items={data?.osParadas.map((os) => ({
            id: os.id, title: `${os.numero || 'OS'} — ${os.cliente_nome}`,
            subtitle: `${os.status.replace('_', ' ')} • aberta em ${fmtDate(os.data_abertura)}`,
            cta: 'Preparar contato',
            onAction: () => openCampaign(os, `Olá ${os.cliente_nome}, passando para atualizar sobre o serviço (${os.numero}). Vamos conferir o andamento com a equipe e retornar com uma atualização.`),
          }))} />

        <InsightCard
          icon={AlertTriangle} prioridade="media" titulo="Próximas ações sugeridas"
          count={(data?.inativos.length || 0) + (data?.orcs.length || 0)}
          desc="Resumo geral de oportunidades para esta semana."
          emptyMsg=""
          items={[
            { id: 's1', title: 'Preparar mensagem de retorno', subtitle: `${data?.inativos.length || 0} clientes inativos elegíveis`, cta: 'Ver lista', onAction: () => toast.info('Acesse o card "Clientes inativos" acima.') },
            { id: 's2', title: 'Follow-up de orçamentos', subtitle: `${data?.orcs.length || 0} orçamentos pendentes`, cta: 'Ver lista', onAction: () => toast.info('Acesse o card "Orçamentos sem retorno".') },
          ]} />

        <div className="rounded-lg border p-5 flex flex-col items-center justify-center text-center" style={{ backgroundColor: 'var(--brand-subtle)', borderColor: 'var(--brand-line)' }}>
          <Sparkles className="w-8 h-8 mb-2" style={{ color: 'var(--brand)' }} />
          <div className="font-bold text-[14px]" style={{ color: 'var(--brand)' }}>AI Growth Engine</div>
          <div className="text-[12px] mt-1" style={{ color: 'var(--ink-2)' }}>
            As sugestões seguem regras de datas e status, sem IA generativa. Revise o texto e envie manualmente pelo WhatsApp.
          </div>
        </div>
      </div>

      <Modal open={!!campaign} onClose={() => setCampaign(null)} title="Preparar mensagem"
        footer={
          <>
            <button onClick={() => setCampaign(null)} className="px-4 py-2 rounded text-[13px] border" style={{ borderColor: 'var(--line)' }}>Cancelar</button>
            <button onClick={send} className="px-4 py-2 rounded text-[13px] font-bold text-white flex items-center gap-2" style={{ backgroundColor: 'var(--brand)' }}>
              <Send className="w-3.5 h-3.5" /> Abrir WhatsApp
            </button>
          </>
        }>
        <div className="flex items-center gap-2 mb-3 text-[13px]" style={{ color: 'var(--ink-2)' }}>
          <MessageCircle className="w-4 h-4" /> Mensagem sugerida para revisão
        </div>
        <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
        <div className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>O botão abre o WhatsApp. Você revisa e confirma o envio.</div>
      </Modal>
    </div>
  );
}

function InsightCard({ icon: Icon, prioridade, titulo, count, desc, items = [], emptyMsg }) {
  const [expanded, setExpanded] = useState(false);
  const list = items || [];
  return (
    <div className="rounded-lg border p-5" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line-soft)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--brand-subtle)' }}>
            <Icon className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          </div>
          <div>
            <div className="font-bold text-[14px]" style={{ color: 'var(--ink)' }}>{titulo}</div>
            <div className="text-[12px]" style={{ color: 'var(--ink-muted)' }}>{count} {count === 1 ? 'item' : 'itens'}</div>
          </div>
        </div>
        <Badge tone={PRIORIDADE_COR[prioridade]}>{prioridade}</Badge>
      </div>
      <div className="text-[12px] mb-3" style={{ color: 'var(--ink-2)' }}>{desc}</div>
      {list.length === 0 ? (
        <div className="text-[12px] italic" style={{ color: 'var(--ink-muted)' }}>{emptyMsg}</div>
      ) : (
        <>
          <div className="space-y-2">
            {list.slice(0, expanded ? list.length : 3).map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-2 p-2.5 rounded" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold truncate" style={{ color: 'var(--ink)' }}>{it.title}</div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--ink-muted)' }}>{it.subtitle}</div>
                </div>
                <button onClick={it.onAction} className="text-[11px] font-bold px-2.5 py-1.5 rounded text-white whitespace-nowrap" style={{ backgroundColor: 'var(--brand)' }}>{it.cta}</button>
              </div>
            ))}
          </div>
          {list.length > 3 && (
            <button onClick={() => setExpanded((e) => !e)} className="text-[11px] font-semibold mt-3" style={{ color: 'var(--brand)' }}>
              {expanded ? 'Mostrar menos' : `Ver todos (${list.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

