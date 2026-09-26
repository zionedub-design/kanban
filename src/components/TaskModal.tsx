import React, { useState, useEffect } from 'react';
import { CRMTask, TaskPriority, TaskStatus, STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../types/crm';
import { X, Check, Trash2, Building2, User, Phone, Mail, DollarSign, Calendar, Tag, FileText } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: CRMTask) => void;
  onDelete?: (taskId: string) => void;
  initialTask?: CRMTask | null;
  defaultStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
  defaultStatus = 'nao_iniciado',
}) => {
  const isEditing = !!initialTask;

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [value, setValue] = useState<string>('0');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Carlos Silva');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setClientName(initialTask.client_name || '');
      setClientEmail(initialTask.client_email || '');
      setClientPhone(initialTask.client_phone || '');
      setClientCompany(initialTask.client_company || '');
      setStatus(initialTask.status || 'nao_iniciado');
      setValue(initialTask.value ? initialTask.value.toString() : '0');
      setPriority(initialTask.priority || 'media');
      setDueDate(initialTask.due_date || '');
      setAssignedTo(initialTask.assigned_to || 'Carlos Silva');
      setDescription(initialTask.description || '');
      setTagsInput(initialTask.tags ? initialTask.tags.join(', ') : '');
    } else {
      setTitle('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientCompany('');
      setStatus(defaultStatus);
      setValue('0');
      setPriority('media');
      setDueDate('');
      setAssignedTo('Carlos Silva');
      setDescription('');
      setTagsInput('');
    }
    setErrorMsg('');
  }, [initialTask, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('O título da tarefa é obrigatório.');
      return;
    }
    if (!clientName.trim()) {
      setErrorMsg('O nome do cliente/contato é obrigatório.');
      return;
    }

    const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const taskPayload: CRMTask = {
      id: initialTask?.id || crypto.randomUUID(),
      title: title.trim(),
      client_name: clientName.trim(),
      client_email: clientEmail.trim() || undefined,
      client_phone: clientPhone.trim() || undefined,
      client_company: clientCompany.trim() || undefined,
      status,
      value: numericValue,
      priority,
      due_date: dueDate || undefined,
      assigned_to: assignedTo.trim() || undefined,
      description: description.trim() || undefined,
      tags: parsedTags,
      created_at: initialTask?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(taskPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Editar Oportunidade / Tarefa' : 'Nova Oportunidade / Tarefa'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Preencha os dados do cliente e defina o status no funil CRM
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Status Selection (Mandatory CRM status with requested colors) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Status no Funil Kanban
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['nao_iniciado', 'em_andamento', 'finalizado'] as TaskStatus[]).map((st) => {
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? st === 'nao_iniciado'
                          ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-xs'
                          : st === 'em_andamento'
                          ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                          : 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${STATUS_DEFINITIONS[st].indicatorColor}`}
                    />
                    <span>{STATUS_DEFINITIONS[st].label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Título da Tarefa / Negócio <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Envio de Proposta Comercial de Software"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Client & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Nome do Cliente / Contato <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Mariana Duarte"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Empresa / Organização
              </label>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Ex: Inovare Tecnologia"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Contact Details (Email & Phone) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email do Cliente
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="mariana@empresa.com.br"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Value, Priority, Due Date, Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Valor da Oportunidade (R$)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full font-mono tabular-nums px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Prazo / Data Limite
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full font-mono tabular-nums px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Assignee & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Responsável
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Carlos Silva">Carlos Silva</option>
                <option value="Ana Beatriz">Ana Beatriz</option>
                <option value="Lucas Prado">Lucas Prado</option>
                <option value="Juliana Santos">Juliana Santos</option>
                <option value="Equipe Comercial">Equipe Comercial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Proposta, B2B, Software"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Observações / Detalhes da Negociação
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as dores do cliente, histórico das conversas, próximos passos acordados..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                    onDelete(initialTask.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
              >
                {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
