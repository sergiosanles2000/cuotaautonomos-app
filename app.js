
// CuotaAutónomos - Interactive Engine (Pure Client-side, High Performance)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('autonomo-form');
  const regForm = document.getElementById('reg-form');

  // Input Elements
  const annualIncomeInput = document.getElementById('annualIncome');
  const annualExpensesInput = document.getElementById('annualExpenses');
  const annualSSInput = document.getElementById('annualSS');
  const workerTypeSelect = document.getElementById('workerType');
  const calcYearSelect = document.getElementById('calcYear');
  const flatRateCheck = document.getElementById('flatRate');

  // Output Elements
  const resMonthlyNet = document.getElementById('resMonthlyNet');
  const resBracketCode = document.getElementById('resBracketCode');
  const resMonthlyQuota = document.getElementById('resMonthlyQuota');
  const resAnnualQuota = document.getElementById('resAnnualQuota');
  const resBaseMin = document.getElementById('resBaseMin');
  const resBaseMax = document.getElementById('resBaseMax');

  // Regularization Elements
  const regProvisionalInput = document.getElementById('regProvisional');
  const regRealNetInput = document.getElementById('regRealNet');
  const regBalanceEl = document.getElementById('regBalance');
  const regStatusEl = document.getElementById('regStatus');

  const BRACKETS_2024_2026 = [
    { id: 1, code: 'R1', name: 'Tabla Reducida 1', min: 0, max: 670, bMin24: 735.29, bMax24: 816.98, bMin25: 653.59, bMax25: 718.94 },
    { id: 2, code: 'R2', name: 'Tabla Reducida 2', min: 670.01, max: 900, bMin24: 816.99, bMax24: 900, bMin25: 718.95, bMax25: 900 },
    { id: 3, code: 'R3', name: 'Tabla Reducida 3', min: 900.01, max: 1166.70, bMin24: 872.55, bMax24: 1166.70, bMin25: 849.67, bMax25: 1166.70 },
    { id: 4, code: 'G1', name: 'Tabla General 1', min: 1166.71, max: 1300, bMin24: 950.98, bMax24: 1300, bMin25: 950.98, bMax25: 1300 },
    { id: 5, code: 'G2', name: 'Tabla General 2', min: 1300.01, max: 1500, bMin24: 960.78, bMax24: 1500, bMin25: 960.78, bMax25: 1500 },
    { id: 6, code: 'G3', name: 'Tabla General 3', min: 1500.01, max: 1700, bMin24: 960.78, bMax24: 1700, bMin25: 960.78, bMax25: 1700 },
    { id: 7, code: 'G4', name: 'Tabla General 4', min: 1700.01, max: 1850, bMin24: 1045.75, bMax24: 1850, bMin25: 1143.79, bMax25: 1850 },
    { id: 8, code: 'G5', name: 'Tabla General 5', min: 1850.01, max: 2030, bMin24: 1062.09, bMax24: 2030, bMin25: 1209.15, bMax25: 2030 },
    { id: 9, code: 'G6', name: 'Tabla General 6', min: 2030.01, max: 2330, bMin24: 1078.43, bMax24: 2330, bMin25: 1274.51, bMax25: 2330 },
    { id: 10, code: 'G7', name: 'Tabla General 7', min: 2330.01, max: 2760, bMin24: 1111.11, bMax24: 2760, bMin25: 1356.21, bMax25: 2760 },
    { id: 11, code: 'G8', name: 'Tabla General 8', min: 2760.01, max: 3190, bMin24: 1176.47, bMax24: 3190, bMin25: 1437.91, bMax25: 3190 },
    { id: 12, code: 'G9', name: 'Tabla General 9', min: 3190.01, max: 3620, bMin24: 1241.83, bMax24: 3620, bMin25: 1519.61, bMax25: 3620 },
    { id: 13, code: 'G10', name: 'Tabla General 10', min: 3620.01, max: 4050, bMin24: 1307.19, bMax24: 4050, bMin25: 1601.31, bMax25: 4050 },
    { id: 14, code: 'G11', name: 'Tabla General 11', min: 4050.01, max: 6000, bMin24: 1454.25, bMax24: 4720.50, bMin25: 1732.03, bMax25: 4720.50 },
    { id: 15, code: 'G12', name: 'Tabla General 12', min: 6000.01, max: Infinity, bMin24: 1732.03, bMax24: 4720.50, bMin25: 1928.10, bMax25: 4720.50 }
  ];

  function formatEur(val) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  }

  function recalculateQuota() {
    const gross = parseFloat(annualIncomeInput.value) || 0;
    const expenses = parseFloat(annualExpensesInput.value) || 0;
    const ss = parseFloat(annualSSInput.value) || 0;
    const isCorp = workerTypeSelect.value === 'corporate';
    const year = parseInt(calcYearSelect.value, 10) || 2026;
    const isFlat = flatRateCheck.checked;

    // TGSS net computable income formula
    const priorNet = Math.max(0, (gross - expenses) + ss);
    const deduction = isCorp ? 0.03 : 0.07;
    const computableAnnual = priorNet * (1 - deduction);
    const computableMonthly = computableAnnual / 12;

    // Contribution rates
    const rate = year === 2024 ? 0.3130 : 0.3140;

    // Find bracket
    let bracket = BRACKETS_2024_2026[BRACKETS_2024_2026.length - 1];
    for (const b of BRACKETS_2024_2026) {
      if (computableMonthly >= b.min && computableMonthly <= b.max) {
        bracket = b;
        break;
      }
    }

    const baseMin = year === 2024 ? bracket.bMin24 : bracket.bMin25;
    const baseMax = year === 2024 ? bracket.bMax24 : bracket.bMax25;
    const monthlyQuota = isFlat ? 80.00 : (baseMin * rate);

    resMonthlyNet.textContent = formatEur(computableMonthly);
    resBracketCode.textContent = `${bracket.code} (${bracket.name})`;
    resMonthlyQuota.textContent = formatEur(monthlyQuota);
    resAnnualQuota.textContent = formatEur(monthlyQuota * 12);
    resBaseMin.textContent = formatEur(baseMin);
    resBaseMax.textContent = formatEur(baseMax);

    if (window.enterpriseTrack) {
      window.enterpriseTrack('calculate_autonomo_quota', {
        year: year,
        bracket: bracket.code,
        monthly_quota: monthlyQuota
      });
    }
  }

  function recalculateRegularization() {
    const prov = parseFloat(regProvisionalInput.value) || 0;
    const realAnnual = parseFloat(regRealNetInput.value) || 0;
    const monthlyNet = realAnnual / 12;

    let bracket = BRACKETS_2024_2026[BRACKETS_2024_2026.length - 1];
    for (const b of BRACKETS_2024_2026) {
      if (monthlyNet >= b.min && monthlyNet <= b.max) {
        bracket = b;
        break;
      }
    }

    const baseMin = bracket.bMin25;
    const quotaReq = baseMin * 0.3140;
    const totalPaid = prov * 12;
    const totalReq = quotaReq * 12;
    const balance = totalPaid - totalReq;

    regBalanceEl.textContent = formatEur(Math.abs(balance));
    if (balance > 0.05) {
      regStatusEl.textContent = 'A devolver por la Seguridad Social a tu favor';
      regStatusEl.className = 'status-positive';
    } else if (balance < -0.05) {
      regStatusEl.textContent = 'A ingresar a la Seguridad Social (regularización a pagar)';
      regStatusEl.className = 'status-negative';
    } else {
      regStatusEl.textContent = 'Cotización ajustada al tramo exacto (saldo 0 €)';
      regStatusEl.className = 'status-neutral';
    }
  }

  // Attach listeners
  form.addEventListener('input', recalculateQuota);
  form.addEventListener('change', recalculateQuota);
  regForm.addEventListener('input', recalculateRegularization);

  // Initial calculation
  recalculateQuota();
  recalculateRegularization();
});
