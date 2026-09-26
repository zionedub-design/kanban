import React, { useState } from 'react';
import { CRMTask, STATUS_DEFINITIONS, TaskStatus } from '../types/crm';
import { TaskCard } from './TaskCard';
import { formatCurrencyBRL } from '../utils/formatters';
import { Plus, Inbox } from 'lucide-react';

interface KanbanBoardProps {
  tasks: CRMTask[];
  onEditTask: (task: CRMTask) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddNewTask: (defaultStatus?: TaskStatus) => void;
}

const COLUMNS: TaskStatus[] = ['nao_iniciado', 'em_andamento', 'finalizado'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAddNewTask,
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Check if moving out of current target
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX >= rect.right ||
      e.clientY < rect.top ||
      e.clientY >= rect.bottom
    ) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, targetStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {COLUMNS.map((status) => {
        const statusMeta = STATUS_DEFINITIONS[status];
        const columnTasks = tasks.filter((t) => t.status === status);
        const columnTotalValue = columnTasks.reduce((acc, t) => acc + (t.value || 0), 0);
        const isTargeted = dragOverColumn === status;

        return (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            className={`flex flex-col rounded-xl bg-slate-50/80 border transition-all duration-200 min-h-[560px] ${
              isTargeted
                ? 'border-blue-400 bg-blue-50/30 ring-2 ring-blue-300 ring-opacity-50'
                : 'border-slate-200/80'
            }`}
          >
            {/* Column Header */}
            <div
              className={`p-3.5 border-b rounded-t-xl transition-colors ${
                status === 'nao_iniciado'
                  ? 'border-slate-200 bg-slate-100/70'
                  : status === 'em_andamento'
                  ? 'border-blue-200/80 bg-blue-50/70'
                  : 'border-emerald-200/80 bg-emerald-50/70'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${statusMeta.indicatorColor}`}
                    aria-hidden="true"
                  />
                  <h2 className="font-semibold text-sm text-slate-800 tracking-tight">
                    {statusMeta.label}
                  </h2>
                  <span className="font-mono tabular-nums text-xs font-semibold px-2 py-0.5 rounded-md bg-white/80 text-slate-600 border border-slate-200/60 shadow-2xs">
                    {columnTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onAddNewTask(status)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-colors"
                  title={`Nova tarefa em ${statusMeta.label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Subtotal & Status description */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                <span className="text-[11px] truncate max-w-[170px]" title={statusMeta.description}>
                  {statusMeta.description}
                </span>
                <span className="font-mono tabular-nums font-semibold text-slate-700">
                  {formatCurrencyBRL(columnTotalValue)}
                </span>
              </div>
            </div>

            {/* Tasks Container */}
            <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)]">
              {columnTasks.length === 0 ? (
                <div
                  onClick={() => onAddNewTask(status)}
                  className={`flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg transition-colors cursor-pointer group ${
                    isTargeted
                      ? 'border-blue-300 bg-white/70'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-white/40'
                  }`}
                >
                  <Inbox className="w-8 h-8 text-slate-300 group-hover:text-slate-400 mb-2 transition-colors" />
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    Nenhuma tarefa aqui
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Arraste um card até aqui ou clique para criar
                  </p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>

            {/* Column Quick Action Footer */}
            <div className="p-2.5 border-t border-slate-200/60 bg-white/40 rounded-b-xl">
              <button
                type="button"
                onClick={() => onAddNewTask(status)}
                className="w-full py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar tarefa</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
