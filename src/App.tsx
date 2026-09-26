import React, { useState, useEffect, useMemo } from 'react';
import { CRMTask, TaskStatus } from './types/crm';
import { 
  loadTasks, 
  persistTask, 
  removeTask, 
  clearAllTasks,
  getStoredSupabaseCredentials,
  testConnection
} from './lib/supabase';
import { SAMPLE_TASKS } from './data/initialData';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { TaskModal } from './components/TaskModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { Database, Check, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('todas');
  const [selectedAssignee, setSelectedAssignee] = useState('todos');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CRMTask | null>(null);
  const [defaultStatusForNew, setDefaultStatusForNew] = useState<TaskStatus>('nao_iniciado');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Supabase status
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [storageSource, setStorageSource] = useState<'supabase' | 'local'>('local');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initial load
  const loadData = async () => {
    setIsLoading(true);
    const { url, anonKey } = getStoredSupabaseCredentials();

    if (url && anonKey) {
      const testRes = await testConnection(url, anonKey);
      setIsSupabaseConnected(testRes.success);
    } else {
      setIsSupabaseConnected(false);
    }

    const { tasks: loadedTasks, source, error } = await loadTasks();
    setTasks(loadedTasks);
    setStorageSource(source);

    if (error) {
      showToast(`Aviso Supabase: ${error}. Operando com cache local.`, 'info');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Unique assignees for filter
  const assignees = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.assigned_to) set.add(t.assigned_to);
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesClient = task.client_name.toLowerCase().includes(query);
        const matchesCompany = task.client_company?.toLowerCase().includes(query);
        const matchesAssignee = task.assigned_to?.toLowerCase().includes(query);
        const matchesTags = task.tags?.some((tag) => tag.toLowerCase().includes(query));

        if (!matchesTitle && !matchesClient && !matchesCompany && !matchesAssignee && !matchesTags) {
          return false;
        }
      }

      // Priority
      if (selectedPriority !== 'todas' && task.priority !== selectedPriority) {
        return false;
      }

      // Assignee
      if (selectedAssignee !== 'todos' && task.assigned_to !== selectedAssignee) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, selectedPriority, selectedAssignee]);

  // Handlers
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const previousStatus = target.status;
    if (previousStatus === newStatus) return;

    const updatedTask: CRMTask = {
      ...target,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

    const statusLabels: Record<TaskStatus, string> = {
      nao_iniciado: 'Não iniciado (cinza)',
      em_andamento: 'Em Andamento (azul)',
      finalizado: 'Finalizado (verde)',
    };

    const result = await persistTask(updatedTask);
    if (result.success) {
      showToast(`Status alterado para: ${statusLabels[newStatus]}`);
    } else {
      showToast(`Salvo localmente. Erro Supabase: ${result.error}`, 'info');
    }
  };

  const handleSaveTask = async (task: CRMTask) => {
    const isNew = !tasks.some((t) => t.id === task.id);

    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = task;
        return copy;
      }
      return [task, ...prev];
    });

    const result = await persistTask(task);
    if (result.success) {
      showToast(isNew ? 'Tarefa criada com sucesso!' : 'Tarefa atualizada com sucesso!');
    } else {
      showToast(`Salvo no cache local. (${result.error})`, 'info');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await removeTask(taskId);
    showToast('Tarefa excluída com sucesso.');
  };

  const handleClearAllTasks = async () => {
    if (tasks.length === 0) return;
    if (confirm(`Tem certeza de que deseja excluir todas as ${tasks.length} tarefas/registros do Kanban?`)) {
      setTasks([]);
      const result = await clearAllTasks();
      if (result.success) {
        showToast('Todas as tarefas foram excluídas com sucesso.');
      } else {
        showToast(`Tarefas limpas localmente. (Supabase: ${result.error})`, 'info');
      }
    }
  };

  const handleLoadSampleTasks = async () => {
    for (const sample of SAMPLE_TASKS) {
      await persistTask(sample);
    }
    const { tasks: updated } = await loadTasks();
    setTasks(updated);
    showToast('Exemplos de teste carregados!');
  };

  const handleOpenNewTask = (defaultStatus?: TaskStatus) => {
    setEditingTask(null);
    setDefaultStatusForNew(defaultStatus || 'nao_iniciado');
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: CRMTask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      {/* Top Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenNewTask={() => handleOpenNewTask('nao_iniciado')}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        assignees={assignees}
        taskCount={tasks.length}
        onClearAllTasks={handleClearAllTasks}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner if using Local Mode */}
        {!isSupabaseConnected && !isLoading && (
          <div className="mb-6 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Modo Local Ativo:</strong> As tarefas estão sendo guardadas no navegador. Para persistir de forma definitiva no seu banco de dados Supabase, configure suas credenciais.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors shrink-0 shadow-2xs"
            >
              Configurar Supabase
            </button>
          </div>
        )}

        {/* Metrics Strip */}
        <MetricsBar tasks={tasks} />

        {/* Empty state informative banner */}
        {tasks.length === 0 && !isLoading && (
          <div className="mb-6 p-4 bg-white border border-dashed border-slate-300 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="text-slate-600 text-center sm:text-left">
              <span className="font-semibold text-slate-800">Quadro Kanban limpo!</span>
              <p className="text-slate-500 mt-0.5">
                Todos os registros foram excluídos. Crie novas tarefas manualmente pelo botão <strong>+ Nova Tarefa</strong> ou clicando diretamente nas colunas.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenNewTask('nao_iniciado')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-2xs"
              >
                + Criar Primeira Tarefa
              </button>
              <button
                type="button"
                onClick={handleLoadSampleTasks}
                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                title="Recarregar exemplos de demonstração se desejar"
              >
                Restaurar Exemplos
              </button>
            </div>
          </div>
        )}

        {/* Board or Table Content */}
        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onAddNewTask={(status) => handleOpenNewTask(status)}
          />
        ) : (
          <TableView
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">CRM Kanban</span>
            <span>·</span>
            <span>Gestão de tarefas e oportunidades</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{tasks.length} registros</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Conexão com Banco de Dados ({isSupabaseConnected ? 'Conectado' : 'Local'})
            </button>
          </div>
        </div>
      </footer>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={editingTask}
        defaultStatus={defaultStatusForNew}
      />

      {/* Supabase Settings Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        tasks={tasks}
        onConfigChanged={loadData}
        isConnected={isSupabaseConnected}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div
            className={`px-4 py-2.5 rounded-lg shadow-lg border text-xs font-medium flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-800'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-800'
                : 'bg-slate-900 text-slate-100 border-slate-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <span>{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
