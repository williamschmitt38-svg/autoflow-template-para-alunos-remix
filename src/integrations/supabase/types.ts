export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          app_name: string
          created_at: string
          id: string
          super_admin_emails: Json
          system_settings: Json
          updated_at: string
        }
        Insert: {
          app_name?: string
          created_at?: string
          id?: string
          super_admin_emails?: Json
          system_settings?: Json
          updated_at?: string
        }
        Update: {
          app_name?: string
          created_at?: string
          id?: string
          super_admin_emails?: Json
          system_settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      cliente: {
        Row: {
          created_at: string
          email: string | null
          empresa_id: string
          id: string
          nome: string
          observacoes: string | null
          status: Database["public"]["Enums"]["status_cliente"]
          tags: string[] | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          empresa_id: string
          id?: string
          nome: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_cliente"]
          tags?: string[] | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          empresa_id?: string
          id?: string
          nome?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_cliente"]
          tags?: string[] | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa_publica"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa: {
        Row: {
          anos_mercado: number | null
          ciclo: Database["public"]["Enums"]["ciclo_cobranca"]
          cnpj: string | null
          cor_primaria: string
          cor_secundaria: string | null
          created_at: string
          data_inicio: string | null
          email: string | null
          endereco: string | null
          id: string
          logo_url: string | null
          nome: string
          onboarding_concluido: boolean
          owner_email: string | null
          owner_nome: string | null
          plano: Database["public"]["Enums"]["plano_empresa"]
          proximo_vencimento: string | null
          slogan: string | null
          slug: string | null
          sobre: string | null
          status: Database["public"]["Enums"]["status_empresa"]
          status_cobranca: Database["public"]["Enums"]["status_cobranca"]
          telefone: string | null
          trial_ate: string | null
          ultimo_acesso_owner: string | null
          updated_at: string
          valor: number | null
          vitrine_ativa: boolean
          whatsapp: string | null
        }
        Insert: {
          anos_mercado?: number | null
          ciclo?: Database["public"]["Enums"]["ciclo_cobranca"]
          cnpj?: string | null
          cor_primaria?: string
          cor_secundaria?: string | null
          created_at?: string
          data_inicio?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          onboarding_concluido?: boolean
          owner_email?: string | null
          owner_nome?: string | null
          plano?: Database["public"]["Enums"]["plano_empresa"]
          proximo_vencimento?: string | null
          slogan?: string | null
          slug?: string | null
          sobre?: string | null
          status?: Database["public"]["Enums"]["status_empresa"]
          status_cobranca?: Database["public"]["Enums"]["status_cobranca"]
          telefone?: string | null
          trial_ate?: string | null
          ultimo_acesso_owner?: string | null
          updated_at?: string
          valor?: number | null
          vitrine_ativa?: boolean
          whatsapp?: string | null
        }
        Update: {
          anos_mercado?: number | null
          ciclo?: Database["public"]["Enums"]["ciclo_cobranca"]
          cnpj?: string | null
          cor_primaria?: string
          cor_secundaria?: string | null
          created_at?: string
          data_inicio?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          onboarding_concluido?: boolean
          owner_email?: string | null
          owner_nome?: string | null
          plano?: Database["public"]["Enums"]["plano_empresa"]
          proximo_vencimento?: string | null
          slogan?: string | null
          slug?: string | null
          sobre?: string | null
          status?: Database["public"]["Enums"]["status_empresa"]
          status_cobranca?: Database["public"]["Enums"]["status_cobranca"]
          telefone?: string | null
          trial_ate?: string | null
          ultimo_acesso_owner?: string | null
          updated_at?: string
          valor?: number | null
          vitrine_ativa?: boolean
          whatsapp?: string | null
        }
        Relationships: []
      }
      empresa_user: {
        Row: {
          ativo: boolean
          auth_user_id: string | null
          created_at: string
          email: string
          empresa_id: string | null
          id: string
          nome: string | null
          role: Database["public"]["Enums"]["empresa_user_role"]
          ultimo_login: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          auth_user_id?: string | null
          created_at?: string
          email: string
          empresa_id?: string | null
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["empresa_user_role"]
          ultimo_login?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          auth_user_id?: string | null
          created_at?: string
          email?: string
          empresa_id?: string | null
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["empresa_user_role"]
          ultimo_login?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_user_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresa_user_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa_publica"
            referencedColumns: ["id"]
          },
        ]
      }
      horario_funcionamento: {
        Row: {
          abre: string | null
          created_at: string
          dia_semana: number
          empresa_id: string
          fecha: string | null
          fechado: boolean
          id: string
        }
        Insert: {
          abre?: string | null
          created_at?: string
          dia_semana: number
          empresa_id: string
          fecha?: string | null
          fechado?: boolean
          id?: string
        }
        Update: {
          abre?: string | null
          created_at?: string
          dia_semana?: number
          empresa_id?: string
          fecha?: string | null
          fechado?: boolean
          id?: string
        }
        Relationships: []
      }
      lancamento: {
        Row: {
          categoria: string | null
          cliente_id: string | null
          created_at: string
          data: string | null
          descricao: string
          empresa_id: string
          forma: string | null
          id: string
          orcamento_id: string | null
          os_id: string | null
          status: Database["public"]["Enums"]["status_lancamento"]
          tipo: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          cliente_id?: string | null
          created_at?: string
          data?: string | null
          descricao: string
          empresa_id: string
          forma?: string | null
          id?: string
          orcamento_id?: string | null
          os_id?: string | null
          status?: Database["public"]["Enums"]["status_lancamento"]
          tipo?: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string | null
          cliente_id?: string | null
          created_at?: string
          data?: string | null
          descricao?: string
          empresa_id?: string
          forma?: string | null
          id?: string
          orcamento_id?: string | null
          os_id?: string | null
          status?: Database["public"]["Enums"]["status_lancamento"]
          tipo?: Database["public"]["Enums"]["tipo_lancamento"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamento_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa_publica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamento_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamento_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordem_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento: {
        Row: {
          cliente_id: string
          cliente_nome: string | null
          convertido_em_os: boolean
          created_at: string
          data: string | null
          empresa_id: string
          id: string
          itens: Json | null
          numero: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["status_orcamento"]
          total: number | null
          updated_at: string
          validade: string | null
          veiculo_desc: string | null
          veiculo_id: string
        }
        Insert: {
          cliente_id: string
          cliente_nome?: string | null
          convertido_em_os?: boolean
          created_at?: string
          data?: string | null
          empresa_id: string
          id?: string
          itens?: Json | null
          numero?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_orcamento"]
          total?: number | null
          updated_at?: string
          validade?: string | null
          veiculo_desc?: string | null
          veiculo_id: string
        }
        Update: {
          cliente_id?: string
          cliente_nome?: string | null
          convertido_em_os?: boolean
          created_at?: string
          data?: string | null
          empresa_id?: string
          id?: string
          itens?: Json | null
          numero?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_orcamento"]
          total?: number | null
          updated_at?: string
          validade?: string | null
          veiculo_desc?: string | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa_publica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculo"
            referencedColumns: ["id"]
          },
        ]
      }
      ordem_servico: {
        Row: {
          cliente_id: string
          cliente_nome: string | null
          created_at: string
          data_abertura: string | null
          data_conclusao: string | null
          data_prevista: string | null
          empresa_id: string
          id: string
          itens: Json | null
          numero: string | null
          orcamento_id: string | null
          pagamento_status: Database["public"]["Enums"]["status_pagamento_os"]
          prioridade: Database["public"]["Enums"]["prioridade_os"]
          status: Database["public"]["Enums"]["status_os"]
          tecnico: string | null
          tecnico_id: string | null
          total: number | null
          updated_at: string
          veiculo_desc: string | null
          veiculo_id: string
        }
        Insert: {
          cliente_id: string
          cliente_nome?: string | null
          created_at?: string
          data_abertura?: string | null
          data_conclusao?: string | null
          data_prevista?: string | null
          empresa_id: string
          id?: string
          itens?: Json | null
          numero?: string | null
          orcamento_id?: string | null
          pagamento_status?: Database["public"]["Enums"]["status_pagamento_os"]
          prioridade?: Database["public"]["Enums"]["prioridade_os"]
          status?: Database["public"]["Enums"]["status_os"]
          tecnico?: string | null
          tecnico_id?: string | null
          total?: number | null
          updated_at?: string
          veiculo_desc?: string | null
          veiculo_id: string
        }
        Update: {
          cliente_id?: string
          cliente_nome?: string | null
          created_at?: string
          data_abertura?: string | null
          data_conclusao?: string | null
          data_prevista?: string | null
          empresa_id?: string
          id?: string
          itens?: Json | null
          numero?: string | null
          orcamento_id?: string | null
          pagamento_status?: Database["public"]["Enums"]["status_pagamento_os"]
          prioridade?: Database["public"]["Enums"]["prioridade_os"]
          status?: Database["public"]["Enums"]["status_os"]
          tecnico?: string | null
          tecnico_id?: string | null
          total?: number | null
          updated_at?: string
          veiculo_desc?: string | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordem_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_servico_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_servico_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa_publica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_servico_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_servico_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculo"
            referencedColumns: ["id"]
          },
        ]
      }
      servico_referencia: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          descricao: string | null
          duracao_min: number | null
          empresa_id: string
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string
          valor_referencia: number | null
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          duracao_min?: number | null
          empresa_id: string
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string
          valor_referencia?: number | null
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          duracao_min?: number | null
          empresa_id?: string
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
          valor_referencia?: number | null
        }
        Relationships: []
      }
      solicitacao: {
        Row: {
          cliente_email: string | null
          cliente_nome: string
          cliente_telefone: string
          created_at: string
          data_agendada: string | null
          descricao: string | null
          empresa_id: string
          hora_agendada: string | null
          id: string
          protocolo: string
          servicos: Json | null
          status: string
          tipo: string
          veiculo_ano: number | null
          veiculo_km: number | null
          veiculo_marca: string | null
          veiculo_modelo: string | null
          veiculo_placa: string | null
        }
        Insert: {
          cliente_email?: string | null
          cliente_nome: string
          cliente_telefone: string
          created_at?: string
          data_agendada?: string | null
          descricao?: string | null
          empresa_id: string
          hora_agendada?: string | null
          id?: string
          protocolo?: string
          servicos?: Json | null
          status?: string
          tipo?: string
          veiculo_ano?: number | null
          veiculo_km?: number | null
          veiculo_marca?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string | null
        }
        Update: {
          cliente_email?: string | null
          cliente_nome?: string
          cliente_telefone?: string
          created_at?: string
          data_agendada?: string | null
          descricao?: string | null
          empresa_id?: string
          hora_agendada?: string | null
          id?: string
          protocolo?: string
          servicos?: Json | null
          status?: string
          tipo?: string
          veiculo_ano?: number | null
          veiculo_km?: number | null
          veiculo_marca?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          empresa_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          empresa_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          empresa_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      veiculo: {
        Row: {
          ano: number | null
          cliente_id: string
          cliente_nome: string | null
          cor: string | null
          created_at: string
          empresa_id: string
          id: string
          marca: string
          modelo: string
          placa: string
          proxima_revisao: string | null
          quilometragem: number | null
          ultima_revisao: string | null
          updated_at: string
        }
        Insert: {
          ano?: number | null
          cliente_id: string
          cliente_nome?: string | null
          cor?: string | null
          created_at?: string
          empresa_id: string
          id?: string
          marca: string
          modelo: string
          placa: string
          proxima_revisao?: string | null
          quilometragem?: number | null
          ultima_revisao?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number | null
          cliente_id?: string
          cliente_nome?: string | null
          cor?: string | null
          created_at?: string
          empresa_id?: string
          id?: string
          marca?: string
          modelo?: string
          placa?: string
          proxima_revisao?: string | null
          quilometragem?: number | null
          ultima_revisao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa_publica"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      empresa_publica: {
        Row: {
          anos_mercado: number | null
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string | null
          logo_url: string | null
          nome: string | null
          slogan: string | null
          slug: string | null
          sobre: string | null
          telefone: string | null
          updated_at: string | null
          vitrine_ativa: boolean | null
          whatsapp: string | null
        }
        Insert: {
          anos_mercado?: number | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string | null
          logo_url?: string | null
          nome?: string | null
          slogan?: string | null
          slug?: string | null
          sobre?: string | null
          telefone?: string | null
          updated_at?: string | null
          vitrine_ativa?: boolean | null
          whatsapp?: string | null
        }
        Update: {
          anos_mercado?: number | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string | null
          logo_url?: string | null
          nome?: string | null
          slogan?: string | null
          slug?: string | null
          sobre?: string | null
          telefone?: string | null
          updated_at?: string | null
          vitrine_ativa?: boolean | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_public_solicitacao: {
        Args: { _payload: Json }
        Returns: {
          data_agendada: string
          hora_agendada: string
          id: string
          protocolo: string
          status: string
          tipo: string
        }[]
      }
      current_empresa_id: { Args: never; Returns: string }
      empresa_user_self_update_safe: {
        Args: {
          _current_row: Database["public"]["Tables"]["empresa_user"]["Row"]
          _new_row: Database["public"]["Tables"]["empresa_user"]["Row"]
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      link_owner_to_empresa: {
        Args: { _empresa_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "tecnico"
        | "recepcao"
        | "financeiro"
        | "demo"
      ciclo_cobranca: "mensal" | "anual"
      empresa_user_role:
        | "owner"
        | "admin"
        | "tecnico"
        | "recepcao"
        | "financeiro"
      plano_empresa: "trial" | "basico" | "profissional"
      prioridade_os: "baixa" | "normal" | "alta"
      status_cliente: "ativo" | "inativo"
      status_cobranca:
        | "trial"
        | "ativo"
        | "inadimplente"
        | "suspenso"
        | "cancelado"
      status_empresa: "ativo" | "trial" | "inativo"
      status_lancamento: "confirmado" | "pendente" | "cancelado"
      status_orcamento: "pendente" | "aprovado" | "recusado"
      status_os:
        | "aberta"
        | "em_andamento"
        | "aguardando_peca"
        | "concluida"
        | "cancelada"
      status_pagamento_os: "pendente" | "pago" | "parcial"
      tipo_lancamento: "entrada" | "saida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "tecnico",
        "recepcao",
        "financeiro",
        "demo",
      ],
      ciclo_cobranca: ["mensal", "anual"],
      empresa_user_role: [
        "owner",
        "admin",
        "tecnico",
        "recepcao",
        "financeiro",
      ],
      plano_empresa: ["trial", "basico", "profissional"],
      prioridade_os: ["baixa", "normal", "alta"],
      status_cliente: ["ativo", "inativo"],
      status_cobranca: [
        "trial",
        "ativo",
        "inadimplente",
        "suspenso",
        "cancelado",
      ],
      status_empresa: ["ativo", "trial", "inativo"],
      status_lancamento: ["confirmado", "pendente", "cancelado"],
      status_orcamento: ["pendente", "aprovado", "recusado"],
      status_os: [
        "aberta",
        "em_andamento",
        "aguardando_peca",
        "concluida",
        "cancelada",
      ],
      status_pagamento_os: ["pendente", "pago", "parcial"],
      tipo_lancamento: ["entrada", "saida"],
    },
  },
} as const

