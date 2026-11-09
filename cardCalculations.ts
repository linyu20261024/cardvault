import { CardRecord, AnnualFeePolicy } from '../types/card';

export interface BillStatusResult {
  hasBill: boolean;
  statementDate: Date;
  dueDate: Date;
  statementDateStr: string;
  dueDateStr: string;
  daysUntilDue: number; // 负数表示逾期天数，0表示今日到期，正数表示剩余天数
  status: 'paid' | 'overdue' | 'due_today' | 'due_soon' | 'unpaid' | 'unbilled';
  statusText: string;
  statusBadgeClass: string;
  todayGracePeriodDays: number; // 今天刷卡可享受的免息天数
  isBestCardToSwipeToday: boolean;
}

export interface AnnualFeeStatusResult {
  status: 'lifetime_free' | 'waived' | 'urgent' | 'warning' | 'in_progress' | 'charge_fixed';
  statusText: string;
  statusBadgeClass: string;
  progressPercent: number;
  daysRemaining: number;
  isUrgent: boolean; // 是否需要紧急提醒
  advice: string;
}

// 辅助函数：根据年月与指定日期生成合法 Date
function createSafeDate(year: number, monthIndex: number, day: number): Date {
  // 获取该月最大天数
  const maxDay = new Date(year, monthIndex + 1, 0).getDate();
  const safeDay = Math.min(day, maxDay);
  return new Date(year, monthIndex, safeDay, 0, 0, 0, 0);
}

/**
 * 计算信用卡的账单状态、还款倒计时及今日刷卡免息期
 */
export function calculateBillStatus(card: CardRecord, referenceDate: Date = new Date()): BillStatusResult {
  if (card.type !== 'credit') {
    const today = new Date(referenceDate);
    return {
      hasBill: false,
      statementDate: today,
      dueDate: today,
      statementDateStr: '-',
      dueDateStr: '-',
      daysUntilDue: 0,
      status: 'unbilled',
      statusText: '储蓄卡',
      statusBadgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      todayGracePeriodDays: 0,
      isBestCardToSwipeToday: false,
    };
  }

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const curYear = today.getFullYear();
  const curMonth = today.getMonth(); // 0-11
  const curDay = today.getDate();

  const stmtDay = card.statementDay || 1;
  
  // 计算本期最近的账单日
  // 如果今天 >= 账单日，则本期账单日就是这个月的 stmtDay；否则就是上个月的 stmtDay
  let currentStmtDate: Date;
  let nextStmtDate: Date;

  if (curDay >= stmtDay) {
    currentStmtDate = createSafeDate(curYear, curMonth, stmtDay);
    nextStmtDate = createSafeDate(curYear, curMonth + 1, stmtDay);
  } else {
    currentStmtDate = createSafeDate(curYear, curMonth - 1, stmtDay);
    nextStmtDate = createSafeDate(curYear, curMonth, stmtDay);
  }

  // 计算对应的还款日
  let dueDate: Date;
  if (card.dueDayType === 'daysAfterStatement' && card.dueDaysOffset) {
    dueDate = new Date(currentStmtDate);
    dueDate.setDate(dueDate.getDate() + Number(card.dueDaysOffset));
  } else {
    const dDay = card.dueDay || 20;
    // 如果还款日数字小于账单日数字，通常意味着还款日是下个月
    if (dDay <= stmtDay) {
      dueDate = createSafeDate(currentStmtDate.getFullYear(), currentStmtDate.getMonth() + 1, dDay);
    } else {
      dueDate = createSafeDate(currentStmtDate.getFullYear(), currentStmtDate.getMonth(), dDay);
    }
  }

  // 如果已超过上述计算的 dueDate，说明该周期已经过去，计算下一个周期的账单与还款
  // 但如果用户标记还有未还金额，则该周期是逾期
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / msPerDay);

  let status: BillStatusResult['status'] = 'unpaid';
  let statusText = '待还款';
  let statusBadgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

  if (card.isBillPaid || card.currentBillAmount <= 0) {
    status = 'paid';
    statusText = '本期已还清';
    statusBadgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  } else if (daysUntilDue < 0) {
    status = 'overdue';
    statusText = `已逾期 ${Math.abs(daysUntilDue)} 天`;
    statusBadgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
  } else if (daysUntilDue === 0) {
    status = 'due_today';
    statusText = '今日最后还款日';
    statusBadgeClass = 'bg-rose-500/20 text-rose-600 dark:text-rose-300 font-semibold border-rose-500/40';
  } else if (daysUntilDue <= 5) {
    status = 'due_soon';
    statusText = `仅剩 ${daysUntilDue} 天还款`;
    statusBadgeClass = 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
  } else {
    status = 'unpaid';
    statusText = `距离还款 ${daysUntilDue} 天`;
    statusBadgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  }

  // -------------------------------------------------------------
  // 计算今天刷卡免息期 (Grace Period Calculation)
  // 如果今天刷卡：
  // 1. 若今天 <= 当前月份账单日，该笔消费会在本月账单日出账，在当前 dueDate 还款。
  // 2. 若今天 > 当前月份账单日，该笔消费会在下月账单日 (nextStmtDate) 出账，并在下期还款日还款！
  // -------------------------------------------------------------
  let swipeBillStmtDate: Date;
  if (curDay <= stmtDay) {
    // 本月还没过账单日，今天刷卡本月出账
    swipeBillStmtDate = createSafeDate(curYear, curMonth, stmtDay);
  } else {
    // 已经过了本月账单日，今天刷卡下月出账！最长免息期！
    swipeBillStmtDate = createSafeDate(curYear, curMonth + 1, stmtDay);
  }

  let swipeDueDate: Date;
  if (card.dueDayType === 'daysAfterStatement' && card.dueDaysOffset) {
    swipeDueDate = new Date(swipeBillStmtDate);
    swipeDueDate.setDate(swipeDueDate.getDate() + Number(card.dueDaysOffset));
  } else {
    const dDay = card.dueDay || 20;
    if (dDay <= stmtDay) {
      swipeDueDate = createSafeDate(swipeBillStmtDate.getFullYear(), swipeBillStmtDate.getMonth() + 1, dDay);
    } else {
      swipeDueDate = createSafeDate(swipeBillStmtDate.getFullYear(), swipeBillStmtDate.getMonth(), dDay);
    }
  }

  const todayGracePeriodDays = Math.max(0, Math.round((swipeDueDate.getTime() - today.getTime()) / msPerDay));

  const formatLocalDate = (d: Date) => {
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return {
    hasBill: true,
    statementDate: currentStmtDate,
    dueDate,
    statementDateStr: formatLocalDate(currentStmtDate),
    dueDateStr: formatLocalDate(dueDate),
    daysUntilDue,
    status,
    statusText,
    statusBadgeClass,
    todayGracePeriodDays,
    isBestCardToSwipeToday: false, // 由外部横向比较后置位
  };
}

