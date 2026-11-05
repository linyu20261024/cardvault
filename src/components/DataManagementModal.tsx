import React, { useState } from 'react';
import { 
  X, Download, Upload, FileText, Database, Trash2, 
  Check, AlertTriangle, ShieldCheck, Github, Copy, RefreshCw
} from 'lucide-react';
import { CardRecord } from '../types/card';
import { 
  exportCardsToJson, importCardsFromJson, exportCardsToCsv, 
  SAMPLE_CARDS, saveStoredCards 
} from '../utils/storage';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardRecord[];
  onDataChanged: (newCards: CardRecord[]) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  cards,
  onDataChanged,
}) => {
  if (!isOpen) return null;

  const [jsonText, setJsonText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 导出 JSON
  const handleExportJson = () => {
    const jsonStr = exportCardsToJson(cards);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardvault_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ text: '已导出 JSON 备份文件，请妥善保存在本地安全路径。', type: 'success' });
  };

  // 导出 CSV
  const handleExportCsv = () => {
    const csvStr = exportCardsToCsv(cards);
    const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardvault_cards_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ text: '已导出 CSV 报表，可直接使用 Excel / WPS 打开查看。', type: 'success' });
  };

  // 文件导入 JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processJsonImport(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 文本粘贴导入
  const handlePasteImport = () => {
    if (!jsonText.trim()) {
      setMessage({ text: '请先粘贴有效的 JSON 文本。', type: 'error' });
      return;
    }
    processJsonImport(jsonText);
  };

  const processJsonImport = (rawJson: string) => {
    const result = importCardsFromJson(rawJson, importMode);
    if (result.success) {
      setMessage({ text: result.message, type: 'success' });
      // 重新读取并触发更新
      const raw = localStorage.getItem('cardvault_cards_v1');
      if (raw) {
        onDataChanged(JSON.parse(raw));
      }
      setJsonText('');
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
  };

  // 重置为演示卡组
  const handleLoadSample = () => {
    if (confirm('确认载入预设高拟真卡片数据（招行经典白、工银黑金、广发多利卡、建行汽车卡及储蓄卡）吗？')) {
      saveStoredCards(SAMPLE_CARDS);
      onDataChanged(SAMPLE_CARDS);
      setMessage({ text: '已成功载入预置演示卡组。', type: 'success' });
    }
  };

  // 清空全部
  const handleClearAll = () => {
    if (confirm('⚠️ 警告：该操作将清空本地保存的所有卡片与账单数据！此操作无法撤销，确定继续吗？')) {
      saveStoredCards([]);
      onDataChanged([]);
      setMessage({ text: '已清空本地所有卡片数据。', type: 'success' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              本地数据管理与备份导出
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Notification Alert */}
          {message && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
            }`}>
              {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* GitHub Hosting & Privacy Assurance Banner */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% 离线本地优先架构 & GitHub 托管指南</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-xs">
              本工具不依赖任何外部后端数据库或第三方统计服务，所有信用卡号、账单日、还款金额和年费政策全部保存在您浏览器的 LocalStorage 中，断网离线亦可完整使用。
            </p>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
              <Github className="w-3.5 h-3.5 text-neutral-400" />
              <span>支持直接将源码推送到 GitHub，并通过 GitHub Pages / Vercel 进行免费静态部署。</span>
            </div>
          </div>

          {/* 1. 导出备份 (Export) */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-neutral-500" />
              <span>备份与数据导出</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportJson}
                className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white bg-white dark:bg-neutral-800/80 text-left transition-all group"
              >
                <div className="font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>导出 JSON 备份文件</span>
                  <Download className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white" />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  包含所有卡片、还款日设定、年费刷卡日志的完整本地存档。
                </p>
              </button>

              <button
                onClick={handleExportCsv}
                className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white bg-white dark:bg-neutral-800/80 text-left transition-all group"
              >
                <div className="font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                  <span>导出 CSV 电子表格</span>
                  <FileText className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white" />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  兼容 Excel 与 WPS，适合在电脑上打印或整理归档。
                </p>
              </button>
            </div>
          </div>

          {/* 2. 导入数据 (Import) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-neutral-500" />
                <span>导入已有卡片数据</span>
              </h4>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-500">导入策略:</span>
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as any)}
                  className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-[11px]"
                >
                  <option value="merge">合并导入 (保留现有卡片)</option>
                  <option value="overwrite">覆盖导入 (替换全部数据)</option>
                </select>
              </div>
            </div>

            {/* 文件选择上传 */}
            <div className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-4 text-center hover:border-neutral-400 transition-colors">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
              <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                点击选择或拖放 JSON 备份文件至此
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                支持先前导出的 .json 格式备份
              </div>
            </div>

            {/* 直接粘贴 JSON 文本 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                或直接粘贴 JSON 格式数据:
              </label>
              <textarea
                rows={3}
                placeholder='[{"bankName": "招商银行", "cardName": "白金卡", "cardNumber": "6225...", ...}]'
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-[11px] text-neutral-900 dark:text-white"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePasteImport}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold transition-all"
                >
                  解析并导入文本
                </button>
              </div>
            </div>
          </div>

          {/* 3. 预设演示与数据清空 (Danger Zone & Demo) */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <button
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重载预置演示卡组</span>
            </button>

            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空本地全部数据</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
