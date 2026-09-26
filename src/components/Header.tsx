import React from 'react';
import { 
  Plus, 
  Database, 
  LayoutGrid, 
  List, 
  Search, 
  SlidersHorizontal,
  X,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { TaskPriority } from '../types/crm';

interface HeaderProps {
  viewMode: 'kanban' | 'table';
  onViewModeChange: (mode: 'kanban' | 'table') => void;
  onOpenNewTask: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedPriority: string;
  onPriorityChange: (val: string) => void;
  selectedAssignee: string;
  onAssigneeChange: (val: string) => void;
  assignees: string[];
  taskCount: number;
  onClearAllTasks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  onOpenNewTask,
  onOpenSupabaseModal,
  isSupabaseConnected,
  searchTerm,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedAssignee,
  onAssigneeChange,
  assignees,
  taskCount,
  onClearAllTasks,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      {/* Zone 1, 2, 3 Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold tracking-tight text-slate-900 select-none">
              CRM Kanban
            </span>

            {/* Zone 2: View Switcher */}
            <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => onViewModeChange('kanban')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Quadro Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista Detalhada</span>
              </button>
            </div>
          </div>

          {/* Zone 3: Actions (Clear tasks, Supabase status button + Nova Tarefa) */}
          <div className="flex items-center gap-2">
            {/* Clear all tasks button */}
            {taskCount > 0 && (
              <button
                type="button"
                onClick={onClearAllTasks}
                className="px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors flex items-center gap-1.5"
                title="Excluir todas as tarefas do Kanban"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Excluir tarefas</span>
              </button>
            )}

            {/* Supabase Connection Button */}
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all flex items-center gap-2 ${
                isSupabaseConnected
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              title="Configurar conexão com o Supabase"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className="hidden md:inline">
                {isSupabaseConnected ? 'Supabase Conectado' : 'Conectar Supabase'}
              </span>
              {isSupabaseConnected && (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              )}
            </button>

            {/* + Nova Tarefa Primary Action */}
            <button
              type="button"
              onClick={onOpenNewTask}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Search and Quick Filter Toolbar */}
        <div className="py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por tarefa, cliente, empresa ou tag..."
                className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Priority & Assignee filters */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 text-slate-500">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] hidden sm:inline">Filtros:</span>
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="py-1 px-2.5 text-xs rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="todas">Todas as Prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>

            <select
              value={selectedAssignee}
              onChange={(e) => onAssigneeChange(e.target.value)}
              className="py-1 px-2.5 text-xs rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="todos">Todos Responsáveis</option>
              {assignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>

            {/* Mobile View Toggle */}
            <div className="sm:hidden flex items-center p-0.5 bg-slate-100 rounded-md">
              <button
                type="button"
                onClick={() => onViewModeChange('kanban')}
                className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-white shadow-2xs' : 'text-slate-500'}`}
                title="Quadro"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow-2xs' : 'text-slate-500'}`}
                title="Tabela"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
