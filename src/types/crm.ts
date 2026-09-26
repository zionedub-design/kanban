export type TaskStatus = 'nao_iniciado' | 'em_andamento' | 'finalizado';

export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface CRMTask {
  id: string;
  title: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
  status: TaskStatus;
  value: number; // Valor em reais
  priority: TaskPriority;
  due_date?: string; // YYYY-MM-DD
  assigned_to?: string;
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  tableName: string;
}

export const STATUS_DEFINITIONS: Record<
  TaskStatus,
  {
    label: string;
    description: string;
    colorName: string;
    bgHeader: string;
    badgeStyle: string;
    columnBorder: string;
    indicatorColor: string;
  }
> = {
  nao_iniciado: {
    label: 'Não iniciado',
    description: 'Demandas recebidas aguardando início',
    colorName: 'cinza',
    bgHeader: 'bg-slate-100 border-slate-300 text-slate-800',
    badgeStyle: 'text-slate-700 bg-slate-100 border border-slate-200',
    columnBorder: 'border-slate-200',
    indicatorColor: 'bg-slate-400',
  },
  em_andamento: {
    label: 'Em Andamento',
    description: 'Tarefas e negociações em execução',
    colorName: 'azul',
    bgHeader: 'bg-blue-50/80 border-blue-200 text-blue-900',
    badgeStyle: 'text-blue-700 bg-blue-50 border border-blue-200',
    columnBorder: 'border-blue-200',
    indicatorColor: 'bg-blue-500',
  },
  finalizado: {
    label: 'Finalizado',
    description: 'Tarefas concluídas e negócios fechados',
    colorName: 'verde',
    bgHeader: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
    badgeStyle: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    columnBorder: 'border-emerald-200',
    indicatorColor: 'bg-emerald-500',
  },
};

export const PRIORITY_DEFINITIONS: Record<
  TaskPriority,
  { label: string; textStyle: string }
> = {
  baixa: { label: 'Baixa', textStyle: 'text-slate-600' },
  media: { label: 'Média', textStyle: 'text-amber-700' },
  alta: { label: 'Alta', textStyle: 'text-orange-700' },
  urgente: { label: 'Urgente', textStyle: 'text-rose-700 font-semibold' },
};
