import React, { useState } from 'react';
import { CRMTask, PRIORITY_DEFINITIONS, TaskStatus } from '../types/crm';
import { formatCurrencyBRL, formatDateBR, isOverdue } from '../utils/formatters';
import { 
  Building2, 
  Calendar, 
  User, 
  MoreVertical, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Trash2, 
  Edit3,
  Phone,
  Mail
} from 'lucide-react';

interface TaskCardProps {
  task: CRMTask;
  onEdit: (task: CRMTask) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onDragStart,
  onDragEnd,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const priorityMeta = PRIORITY_DEFINITIONS[task.priority] || PRIORITY_DEFINITIONS.media;
  const overdue = task.status !== 'finalizado' && isOverdue(task.due_date);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(e, task.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd(e);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onEdit(task)}
      className={`group relative bg-white rounded-lg border p-4 shadow-xs transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 ${
        isDragging ? 'opacity-40 scale-95 border-dashed border-slate-400' : 'opacity-100'
      } ${
        task.status === 'nao_iniciado'
          ? 'border-slate-200 hover:border-slate-400'
          : task.status === 'em_andamento'
          ? 'border-blue-200/90 hover:border-blue-300'
          : 'border-emerald-200/90 hover:border-emerald-300'
      }`}
    >
      {/* Top Header: Client & Quick Menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-xs text-slate-800 truncate" title={task.client_name}>
            {task.client_name}
          </span>
          {task.client_company && (
            <>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-xs text-slate-500 truncate flex items-center gap-1" title={task.client_company}>
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{task.client_company}</span>
              </span>
            </>
          )}
        </div>

        {/* Priority & Menu */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className={`text-[11px] font-medium tracking-tight ${priorityMeta.textStyle}`}>
            {priorityMeta.label}
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              title="Ações da tarefa"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(task);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    Editar detalhes
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  {task.status !== 'nao_iniciado' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onStatusChange(task.id, 'nao_iniciado');
                      }}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-600"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                      Mover para Não iniciado
                    </button>
                  )}

                  {task.status !== 'em_andamento' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onStatusChange(task.id, 'em_andamento');
                      }}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-blue-50 text-blue-700 font-medium"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                      Mover para Em Andamento
                    </button>
                  )}

                  {task.status !== 'finalizado' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onStatusChange(task.id, 'finalizado');
                      }}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-emerald-50 text-emerald-700 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Mover para Finalizado
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(task.id);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-rose-50 text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir tarefa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Task Title */}
      <h3 className="text-sm font-medium text-slate-900 leading-snug mb-2 group-hover:text-blue-900 transition-colors">
        {task.title}
      </h3>

      {/* Description Snippet if present */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags unboxed */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mb-3">
          {task.tags.map((tag, idx) => (
            <React.Fragment key={tag}>
              <span className="hover:text-slate-800 transition-colors">#{tag}</span>
              {idx < task.tags!.length - 1 && (
                <span className="text-slate-300" aria-hidden="true">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Footer Info: Value, Due Date, Assignee, Quick Transition */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Valor</span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 text-sm">
            {formatCurrencyBRL(task.value)}
          </span>
        </div>

        {/* Action Controls for Quick Status Change */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {task.status === 'nao_iniciado' && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, 'em_andamento')}
              className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
              title="Iniciar tarefa (Mudar status para Em Andamento)"
            >
              <span>Iniciar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {task.status === 'em_andamento' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onStatusChange(task.id, 'nao_iniciado')}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                title="Voltar para Não iniciado"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(task.id, 'finalizado')}
                className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1"
                title="Finalizar tarefa (Mudar status para Finalizado)"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Finalizar</span>
              </button>
            </div>
          )}

          {task.status === 'finalizado' && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, 'em_andamento')}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              title="Reabrir tarefa (Mover para Em Andamento)"
            >
              Reabrir
            </button>
          )}
        </div>
      </div>

      {/* Due date and Assignee subtext */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1 truncate">
          {task.assigned_to && (
            <span className="flex items-center gap-1 text-slate-600 truncate" title={`Responsável: ${task.assigned_to}`}>
              <User className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{task.assigned_to}</span>
            </span>
          )}
        </div>

        {task.due_date && (
          <span
            className={`flex items-center gap-1 tabular-nums ${
              overdue ? 'text-rose-600 font-medium' : 'text-slate-500'
            }`}
            title={overdue ? 'Prazo vencido' : `Prazo: ${formatDateBR(task.due_date)}`}
          >
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{formatDateBR(task.due_date)}</span>
          </span>
        )}
      </div>
    </div>
  );
};
