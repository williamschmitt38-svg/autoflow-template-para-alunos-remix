import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'autoflow-template-para-nq8p0hqb',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_S87x0V9uyDcvISB1CCUNrmeal1hrASLp',
  authRequired: false,
  auth: { mode: 'managed' },
})
