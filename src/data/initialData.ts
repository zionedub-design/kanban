import { CRMTask } from '../types/crm';

// O Kanban inicia limpo para você cadastrar manualmente suas próprias tarefas
export const INITIAL_TASKS: CRMTask[] = [];

// Exemplos opcionais caso o usuário deseje carregar modelos para teste
export const SAMPLE_TASKS: CRMTask[] = [
  {
    id: 'd9b1a5e0-4c31-4c12-9c1a-7b3d2e1f4001',
    title: 'Apresentação de Proposta Comercial',
    client_name: 'Mariana Duarte',
    client_email: 'mariana.duarte@inovaretech.com.br',
    client_phone: '(11) 98765-4321',
    client_company: 'Inovare Tecnologia',
    status: 'nao_iniciado',
    value: 18500,
    priority: 'alta',
    due_date: '2026-10-05',
    assigned_to: 'Carlos Silva',
    description: 'Enviar proposta comercial atualizada do módulo de integração e agendar reunião de alinhamento com a diretoria.',
    tags: ['Proposta', 'Software', 'B2B'],
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
  },
  {
    id: 'd9b1a5e0-4c31-4c12-9c1a-7b3d2e1f4003',
    title: 'Negociação de Minuta Contratual',
    client_name: 'Juliana Mendes',
    client_email: 'juliana.m@agrovita.ind.br',
    client_phone: '(19) 97123-5566',
    client_company: 'Agrovita Indústria',
    status: 'em_andamento',
    value: 45000,
    priority: 'urgente',
    due_date: '2026-09-30',
    assigned_to: 'Carlos Silva',
    description: 'Revisão das cláusulas de SLA e cronograma de implantação com o departamento jurídico da Agrovita.',
    tags: ['Jurídico', 'Contrato', 'Enterprise'],
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: 'd9b1a5e0-4c31-4c12-9c1a-7b3d2e1f4005',
    title: 'Assinatura e Setup Inicial do Cliente',
    client_name: 'Camila Rocha',
    client_email: 'camila@pontomarketing.com.br',
    client_phone: '(21) 99344-9988',
    client_company: 'Ponto Marketing Digital',
    status: 'finalizado',
    value: 14000,
    priority: 'media',
    due_date: '2026-09-24',
    assigned_to: 'Ana Beatriz',
    description: 'Contrato assinado via DocuSign. Kickoff agendado e acesso ao ambiente liberado com sucesso.',
    tags: ['Onboarding', 'Fechado'],
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
];