/**
 * 计算年费政策达标情况及提醒
 */
export function calculateAnnualFeeStatus(policy: AnnualFeePolicy, referenceDate: Date = new Date()): AnnualFeeStatusResult {
  if (policy.feeType === 'lifetimeFree') {
    return {
      status: 'lifetime_free',
      statusText: '终身免年费',
      statusBadgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      progressPercent: 100,
      daysRemaining: 999,
      isUrgent: false,
      advice: '该卡无年费收取担忧，放心使用。',
    };
  }

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  let daysRemaining = 365;
  if (policy.feeDueDate) {
    const feeDate = new Date(policy.feeDueDate);
    feeDate.setHours(0, 0, 0, 0);
    daysRemaining = Math.round((feeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (policy.feeType === 'fixedCharge') {
    const isUrgent = daysRemaining >= 0 && daysRemaining <= 30;
    return {
      status: 'charge_fixed',
      statusText: `刚性年费 ¥${policy.fixedChargeAmount || 0}`,
      statusBadgeClass: isUrgent 
        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
        : 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20',
      progressPercent: 0,
      daysRemaining,
      isUrgent,
      advice: daysRemaining < 0 
        ? '已过扣款日，请留意账单' 
        : `将在 ${daysRemaining} 天后扣收刚性年费 ¥${policy.fixedChargeAmount || 0}，请备足额度。`,
    };
  }

  // 刷卡次数免
  if (policy.feeType === 'swipeCount') {
    const target = policy.targetSwipeCount || 1;
    const current = policy.currentSwipeCount || 0;
    const progressPercent = Math.min(100, Math.round((current / target) * 100));
    const isWaived = current >= target;

    if (isWaived) {
      return {
        status: 'waived',
        statusText: `已达标 (${current}/${target}次)`,
        statusBadgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        progressPercent: 100,
        daysRemaining,
        isUrgent: false,
        advice: `本周期已刷 ${current} 次，免年费条件已完全达成！`,
      };
    }

    const needed = target - current;
    const isUrgent = daysRemaining <= 30 && daysRemaining >= 0;
    const isWarning = daysRemaining <= 60 && daysRemaining > 30;

    let statusBadgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    let status: AnnualFeeStatusResult['status'] = 'in_progress';
    if (isUrgent) {
      status = 'urgent';
      statusBadgeClass = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    } else if (isWarning) {
      status = 'warning';
      statusBadgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }

    return {
      status,
      statusText: `待刷 ${needed} 次 (${current}/${target})`,
      statusBadgeClass,
      progressPercent,
      daysRemaining,
      isUrgent,
      advice: `还需刷卡 ${needed} 次即可免次年年费，剩余 ${daysRemaining} 天到期。建议近期绑定微信/支付宝刷两笔小额！`,
    };
  }

  // 消费金额免
  if (policy.feeType === 'spendAmount') {
    const target = policy.targetSpendAmount || 1;
    const current = policy.currentSpendAmount || 0;
    const progressPercent = Math.min(100, Math.round((current / target) * 100));
    const isWaived = current >= target;

    if (isWaived) {
      return {
        status: 'waived',
        statusText: `金额达标 (已消费¥${current})`,
        statusBadgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        progressPercent: 100,
        daysRemaining,
        isUrgent: false,
        advice: `消费金额已满 ¥${target}，年费已豁免。`,
      };
    }

    const diff = target - current;
    const isUrgent = daysRemaining <= 30 && daysRemaining >= 0;

    return {
      status: isUrgent ? 'urgent' : 'in_progress',
      statusText: `还差 ¥${diff.toLocaleString()}`,
      statusBadgeClass: isUrgent 
        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      progressPercent,
      daysRemaining,
      isUrgent,
      advice: `还需消费 ¥${diff.toLocaleString()} 达标免年费，剩余 ${daysRemaining} 天。`,
    };
  }

  // 积分兑换
  return {
    status: 'in_progress',
    statusText: `需 ${policy.targetPoints || 0} 积分抵扣`,
    statusBadgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    progressPercent: 50,
    daysRemaining,
    isUrgent: daysRemaining <= 30 && daysRemaining >= 0,
    advice: `年费日可用 ${policy.targetPoints || 0} 信用卡积分进行年费冲抵。`,
  };
}

export interface BankCreditSummary {
  bankName: string;
  sharedLimit: number;          // 同行共享授信（该行开启共享的卡片中的最大额度）
  independentLimit: number;     // 独立额度卡片总和
  effectiveTotalLimit: number;  // 该行实际综合授信 = sharedLimit + independentLimit
  nominalTotalLimit: number;    // 单卡累加名义额度
  currentDebt: number;          // 当前应还负债总额
  availableCredit: number;      // 当前剩余可用额度
  cardCount: number;
  sharedCardsCount: number;
  independentCardsCount: number;
  cards: CardRecord[];
}

export interface TotalCreditOverview {
  effectiveTotalLimit: number;   // 真实总授信（已合并同行多卡共享额度）
  nominalTotalLimit: number;     // 单卡累加名义总额度
  deductedSharedLimit: number;   // 因共享额度去重掉的虚高额度 (nominalTotalLimit - effectiveTotalLimit)
  totalDebt: number;             // 当前总负债
  availableCredit: number;       // 实际剩余可用信用额度
  utilizationRate: number;       // 真实信用额度使用率 (0-100%)
  bankSummaries: BankCreditSummary[];
}

/**
 * 智能计算银行授信与额度共享汇总（同行多张信用卡默认共享同一额度池）
 */
export function calculateBankCreditSummaries(cards: CardRecord[]): TotalCreditOverview {
  const creditCards = cards.filter(c => c.type === 'credit');

  const bankGroups = new Map<string, CardRecord[]>();
  creditCards.forEach(c => {
    const bank = c.bankName || '其他银行';
    if (!bankGroups.has(bank)) bankGroups.set(bank, []);
    bankGroups.get(bank)!.push(c);
  });

  const bankSummaries: BankCreditSummary[] = [];
  let effectiveTotalLimit = 0;
  let nominalTotalLimit = 0;
  let totalDebt = 0;

  bankGroups.forEach((bankCards, bankName) => {
    // 默认同银行信用卡为共享额度（除非显式指定 isSharedLimit === false）
    const sharedCards = bankCards.filter(c => c.isSharedLimit !== false);
    const independentCards = bankCards.filter(c => c.isSharedLimit === false);

    // 共享额度：取同银行所有共享卡的最大授信额度（例如3张招行卡额度都是6万，该行共享总授信就是6万）
    const sharedLimit = sharedCards.length > 0 
      ? Math.max(...sharedCards.map(c => Number(c.creditLimit) || 0))
      : 0;
    
    // 独立额度：单独累加
    const independentLimit = independentCards.reduce((acc, c) => acc + (Number(c.creditLimit) || 0), 0);

    const bankEffectiveLimit = sharedLimit + independentLimit;
    const bankNominalLimit = bankCards.reduce((acc, c) => acc + (Number(c.creditLimit) || 0), 0);
    const bankDebt = bankCards.reduce((acc, c) => acc + (Number(c.currentBillAmount) || 0), 0);
    const bankAvailable = Math.max(0, bankEffectiveLimit - bankDebt);

    effectiveTotalLimit += bankEffectiveLimit;
    nominalTotalLimit += bankNominalLimit;
    totalDebt += bankDebt;

    bankSummaries.push({
      bankName,
      sharedLimit,
      independentLimit,
      effectiveTotalLimit: bankEffectiveLimit,
      nominalTotalLimit: bankNominalLimit,
      currentDebt: bankDebt,
      availableCredit: bankAvailable,
      cardCount: bankCards.length,
      sharedCardsCount: sharedCards.length,
      independentCardsCount: independentCards.length,
      cards: bankCards,
    });
  });

  const availableCredit = Math.max(0, effectiveTotalLimit - totalDebt);
  const utilizationRate = effectiveTotalLimit > 0 
    ? Math.round((totalDebt / effectiveTotalLimit) * 100) 
    : 0;

  return {
    effectiveTotalLimit,
    nominalTotalLimit,
    deductedSharedLimit: Math.max(0, nominalTotalLimit - effectiveTotalLimit),
    totalDebt,
    availableCredit,
    utilizationRate,
    bankSummaries,
  };
}

