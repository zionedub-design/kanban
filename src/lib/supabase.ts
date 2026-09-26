import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CRMTask } from '../types/crm';
import { INITIAL_TASKS } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'crm_tasks_data_v2';
const SUPABASE_URL_KEY = 'crm_supabase_url';
const SUPABASE_KEY_KEY = 'crm_supabase_anon_key';

export const SUPABASE_TABLE_NAME = 'crm_tasks';

export const SUPABASE_SETUP_SQL = `-- ==============================================================================
-- 1. CRIAÇÃO DA TABELA DE TAREFAS / OPORTUNIDADES DO CRM
-- ==============================================================================
create table if not exists public.crm_tasks (
  id text primary key,
  title text not null,
  client_name text not null,
  client_email text,
  client_phone text,
  client_company text,
  status text not null default 'nao_iniciado' check (status in ('nao_iniciado', 'em_andamento', 'finalizado')),
  value numeric default 0,
  priority text default 'media' check (priority in ('baixa', 'media', 'alta', 'urgente')),
  due_date text,
  assigned_to text,
  description text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================================================================
-- 2. HABILITAR SEGURANÇA A NÍVEL DE LINHA (RLS - ROW LEVEL SECURITY)
-- ==============================================================================
alter table public.crm_tasks enable row level security;

-- ==============================================================================
-- 3. POLÍTICAS DE ACESSO (RLS POLICIES) PARA O BANCO DE DADOS
-- Permite leitura, criação, atualização e exclusão tanto para anon quanto autenticados
-- ==============================================================================

-- Remover políticas antigas para evitar duplicações
drop policy if exists "Permitir leitura de tarefas no CRM" on public.crm_tasks;
drop policy if exists "Permitir criacao de tarefas no CRM" on public.crm_tasks;
drop policy if exists "Permitir atualizacao de tarefas no CRM" on public.crm_tasks;
drop policy if exists "Permitir exclusao de tarefas no CRM" on public.crm_tasks;
drop policy if exists "Permitir acesso completo publico crm_tasks" on public.crm_tasks;

-- 3.1 Política para Consulta (SELECT)
create policy "Permitir leitura de tarefas no CRM"
  on public.crm_tasks
  for select
  using (true);

-- 3.2 Política para Inserção (INSERT)
create policy "Permitir criacao de tarefas no CRM"
  on public.crm_tasks
  for insert
  with check (true);

-- 3.3 Política para Atualização (UPDATE)
create policy "Permitir atualizacao de tarefas no CRM"
  on public.crm_tasks
  for update
  using (true)
  with check (true);

-- 3.4 Política para Exclusão (DELETE)
create policy "Permitir exclusao de tarefas no CRM"
  on public.crm_tasks
  for delete
  using (true);

-- ==============================================================================
-- 4. ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================
create index if not exists idx_crm_tasks_status on public.crm_tasks(status);
create index if not exists idx_crm_tasks_updated_at on public.crm_tasks(updated_at desc);
create index if not exists idx_crm_tasks_client_name on public.crm_tasks(client_name);

-- ==============================================================================
-- 5. TRIGGER AUTOMÁTICO DE ATUALIZAÇÃO DO updated_at
-- ==============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.crm_tasks;
create trigger set_updated_at
  before update on public.crm_tasks
  for each row
  execute function public.handle_updated_at();

-- ==============================================================================
-- 6. POLÍTICAS DE ARMAZENAMENTO DE ARQUIVOS (SUPABASE STORAGE BUCKET)
-- Cria bucket para anexos/documentos de tarefas e define as políticas de segurança
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('crm-arquivos', 'crm-arquivos', true)
on conflict (id) do update set public = true;

-- Políticas de Storage para o bucket 'crm-arquivos':
drop policy if exists "Permitir visualizacao publica de anexos" on storage.objects;
create policy "Permitir visualizacao publica de anexos"
  on storage.objects
  for select
  using (bucket_id = 'crm-arquivos');

drop policy if exists "Permitir upload de anexos" on storage.objects;
create policy "Permitir upload de anexos"
  on storage.objects
  for insert
  with check (bucket_id = 'crm-arquivos');

drop policy if exists "Permitir atualizacao de anexos" on storage.objects;
create policy "Permitir atualizacao de anexos"
  on storage.objects
  for update
  using (bucket_id = 'crm-arquivos');

drop policy if exists "Permitir exclusao de anexos" on storage.objects;
create policy "Permitir exclusao de anexos"
  on storage.objects
  for delete
  using (bucket_id = 'crm-arquivos');

-- ==============================================================================
-- 7. HABILITAR SINCRONIZAÇÃO EM TEMPO REAL (REALTIME REPLICATION)
-- ==============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'crm_tasks'
  ) then
    alter publication supabase_realtime add table public.crm_tasks;
  end if;
end;
$$;
`;

