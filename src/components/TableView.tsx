import React from 'react';
import { CRMTask, STATUS_DEFINITIONS, PRIORITY_DEFINITIONS, TaskStatus } from '../types/crm';
import { formatCurrencyBRL, formatDateBR, isOverdue } from '../utils/formatters';
import { Building2, Calendar, Edit3, Trash2 } from 'lucide-react';

interface TableViewProps {
  tasks: CRMTask[];
  onEditTask: (task: CRMTask) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Tarefa / Oportunidade</th>
              <th className="py-3 px-4">Cliente / Empresa</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Valor (R$)</th>
              <th className="py-3 px-4">Prioridade</th>
              <th className="py-3 px-4">Prazo</th>
              <th className="py-3 px-4">Responsável</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Nenhuma oportunidade encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const overdue = task.status !== 'finalizado' && isOverdue(task.due_date);
                const priorityMeta = PRIORITY_DEFINITIONS[task.priority] || PRIORITY_DEFINITIONS.media;

                return (
                  <tr
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    {/* Title */}
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      <div className="flex flex-col">
                        <span className="truncate">{task.title}</span>
                        {task.description && (
                          <span className="text-[11px] text-slate-400 truncate max-w-xs">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-3 px-4 text-slate-700">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{task.client_name}</span>
                        {task.client_company && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {task.client_company}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status with direct selector */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                        className={`text-xs font-medium py-1 px-2.5 rounded-lg border transition-colors cursor-pointer ${
                          task.status === 'nao_iniciado'
                            ? 'bg-slate-100 text-slate-800 border-slate-300'
                            : task.status === 'em_andamento'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        <option value="nao_iniciado">Não iniciado</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </td>

                    {/* Value */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatCurrencyBRL(task.value)}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-medium ${priorityMeta.textStyle}`}>
                        {priorityMeta.label}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4">
                      {task.due_date ? (
                        <span
                          className={`font-mono tabular-nums flex items-center gap-1 ${
                            overdue ? 'text-rose-600 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDateBR(task.due_date)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-4 text-slate-600">
                      {task.assigned_to || <span className="text-slate-300">—</span>}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja excluir "${task.title}"?`)) {
                              onDeleteTask(task.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
