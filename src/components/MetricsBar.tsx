import React from 'react';
import { CRMTask } from '../types/crm';
import { formatCurrencyBRL } from '../utils/formatters';
import { FolderKanban, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface MetricsBarProps {
  tasks: CRMTask[];
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ tasks }) => {
  const totalCount = tasks.length;
  const totalValue = tasks.reduce((sum, t) => sum + (t.value || 0), 0);

  const notStartedTasks = tasks.filter((t) => t.status === 'nao_iniciado');
  const inProgressTasks = tasks.filter((t) => t.status === 'em_andamento');
  const finishedTasks = tasks.filter((t) => t.status === 'finalizado');

  const inProgressValue = inProgressTasks.reduce((sum, t) => sum + (t.value || 0), 0);
  const finishedValue = finishedTasks.reduce((sum, t) => sum + (t.value || 0), 0);

  const winRate = totalCount > 0 ? Math.round((finishedTasks.length / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Pipeline */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium">Total do Pipeline</span>
          <FolderKanban className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
          {formatCurrencyBRL(totalValue)}
        </div>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="font-semibold font-mono tabular-nums text-slate-700">{totalCount}</span>
          <span>oportunidades cadastradas</span>
        </div>
      </div>

      {/* Não iniciado (Cinza) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Não iniciado
          </span>
          <span className="text-slate-400 font-mono tabular-nums text-xs">
            {notStartedTasks.length} tarefas
          </span>
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-800 tracking-tight">
          {formatCurrencyBRL(notStartedTasks.reduce((sum, t) => sum + (t.value || 0), 0))}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Aguardando triagem e início
        </div>
      </div>

      {/* Em Andamento (Azul) */}
      <div className="bg-white border border-blue-200/80 rounded-xl p-4 shadow-2xs bg-gradient-to-b from-blue-50/20 to-transparent">
        <div className="flex items-center justify-between text-xs text-blue-800 mb-1.5">
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Em Andamento
          </span>
          <Clock className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-blue-950 tracking-tight">
          {formatCurrencyBRL(inProgressValue)}
        </div>
        <div className="mt-1 text-xs text-blue-700/80 flex items-center gap-1.5">
          <span className="font-semibold font-mono tabular-nums">{inProgressTasks.length}</span>
          <span>negócios em negociação ativa</span>
        </div>
      </div>

      {/* Finalizado (Verde) */}
      <div className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-2xs bg-gradient-to-b from-emerald-50/20 to-transparent">
        <div className="flex items-center justify-between text-xs text-emerald-800 mb-1.5">
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Finalizado
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-emerald-950 tracking-tight">
          {formatCurrencyBRL(finishedValue)}
        </div>
        <div className="mt-1 text-xs text-emerald-700/80 flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          <span className="font-semibold font-mono tabular-nums">{winRate}%</span>
          <span>taxa de conversão ({finishedTasks.length} finalizadas)</span>
        </div>
      </div>
    </div>
  );
};