let clientInstance: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export function getStoredSupabaseCredentials(): { url: string; anonKey: string } {
  const localUrl = localStorage.getItem(SUPABASE_URL_KEY) || '';
  const localKey = localStorage.getItem(SUPABASE_KEY_KEY) || '';
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const url = localUrl || (envUrl.startsWith('http') ? envUrl : '');
  const anonKey = localKey || envKey;

  return { url, anonKey };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseCredentials();

  if (!url || !anonKey) {
    clientInstance = null;
    return null;
  }

  if (clientInstance && currentUrl === url && currentKey === anonKey) {
    return clientInstance;
  }

  try {
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    currentUrl = url;
    currentKey = anonKey;
    return clientInstance;
  } catch (error) {
    console.error('Erro ao inicializar cliente Supabase:', error);
    clientInstance = null;
    return null;
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
  clientInstance = null; // forçar reinicialização
}

export function clearSupabaseCredentials(): void {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
  clientInstance = null;
}

export async function testConnection(testUrl?: string, testKey?: string): Promise<{
  success: boolean;
  message: string;
  tableExists: boolean;
}> {
  const url = testUrl || getStoredSupabaseCredentials().url;
  const anonKey = testKey || getStoredSupabaseCredentials().anonKey;

  if (!url || !anonKey) {
    return {
      success: false,
      message: 'URL e Chave Anônima do Supabase são obrigatórias.',
      tableExists: false,
    };
  }

  try {
    const tempClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await tempClient
      .from(SUPABASE_TABLE_NAME)
      .select('id')
      .limit(1);

    if (error) {
      // Código 42P01 é relation does not exist no PostgreSQL
      if (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist') || error.message?.toLowerCase().includes('could not find')) {
        return {
          success: true,
          message: 'Conectado ao Supabase! A tabela "crm_tasks" ainda não existe. Execute o script SQL no editor do Supabase.',
          tableExists: false,
        };
      }
      return {
        success: false,
        message: `Erro do Supabase: ${error.message}`,
        tableExists: false,
      };
    }

    return {
      success: true,
      message: 'Conexão estabelecida com sucesso e tabela "crm_tasks" verificada!',
      tableExists: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Falha ao conectar ao servidor do Supabase. Verifique a URL.',
      tableExists: false,
    };
  }
}

// Operações de persistência local como fallback garantido
export function getLocalTasks(): CRMTask[] {
  try {
    // Remove qualquer cache antigo de demonstração
    localStorage.removeItem('crm_tasks_data_v1');
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalTasks(tasks: CRMTask[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Falha ao salvar tarefas no localStorage:', e);
  }
}

export async function clearAllTasks(): Promise<{ success: boolean; error?: string }> {
  // Limpa o armazenamento local
  localStorage.removeItem('crm_tasks_data_v1');
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  saveLocalTasks([]);

  const client = getSupabaseClient();
  if (!client) {
    return { success: true };
  }

  try {
    const { error } = await client
      .from(SUPABASE_TABLE_NAME)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Erro ao deletar tarefas no Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Operações com o Supabase com fallback transparente
export async function loadTasks(): Promise<{ tasks: CRMTask[]; source: 'supabase' | 'local'; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { tasks: getLocalTasks(), source: 'local' };
  }

  try {
    const { data, error } = await client
      .from(SUPABASE_TABLE_NAME)
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Falha na consulta ao Supabase, recorrendo a tarefas locais:', error.message);
      return { tasks: getLocalTasks(), source: 'local', error: error.message };
    }

    if (data && Array.isArray(data)) {
      const formattedTasks: CRMTask[] = data.map((item) => ({
        id: item.id,
        title: item.title,
        client_name: item.client_name,
        client_email: item.client_email || undefined,
        client_phone: item.client_phone || undefined,
        client_company: item.client_company || undefined,
        status: item.status,
        value: Number(item.value) || 0,
        priority: item.priority || 'media',
        due_date: item.due_date || undefined,
        assigned_to: item.assigned_to || undefined,
        description: item.description || undefined,
        tags: Array.isArray(item.tags) ? item.tags : [],
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
      }));

      // Mantém espelho local atualizado
      saveLocalTasks(formattedTasks);
      return { tasks: formattedTasks, source: 'supabase' };
    }

    return { tasks: getLocalTasks(), source: 'local' };
  } catch (err: any) {
    return { tasks: getLocalTasks(), source: 'local', error: err.message };
  }
}

export async function persistTask(task: CRMTask): Promise<{ success: boolean; error?: string }> {
  // Salva no storage local imediatamente
  const localTasks = getLocalTasks();
  const index = localTasks.findIndex((t) => t.id === task.id);
  let updatedTasks: CRMTask[];
  if (index >= 0) {
    updatedTasks = [...localTasks];
    updatedTasks[index] = task;
  } else {
    updatedTasks = [task, ...localTasks];
  }
  saveLocalTasks(updatedTasks);

  // Se tiver Supabase conectado, salva no banco
  const client = getSupabaseClient();
  if (!client) {
    return { success: true };
  }

  try {
    const payload = {
      id: task.id,
      title: task.title,
      client_name: task.client_name,
      client_email: task.client_email || null,
      client_phone: task.client_phone || null,
      client_company: task.client_company || null,
      status: task.status,
      value: task.value,
      priority: task.priority,
      due_date: task.due_date || null,
      assigned_to: task.assigned_to || null,
      description: task.description || null,
      tags: task.tags || [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from(SUPABASE_TABLE_NAME)
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Erro ao persistir no Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exceção ao persistir no Supabase:', err);
    return { success: false, error: err.message };
  }
}

export async function removeTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  // Remove localmente
  const localTasks = getLocalTasks().filter((t) => t.id !== taskId);
  saveLocalTasks(localTasks);

  const client = getSupabaseClient();
  if (!client) {
    return { success: true };
  }

  try {
    const { error } = await client
      .from(SUPABASE_TABLE_NAME)
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Erro ao deletar no Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function syncLocalToSupabase(tasks: CRMTask[]): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { count: 0, error: 'Supabase não está configurado.' };
  }

  try {
    const payloads = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      client_name: task.client_name,
      client_email: task.client_email || null,
      client_phone: task.client_phone || null,
      client_company: task.client_company || null,
      status: task.status,
      value: task.value,
      priority: task.priority,
      due_date: task.due_date || null,
      assigned_to: task.assigned_to || null,
      description: task.description || null,
      tags: task.tags || [],
      created_at: task.created_at,
      updated_at: task.updated_at,
    }));

    const { data, error } = await client
      .from(SUPABASE_TABLE_NAME)
      .upsert(payloads, { onConflict: 'id' });

    if (error) {
      return { count: 0, error: error.message };
    }

    return { count: payloads.length };
  } catch (err: any) {
    return { count: 0, error: err.message };
  }
}
