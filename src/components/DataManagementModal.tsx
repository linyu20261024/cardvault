import React, { useState } from 'react';
import { 
  X, Download, Upload, FileText, Database, Trash2, 
  Check, AlertTriangle, ShieldCheck, Github, Copy, RefreshCw, 
  Camera, FileSpreadsheet, Sparkles, HelpCircle, FileCheck, Loader2
} from 'lucide-react';
import { CardRecord } from '../types/card';
import { 
  exportCardsToJson, importCardsFromJson, exportCardsToCsv, 
  exportCardsToExcelBlob, getStandardExcelTemplateBlob,
  parseCsvToCards, parseUploadedFileToCards, getStandardCsvTemplate, 
  SAMPLE_CARDS, saveStoredCards, removeSampleCards, isSampleCard 
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

  const [activeTab, setActiveTab] = useState<'excel' | 'json'>('excel');
  const [jsonText, setJsonText] = useState('');
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importedCardsCount, setImportedCardsCount] = useState<number | null>(null);
  const [showFeeTips, setShowFeeTips] = useState(false);

  // 导出 Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const blob = exportCardsToExcelBlob(cards);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cardvault_cards_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ text: '已成功导出 Excel (.xlsx) 工作簿，可直接双击用 Excel / WPS 打开。', type: 'success' });
    } catch (err: any) {
      setMessage({ text: `导出 Excel 失败: ${err.message}`, type: 'error' });
    }
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
    setMessage({ text: '已成功导出带 UTF-8 BOM 的 CSV 报表（防乱码）。', type: 'success' });
  };

  // 下载 Excel (.xlsx) 模板
  const handleDownloadExcelTemplate = () => {
    try {
      const blob = getStandardExcelTemplateBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cardvault_template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ text: '已下载标准 Excel (.xlsx) 模板，直接在 Excel 或 WPS 中编辑最方便且绝无乱码！', type: 'success' });
    } catch (err: any) {
      setMessage({ text: `下载 Excel 模板失败: ${err.message}`, type: 'error' });
    }
  };

  // 下载 CSV 模板
  const handleDownloadCsvTemplate = () => {
    const templateStr = getStandardCsvTemplate();
    const blob = new Blob(['\uFEFF' + templateStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cardvault_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ text: '已下载标准 CSV 模板（已添加防乱码 UTF-8 BOM 标头）。', type: 'success' });
  };

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

  // 处理上传的表格文件
  const processSpreadsheetFile = async (file: File) => {
    setIsProcessing(true);
    setMessage(null);
    setImportedCardsCount(null);

    try {
      const result = await parseUploadedFileToCards(file, importMode);
      if (result.success && result.cards && result.cards.length > 0) {
        setMessage({ text: result.message, type: 'success' });
        setImportedCardsCount(result.cards.length);
        onDataChanged(result.cards);
      } else {
        setMessage({ text: result.message || '表格中未匹配到有效银行卡数据，请确认表格格式。', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `导入异常: ${err.message || '未知错误'}`, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpreadsheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSpreadsheetFile(file);
    e.target.value = '';
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
              数据导入与批量维护中心
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

          {/* 导入成功快捷查看卡包横幅 */}
          {importedCardsCount !== null && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-xs">🎉 成功导入 {importedCardsCount} 张银行卡！</div>
                  <div className="text-[11px] opacity-80 mt-0.5">卡包与额度概览已实时刷新，已重置全部筛选条件。</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold whitespace-nowrap text-xs transition-colors shadow-xs"
              >
                立即查看我的卡包
              </button>
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
                  <span>单张卡快速录入：使用「拍卡智能识别」</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  手机拍照或截图，AI 自动提取卡号、银行与有效期并核对导入。
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
              <span>拍照提取</span>
            </button>
          </div>

          {/* Import / Export Format Tabs */}
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('excel')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'excel'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.xlsx) / CSV 批量导入 (推荐)</span>
              </button>
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
                <span>JSON 格式备份</span>
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
                <option value="overwrite">全量覆盖 (彻底替换历史样卡与脏数据)</option>
                <option value="merge">增量合并 (保留现有真实卡片)</option>
              </select>
            </div>
          </div>

          {/* ================= TAB 1: EXCEL / CSV 表格维护 ================= */}
          {activeTab === 'excel' && (
            <div className="space-y-4">
              
              {/* 核心特性解答说明 */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    <span>表格批量维护要点（额度共享 & 隐私保护）</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFeeTips(!showFeeTips)}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showFeeTips ? '收起填写技巧' : '查看表头与年费填写技巧'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed pl-1 space-y-1">
                  <div>
                    <strong>① 个人隐私安全：</strong>
                    <span className="text-neutral-500 dark:text-neutral-400 ml-1">
                      持卡人姓名完全选填！为了个人金融隐私，<strong>表格中无需填写真实姓名，可直接留空</strong>。
                    </span>
                  </div>
                  <div>
                    <strong>② 额度共享支持：</strong>
                    <span className="text-neutral-500 dark:text-neutral-400 ml-1">
                      国内同银行信用卡默认共享同一额度池，系统已在“额度概览”中为您自动去重合并，避免授信虚高。
                    </span>
                  </div>
                  <div>
                    <strong>③ 动态表头自适应：</strong>
                    <span className="text-neutral-500 dark:text-neutral-400 ml-1">
                      系统采用智能模糊列头匹配，即使您在 Excel 里调换列顺序、删除不需要的列，也能精准识别导入。
                    </span>
                  </div>
                </div>

                {showFeeTips && (
                  <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 text-[11px] space-y-1 bg-white dark:bg-neutral-900/60 p-2.5 rounded-lg text-neutral-700 dark:text-neutral-300 font-mono">
                    <div className="font-bold text-neutral-900 dark:text-white font-sans text-xs mb-1">
                      💡 常见年费填写范例（支持任意自然语言，自动抽取指标）：
                    </div>
                    <div>• 刷卡次数免：<code>刷满6笔免年费</code> / <code>年刷12次</code> / <code>首年免次年刷6次免</code></div>
                    <div>• 消费金额免：<code>每年消费满20000元免</code> / <code>满3万免</code> / <code>年消费5000元</code></div>
                    <div>• 积分兑换免：<code>10000积分兑换次年年费</code> / <code>1万分抵扣</code></div>
                    <div>• 刚性年费款：<code>刚性年费3600元不可减免</code> / <code>刚性200元</code></div>
                    <div>• 终身全免类：<code>终身免年费</code> / <code>借记卡无年费</code></div>
                  </div>
                )}
              </div>

              {/* 模板下载与导出区域 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Excel 专区 */}
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 flex flex-col justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span>原生 Excel (.xlsx) 模板与导出</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      直接用 Microsoft Excel 或 WPS 双击打开填写，格式规范、绝无乱码。
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadExcelTemplate}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载 Excel 模板 (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 font-semibold text-neutral-700 dark:text-neutral-200 transition-colors text-[11px]"
                    >
                      导出 .xlsx
                    </button>
                  </div>
                </div>

                {/* CSV 专区 */}
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 flex flex-col justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>CSV 格式模板与导出 (带 UTF-8 BOM)</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      通用表格格式，已内置 UTF-8 与 GBK 智能探测，绝无乱码。
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadCsvTemplate}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 font-semibold text-neutral-700 dark:text-neutral-200 transition-colors text-[11px]"
                    >
                      下载 CSV 模板
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 font-semibold text-neutral-700 dark:text-neutral-200 transition-colors text-[11px]"
                    >
                      导出 .csv
                    </button>
                  </div>
                </div>

              </div>

              {/* 上传区域：同时支持 .xlsx, .xls, .csv 及拖拽 */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processSpreadsheetFile(file);
                }}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-500/20 scale-[1.01]' 
                    : 'border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                }`}
              >
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleSpreadsheetUpload}
                  disabled={isProcessing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-2">
                    <Loader2 className="w-7 h-7 text-emerald-500 animate-spin mb-2" />
                    <div className="font-bold text-neutral-900 dark:text-white text-xs">
                      正在智能解析并匹配卡片数据...
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      正在提取银行、额度性质、账单日及年费规则
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mx-auto text-emerald-500 mb-1.5" />
                    <div className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                      点击上传 或 拖拽填写好的 Excel (.xlsx / .xls) 或 CSV 文件至此
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      当前策略：<strong className="text-neutral-700 dark:text-neutral-300">{importMode === 'overwrite' ? '全量覆盖（推荐，彻底替换样卡）' : '增量合并'}</strong>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}

          {/* ================= TAB 2: JSON 格式备份与恢复 ================= */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-neutral-500" />
                    <span>导出全量卡片 JSON 备份文件</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    包含现有 {cards.length} 张卡片、还款日参数、完整刷卡流水记录与私密备忘。
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
                  系统会自动校验卡片字段并根据当前策略（{importMode === 'merge' ? '增量合并' : '全量覆盖'}）导入
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
