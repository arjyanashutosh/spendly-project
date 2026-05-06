import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { addThousandsSeparator } from './helper';

export const downloadFinancialReport = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return false; // Indicating no transactions
  }

  const wb = XLSX.utils.book_new();

  // Determine period
  const dates = transactions.map(t => new Date(t.date).getTime()).filter(t => !isNaN(t));
  const minDate = dates.length ? new Date(Math.min(...dates)) : new Date();
  const maxDate = dates.length ? new Date(Math.max(...dates)) : new Date();
  const periodStr = `${minDate.toLocaleDateString('en-GB')} - ${maxDate.toLocaleDateString('en-GB')}`;

  // Calculate stats
  let totalIncome = 0;
  let totalExpenses = 0;
  let largestIncome = 0;
  let largestExpense = 0;

  transactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
      if (t.amount > largestIncome) largestIncome = t.amount;
    } else {
      totalExpenses += t.amount;
      if (t.amount > largestExpense) largestExpense = t.amount;
    }
  });

  const totalSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(2) : '0.00';
  
  // Calculate months diff for average
  const monthsDiff = Math.max(1, (maxDate.getFullYear() - minDate.getFullYear()) * 12 + maxDate.getMonth() - minDate.getMonth() + 1);
  const avgMonthlyIncome = totalIncome / monthsDiff;
  const avgMonthlySpend = totalExpenses / monthsDiff;

  // Sheet 1: Summary
  const summaryData = [
    ['Spendly Financial Report'], // Title row
    [''],
    ['Field', 'Value'],
    ['Report Generated On', new Date().toLocaleDateString('en-GB')],
    ['Report Period', periodStr],
    ['Total Income', `₹ ${addThousandsSeparator(totalIncome)}`],
    ['Total Expenses', `₹ ${addThousandsSeparator(totalExpenses)}`],
    ['Total Savings', `₹ ${addThousandsSeparator(totalSavings)}`],
    ['Total Spent', `₹ ${addThousandsSeparator(totalExpenses)}`],
    ['Savings Rate', `${savingsRate}%`],
    ['Largest Expense', `₹ ${addThousandsSeparator(largestExpense)}`],
    ['Largest Income', `₹ ${addThousandsSeparator(largestIncome)}`],
    ['Average Monthly Income', `₹ ${addThousandsSeparator(avgMonthlyIncome.toFixed(2))}`],
    ['Average Monthly Spend', `₹ ${addThousandsSeparator(avgMonthlySpend.toFixed(2))}`],
    ['Net Balance', `₹ ${addThousandsSeparator(totalSavings)}`]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  // Optional: Merge title row
  if(!wsSummary['!merges']) wsSummary['!merges'] = [];
  wsSummary['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 20 }];
  
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // Sheet 2: All Transactions
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  let runningBalance = totalSavings; // Will go backwards
  const allTxnsData = [['#', 'Date', 'Day', 'Type', 'Category', 'Description', 'Amount (₹)', 'Payment Method', 'Notes', 'Running Balance']];
  
  // To compute running balance forwards, sort ascending first
  const ascendingTxns = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  let balance = 0;
  const balanceMap = new Map();
  ascendingTxns.forEach(t => {
    if(t.type === 'income') balance += t.amount;
    else balance -= t.amount;
    balanceMap.set(t._id, balance);
  });

  sortedTransactions.forEach((t, index) => {
    const dateObj = new Date(t.date);
    allTxnsData.push([
      index + 1,
      dateObj.toLocaleDateString('en-GB'),
      dateObj.toLocaleDateString('en-GB', { weekday: 'short' }),
      t.type === 'income' ? 'Income' : 'Expense',
      t.category || t.source || 'Uncategorized', // income uses source
      t.description || t.items || '',
      t.amount,
      t.paymentMethod || '-',
      t.notes || '',
      balanceMap.get(t._id) || 0
    ]);
  });

  const wsAll = XLSX.utils.aoa_to_sheet(allTxnsData);
  XLSX.utils.book_append_sheet(wb, wsAll, "All Transactions");

  // Sheet 3: Income Breakdown
  const incomeTxns = sortedTransactions.filter(t => t.type === 'income');
  const incomeData = [['#', 'Date', 'Source/Category', 'Description', 'Amount (₹)', 'Payment Method', 'Notes']];
  incomeTxns.forEach((t, i) => {
    const dateObj = new Date(t.date);
    incomeData.push([
      i + 1,
      dateObj.toLocaleDateString('en-GB'),
      t.source || 'Uncategorized',
      t.description || '',
      t.amount,
      t.paymentMethod || '-',
      t.notes || ''
    ]);
  });
  incomeData.push(['', '', '', 'Total Income', totalIncome, '', '']);
  const wsIncome = XLSX.utils.aoa_to_sheet(incomeData);
  XLSX.utils.book_append_sheet(wb, wsIncome, "Income Breakdown");

  // Sheet 4: Expense Breakdown
  const expenseTxns = sortedTransactions.filter(t => t.type === 'expense');
  const expenseData = [['#', 'Date', 'Category', 'Description', 'Amount (₹)', 'Payment Method', 'Is Scanned Receipt', 'Notes']];
  expenseTxns.forEach((t, i) => {
    const dateObj = new Date(t.date);
    expenseData.push([
      i + 1,
      dateObj.toLocaleDateString('en-GB'),
      t.category || 'Uncategorized',
      t.description || t.merchant || '',
      t.amount,
      t.paymentMethod || '-',
      t.isScanned ? 'Yes' : 'No',
      t.notes || ''
    ]);
  });
  expenseData.push(['', '', '', 'Total Expenses', totalExpenses, '', '', '']);
  const wsExpense = XLSX.utils.aoa_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(wb, wsExpense, "Expense Breakdown");

  // Sheet 5: Category Analysis
  // Extend category keywords here if needed for auto-categorization
  const categories = {};
  transactions.forEach(t => {
    const cat = t.category || t.source || 'Uncategorized';
    if (!categories[cat]) categories[cat] = { type: t.type, count: 0, amount: 0 };
    categories[cat].count += 1;
    categories[cat].amount += t.amount;
  });

  const catData = [['Category', 'Type', 'No. of Transactions', 'Total Amount (₹)', '% of Total', 'Avg per Transaction']];
  
  const incCats = Object.entries(categories).filter(([_, v]) => v.type === 'income').sort((a, b) => b[1].amount - a[1].amount);
  const expCats = Object.entries(categories).filter(([_, v]) => v.type === 'expense').sort((a, b) => b[1].amount - a[1].amount);

  incCats.forEach(([cat, data]) => {
    catData.push([
      cat, 'Income', data.count, data.amount, totalIncome > 0 ? ((data.amount / totalIncome) * 100).toFixed(2) + '%' : '0%', (data.amount / data.count).toFixed(2)
    ]);
  });
  
  if(incCats.length > 0 && expCats.length > 0) {
     catData.push(['---', '---', '---', '---', '---', '---']);
  }

  expCats.forEach(([cat, data]) => {
    catData.push([
      cat, 'Expense', data.count, data.amount, totalExpenses > 0 ? ((data.amount / totalExpenses) * 100).toFixed(2) + '%' : '0%', (data.amount / data.count).toFixed(2)
    ]);
  });

  const wsCat = XLSX.utils.aoa_to_sheet(catData);
  XLSX.utils.book_append_sheet(wb, wsCat, "Category Analysis");

  // Sheet 6: Monthly Summary
  const monthly = {};
  ascendingTxns.forEach(t => {
    const d = new Date(t.date);
    const m = d.toLocaleString('en-US', { month: 'short' });
    const y = d.getFullYear();
    const key = `${m} ${y}`;
    if (!monthly[key]) monthly[key] = { m, y, income: 0, expense: 0, txns: 0 };
    if (t.type === 'income') monthly[key].income += t.amount;
    else monthly[key].expense += t.amount;
    monthly[key].txns += 1;
  });

  const monthData = [['Month', 'Year', 'Income (₹)', 'Expenses (₹)', 'Savings (₹)', 'Savings Rate %', 'No. Transactions']];
  Object.values(monthly).forEach(m => {
    const savings = m.income - m.expense;
    const rate = m.income > 0 ? ((savings / m.income) * 100).toFixed(2) : '0.00';
    monthData.push([
      m.m, m.y, m.income, m.expense, savings, rate + '%', m.txns
    ]);
  });

  const wsMonth = XLSX.utils.aoa_to_sheet(monthData);
  XLSX.utils.book_append_sheet(wb, wsMonth, "Monthly Summary");

  // Save File
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `financial_report_${new Date().toISOString().split('T')[0]}.xlsx`);

  return true;
};
