# AutoFlow na sua conta Blink

1. Abra o link do template, entre na sua conta e clique em **Remix**.
2. Cole o prompt abaixo na conversa da sua cópia, substituindo SEU_EMAIL_AQUI.
3. Quando a instalação terminar, abra a prévia e clique em **Entrar ou criar conta**. Use seu email verificado. O login no editor Blink e o login dentro do sistema são separados.
4. No painel Master, crie sua primeira oficina ou vá a `/onboarding`. Depois cadastre clientes, veículos e serviços. Em Configurações, personalize nome, cores, logo e endereço da vitrine.

## Prompt único

> Prepare esta cópia do AutoFlow para meu uso, seguindo BLINK_ALUNOS.md. Meu email de administrador é SEU_EMAIL_AQUI. Use o projeto atual da minha conta e seu banco próprio, sem dados do template original. Configure o backend e as variáveis desta cópia, defina meu email verificado como proprietário e publique a prévia. Preserve as telas, o isolamento entre oficinas e os testes. Não compre planos, não habilite hospedagem paga e não envie mensagens a clientes. Valide health, login e operações de orçamento/OS/financeiro; diga se existe alguma limitação da minha conta antes de tentar consumir créditos extras.

## Instruções técnicas para a Blink

- Código React Router/Vite existente; não substitua por um starter. `npm install`, `npm run typecheck`, `npm test`, `npm run build:backend` e `npm run build` devem passar. Backend minificado em `backend/index.ts` (Hono).
- Use somente ID, publishable key e backend do projeto ATUAL. Configure `VITE_BLINK_PROJECT_ID`, `VITE_BLINK_PUBLISHABLE_KEY`, `VITE_BLINK_BACKEND_URL=https://<últimos 8 caracteres do ID>.backend.blink.new`.
- Configure no backend `OWNER_PROJECT_ID` com o ID ATUAL e `OWNER_EMAIL` com email verificado do dono desta cópia. Não mantenha email ou ID do autor do template. Nunca promova automaticamente o primeiro visitante.
- Deploy do backend: `blink backend deploy ./backend`. O runtime precisa da sua própria `BLINK_PROJECT_ID` e `BLINK_SECRET_KEY`, que a plataforma fornece. Se a chave secret do projeto faltar, provisioná-la pela API oficial do projeto; nunca colocar segredos em `VITE_*`, bundle ou arquivo versionado.
- Se health retornar `Database not found`, executar `blink db query 'SELECT 1 AS health'` no projeto atual para provisionar o banco e tentar health novamente. O bootstrap cria as tabelas/índices/gatilhos em transação; não migrar clientes, veículos, pedidos, usuários ou roles do projeto original.
- Aplicar `scripts/native/security-policy.json`: browser sem SQL direto nem acesso às tabelas do domínio. Todo CRUD passa pelo backend autorizado e escopo de oficina. Manter validação de email verificado, owner vinculado ao projeto, proteções financeiras, referências e transações.
- Salvar fonte completa no editor e uma versão com commit; publicar prévia estática de `dist`. Deploy estático sozinho não torna a fonte remixável. Manter `.gitignore`, excluir configs pessoais e segredos do índice.
- Confirmar `/health` com database connected e `/api/bootstrap` anônimo sem Master/oficina. Login deve abrir a autenticação com o ID desta cópia. Seguir os testes de `tests/domain.test.ts`.
- Verificar ausência de dados de clientes e titulares herdados no banco remixado antes de liberar. Nunca apontar ao backend do autor para fazer uma cópia parecer funcional.

## O que está implementado

Clientes e veículos; orçamentos com itens e conversão atômica em OS; Kanban, checklist e técnico; financeiro manual e recebimento vinculado à OS sem duplicação; relatórios com dados reais; equipe por email verificado; Master; vitrine, catálogo de serviços e solicitações públicas com protocolo, acompanhadas no painel.

Marcar uma OS como paga registra **uma** entrada no financeiro. Alterar novamente não duplica; desfazer pagamento/cancelar OS cancela esse recebimento. Para evitar duplicidade, não lance manualmente o mesmo recebimento. Os itens representam mão de obra/peças; não há controle de estoque, NF-e nem emissão fiscal.

## Limites reais

- Sugestões de crescimento usam regras de datas/status, sem IA generativa. WhatsApp abre uma mensagem para revisão e envio manual. Nenhum envio automático, email de convite ou cobrança recorrente está conectado.
- Vitrine recebe pedidos; data solicitada depende de confirmação da oficina e não reserva capacidade automaticamente. O catálogo e o WhatsApp precisam ser preenchidos pelo proprietário.
- Antes de vender: personalizar dados comerciais, contato, termos de uso e política de privacidade. Os itens do rodapé são avisos de configuração, não páginas legais prontas.
- Planos/preços da landing page são exemplos para personalização, não uma assinatura cobrada pelo sistema. A conta Blink e suas regras de créditos/backend/hospedagem são independentes. Se o plano da conta não suportar backend, a Blink pode exigir upgrade; não há compra automática neste fluxo.
- A versão original foi testada com fixtures sintéticas no backend e sem clientes reais. Um Remix em outra conta ainda não foi testado. O parâmetro de afiliação registra a origem do link; cadastro/compra atribuídos dependem da Blink/Tolt e não foram garantidos.
