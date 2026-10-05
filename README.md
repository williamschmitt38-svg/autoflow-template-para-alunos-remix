# AutoFlow — Template para Alunos

Sistema de gestão de oficinas preservado do template preparado OficinaPro. Migração para autenticação, banco e backend nativos Blink. Sem Supabase externo e sem chaves compartilhadas.

Leia **BLINK_ALUNOS.md** para clonar, inicializar o projeto atual e conhecer os limites.

## Desenvolvimento

Node 22.13 ou superior; `npm install`, `npm run typecheck`, `npm test`, `npm run build:backend`, `npm run build`.

`server/native/` contém autorização, validações e transações; `scripts/native/schema.sql` guarda a estrutura vazia; `src/routes/` mantém as páginas React Router. `.env.example` documenta somente variáveis públicas. Segredos ficam no runtime do backend.
