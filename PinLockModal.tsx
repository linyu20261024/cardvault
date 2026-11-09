import React, { useState } from 'react';
import { Shield, Lock, Unlock, X, KeyRound, AlertCircle } from 'lucide-react';

interface PinLockModalProps {
  isOpen: boolean;
  isScreenLocked: boolean;
  currentPin?: string;
  onClose: () => void;
  onSetPin: (newPin: string | undefined) => void;
  onUnlock: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  isScreenLocked,
  currentPin,
  onClose,
  onSetPin,
  onUnlock,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen && !isScreenLocked) return null;

  // 如果处于锁屏状态
  if (isScreenLocked) {
    const handleVerifyPin = (e: React.FormEvent) => {
      e.preventDefault();
      if (pinInput === currentPin) {
        setError('');
        setPinInput('');
        onUnlock();
      } else {
        setError('PIN 码错误，请重试');
        setPinInput('');
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center p-4 select-none">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center text-white shadow-2xl">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">CardVault 已锁定</h2>
          <p className="text-xs text-neutral-400 mt-1">请输入 4-6 位安全 PIN 码以查看卡片信息</p>

          <form onSubmit={handleVerifyPin} className="mt-6 space-y-4">
            <input
              type="password"
              maxLength={6}
              autoFocus
              placeholder="••••"
              value={pinInput}
              onChange={(e) => {
                setError('');
                setPinInput(e.target.value.replace(/\D/g, ''));
              }}
              className="w-full py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-white focus:outline-hidden focus:border-amber-500"
            />

            {error && (
              <div className="text-xs text-rose-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-sm transition-all shadow-sm"
            >
              解锁
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 设置或修改 PIN 码弹窗
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput) {
      // 清除 PIN
      onSetPin(undefined);
      onClose();
      return;
    }
    if (pinInput.length < 4) {
      setError('PIN 码至少需要 4 位纯数字');
      return;
    }
    if (pinInput !== confirmPin) {
      setError('两次输入的 PIN 码不一致');
      return;
    }
    onSetPin(pinInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {currentPin ? '修改安全锁 PIN 码' : '开启安全访问锁'}
            </h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <p className="text-neutral-500 leading-relaxed">
            设置 PIN 码后，可在离开屏幕时快速一键锁屏，保护您的信用卡卡号、安全码与额度隐私。
          </p>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              {currentPin ? '新 PIN 码 (留空则取消密码保护)' : '设置 4-6 位数字 PIN 码'}
            </label>
            <input
              type="password"
              maxLength={6}
              placeholder="4-6 位数字"
              value={pinInput}
              onChange={(e) => {
                setError('');
                setPinInput(e.target.value.replace(/\D/g, ''));
              }}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-center text-lg tracking-widest text-neutral-900 dark:text-white"
            />
          </div>

          {pinInput && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                再次确认 PIN 码
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="重复输入"
                value={confirmPin}
                onChange={(e) => {
                  setError('');
                  setConfirmPin(e.target.value.replace(/\D/g, ''));
                }}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg font-mono text-center text-lg tracking-widest text-neutral-900 dark:text-white"
              />
            </div>
          )}

          {error && (
            <div className="text-rose-500 text-[11px]">{error}</div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold"
            >
              保存设置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
