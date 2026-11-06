import React, { useState } from 'react';
import { 
  X, Download, Upload, FileText, Database, Trash2, 
  Check, AlertTriangle, ShieldCheck, Github, Copy, RefreshCw, 
  Camera, FileSpreadsheet, Sparkles
} from 'lucide-react';
import { CardRecord } from '../types/card';
import { 
  exportCardsToJson, importCardsFromJson, exportCardsToCsv, 
  parseCsvToCards, getStandardCsvTemplate, SAMPLE_CARDS, saveStoredCards,
  removeSampleCards, isSampleCard 
} from '../utils/storage';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardRecord[];
  onDataChanged: (newCards: CardRecord[]) => void;
  onOpenCardScan: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  cards,
  onDataChanged,
  onOpenCardScan,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'json' | 'csv'>('json');
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
    setMessage({ text: '已成功导出 JSON 备份文件，请妥善保存在本地安全路径。', type: 'success' });
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
    setMessage({ text: '已成功导出 CSV 报表，可直接使用 Excel / WPS 打开查看。', type: 'success' });
  };

  // 下载标准 CSV 模板
  const handleDownloadTemplate = () => {
    const templateStr = getStandardCsvTemplate();
    const blob = new Blob(['\uFEFF' + templateStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cardvault_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ text: '已下载标准 CSV 导入模板，可在 Excel 中填写卡片后上传。', type: 'success' });
  };

  // 文件导入 JSON
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // 文件导入 CSV
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = parseCsvToCards(content, importMode);
        if (result.success) {
          setMessage({ text: result.message, type: 'success' });
          const raw = localStorage.getItem('cardvault_cards_v1');
          if (raw) onDataChanged(JSON.parse(raw));
        } else {
          setMessage({ text: result.message, type: 'error' });
        }
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  // 文本粘贴导入 JSON
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
      const raw = localStorage.getItem('cardvault_cards_v1');
      if (raw) onDataChanged(JSON.parse(raw));
      setJsonText('');
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
  };

  const hasSampleCards = cards.some(c => isSampleCard(c));

  // 仅清除演示样卡，保留真实卡片
  const handleClearSampleOnly = () => {
    if (confirm('确认清除系统预设的 6 张演示样卡吗？您自己添加或导入的真实卡片会完好保留。')) {
      const cleanCards = removeSampleCards(cards);
      saveStoredCards(cleanCards);
      onDataChanged(cleanCards);
      setMessage({ text: '已清除系统预设的全部演示样卡，当前卡包已为您净化就绪！', type: 'success' });
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
              数据稳定导入与备份导出中心
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          
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

          {/* Quick OCR Banner: 拍卡导入 */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-bold shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-neutral-900 dark:text-white text-xs flex items-center gap-1.5">
                  <span>不想手动录入？使用「拍卡智能识别提取」</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  手机拍照或上传卡片照片，AI 自动提取卡号、银行、持卡人与有效期，并在屏幕对照确认后一键导入。
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenCardScan();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold whitespace-nowrap shrink-0 shadow-xs transition-colors flex items-center gap-1"
            >
              <span>立即拍照提取</span>
            </button>
          </div>

          {/* Import / Export Format Tabs */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'json'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>JSON 完整备份恢复 (推荐)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('csv')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'csv'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV / Excel 表格批量导入</span>
              </button>
            </div>

            {/* Import Strategy */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-neutral-500">导入策略:</span>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as any)}
                className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-[11px] font-medium"
              >
                <option value="merge">增量合并 (保留现有卡片)</option>
                <option value="overwrite">全量覆盖 (重置为导入数据)</option>
              </select>
            </div>
          </div>

          {/* ================= TAB 1: JSON 备份与导入 ================= */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              
              {/* 导出 JSON 按钮 */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-neutral-500" />
                    <span>导出全量卡片 JSON 备份文件</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    包含现有 {cards.length} 张卡片、还款日参数、刷免进度记录与私密备忘。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold transition-colors"
                >
                  下载 .json 备份
                </button>
              </div>

              {/* 上传 JSON 文件 */}
              <div className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-5 text-center hover:border-neutral-400 transition-colors bg-neutral-50/50 dark:bg-neutral-800/40">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJsonFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs">
                  点击选择 或 拖拽已备份的 .json 文件至此
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  系统会自动校验卡片字段并根据上方选择的模式（{importMode === 'merge' ? '增量合并' : '全量覆盖'}）进行导入
                </div>
              </div>

              {/* 粘贴 JSON 文本 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  或者直接粘贴 JSON 文本：
                </label>
                <textarea
                  rows={3}
                  placeholder='[{"bankName": "招商银行", "cardName": "经典白金卡", "cardNumber": "6225...", ...}]'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-[11px] text-neutral-900 dark:text-white"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePasteImport}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold"
                  >
                    解析并导入文本
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: CSV / Excel 表格导入与模板 ================= */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              
              {/* 批量维护真实卡片三步法指引 */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>批量维护真实卡片并导入的操作指南：</span>
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed pl-1 space-y-0.5">
                  <div><strong>1. 下载模板：</strong>点击下方【下载表格模板 (.csv)】，用 Excel 或 WPS 打开；</div>
                  <div><strong>2. 批量填写：</strong>对照表头填入您的真实发卡银行、卡号、额度、账单日与年费规则；</div>
                  <div><strong>3. 一键拖入覆盖：</strong>右上角导入策略选择【全量覆盖】（可彻底替换掉初始样卡）并拖入下方上传即可！</div>
                </div>
              </div>

              {/* CSV 模板下载与导出 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 flex flex-col justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span>下载标准 Excel / CSV 模板</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      下载标准格式表格模板，直接用 Excel 或 WPS 打开填写后上传。
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 font-semibold text-neutral-700 dark:text-neutral-200 transition-colors"
                    >
                      下载表格模板 (.csv)
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 flex flex-col justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-neutral-500" />
                      <span>导出当前全部卡片为 CSV</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      将现有卡包导出为表格，方便打印、核对与离线存档。
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold transition-colors"
                    >
                      导出 CSV 表格
                    </button>
                  </div>
                </div>
              </div>

              {/* 上传填写好的 CSV 文件 */}
              <div className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-5 text-center hover:border-neutral-400 transition-colors bg-neutral-50/50 dark:bg-neutral-800/40">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs">
                  点击上传 或 拖拽填写好的 .csv 电子表格至此
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  支持多卡一次性批量导入，系统会自动适配卡号、银行与年费规则
                </div>
              </div>

            </div>
          )}

          {/* 底部重载与危险区 */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {hasSampleCards && (
                <button
                  type="button"
                  onClick={handleClearSampleOnly}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>仅清除预设演示卡片（保留我的卡）</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>重载预置演示卡组</span>
              </button>
            </div>

            <button
              type="button"
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
