import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useEmpresaConfig() {
  return useQuery({
    queryKey: ['app_config'],
    queryFn: async () => {
      const { data } = await supabase.from('app_config').select('*').limit(1).maybeSingle();
      return data || { app_name: 'AutoFlow AI', system_settings: {}, super_admin_emails: [] };
    },
    staleTime: 5 * 60_000,
  });
}

export default useEmpresaConfig;

