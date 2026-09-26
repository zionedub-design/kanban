import React, { useState, useEffect } from 'react';
import { 
  getStoredSupabaseCredentials, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials, 
  testConnection, 
  SUPABASE_SETUP_SQL,
  syncLocalToSupabase
} from '../lib/supabase';
import { CRMTask } from '../types/crm';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  RefreshCw, 
  UploadCloud,
  Terminal,
  ShieldCheck
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: CRMTask[];
  onConfigChanged: () => void;
  isConnected: boolean;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onConfigChanged,
  isConnected,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableExists: boolean;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const creds = getStoredSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setSyncResult(null);

    const res = await testConnection(url.trim(), anonKey.trim());
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSave = () => {
    if (url.trim() && anonKey.trim()) {
      saveSupabaseCredentials(url.trim(), anonKey.trim());
      onConfigChanged();
      setTestResult({
        success: true,
        message: 'Credenciais salvas com sucesso! O CRM agora sincronizará com seu Supabase.',
        tableExists: true,
      });
    } else {
      clearSupabaseCredentials();
      onConfigChanged();
    }
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    setSyncResult(null);
    onConfigChanged();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const res = await syncLocalToSupabase(tasks);
    setIsSyncing(false);
    if (res.error) {
      setSyncResult(`Falha na sincronização: ${res.error}`);
    } else {
      setSyncResult(`Sucesso! ${res.count} tarefas sincronizadas com a tabela crm_tasks no Supabase.`);
      onConfigChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Conexão com Banco de Dados Supabase
              </h2>
              <p className="text-xs text-slate-500">
                Armazenamento de tarefas e status em tempo real no PostgreSQL do Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Status atual:</span>
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Conectado ao Supabase
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Modo Local (Offline com cache)
              </span>
            )}
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Painel Supabase</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Credentials Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzabcdefghijklm.supabase.co"
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Encontrado em: Supabase Dashboard → Settings → API → Project URL
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Encontrado em: Supabase Dashboard → Settings → API → Project API Keys (anon / public)
              </p>
            </div>

            {/* Test Connection Button & Status */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !url || !anonKey}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!url || !anonKey}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
              >
                Salvar Credenciais
              </button>

              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors ml-auto"
                >
                  Desconectar / Modo Local
                </button>
              )}
            </div>

            {/* Test Result Feedback */}
            {testResult && (
              <div
                className={`p-3.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                  testResult.success
                    ? testResult.tableExists
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}
              >
                {testResult.success ? (
                  testResult.tableExists ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{testResult.message}</p>
                  {!testResult.tableExists && testResult.success && (
                    <p className="mt-1 text-slate-600">
                      Copie o script SQL abaixo e execute no <strong>SQL Editor</strong> do Supabase para criar a tabela.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Migration / Sync Button */}
          {isConnected && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">
                    Sincronizar Tarefas Locais com o Supabase
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Subir as {tasks.length} tarefas atuais diretamente para o banco de dados Supabase
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Sincronizando...' : 'Subir Tarefas'}</span>
                </button>
              </div>

              {syncResult && (
                <p className="mt-2 text-xs font-medium text-emerald-800 bg-emerald-100/60 p-2 rounded">
                  {syncResult}
                </p>
              )}
            </div>
          )}

          {/* SQL Setup Script Section */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-semibold text-slate-800">
                  Script SQL para Criar a Tabela no Supabase
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-2">
              No seu Supabase Dashboard, vá em <strong>SQL Editor</strong> &gt; <strong>New Query</strong>, cole o código abaixo e clique em <strong>Run</strong>:
            </p>

            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
              <code>{SUPABASE_SETUP_SQL}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Você também pode definir <code className="font-mono text-slate-600">VITE_SUPABASE_URL</code> no arquivo <code className="font-mono text-slate-600">.env</code>.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
