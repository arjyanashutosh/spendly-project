### 4. Comprehensive Financial Report — Excel Download (Dashboard)

#### 4a. Frontend Button & UX
- Add a prominent "⬇ Download Financial Report" button in the Dashboard section
- Place it near the summary cards (Total Balance, Income, Expenses, Savings)
- Style it as a filled primary button using the existing design system colors
- On click:
  - Show loading state: "Preparing your report..."
  - Auto-download file named: `financial_report_YYYY-MM-DD.xlsx`
  - Show a success toast: "Report downloaded successfully!"

#### 4b. Excel File Structure — Multi-Sheet Workbook
Use SheetJS (xlsx npm package) to generate a multi-sheet .xlsx file with the following sheets:

---

**Sheet 1: "Summary"**
A financial overview card-style sheet with these rows:

| Field                  | Value         |
|------------------------|---------------|
| Report Generated On    | DD/MM/YYYY    |
| Report Period          | From – To     |
| Total Income           | ₹ X,XX,XXX.XX |
| Total Expenses         | ₹ X,XX,XXX.XX |
| Total Savings          | ₹ X,XX,XXX.XX |
| Total Spent            | ₹ X,XX,XXX.XX |
| Savings Rate           | XX.XX%        |
| Largest Expense        | ₹ X,XX,XXX.XX |
| Largest Income         | ₹ X,XX,XXX.XX |
| Average Monthly Income | ₹ X,XX,XXX.XX |
| Average Monthly Spend  | ₹ X,XX,XXX.XX |
| Net Balance            | ₹ X,XX,XXX.XX |

Formatting:
- Column A: bold, dark background (#1E1B2E), white text, width 28
- Column B: right-aligned, green for positive values (#22C55E), red for negative (#EF4444), width 20
- Add the app name / logo text as a merged header at the top

---

**Sheet 2: "All Transactions"**
Every transaction (income + expense), sorted by date descending:

| # | Date | Day | Type | Category | Description | Amount (₹) | Payment Method | Notes | Running Balance |
|---|------|-----|------|----------|-------------|------------|----------------|-------|-----------------|

Formatting:
- Header row: bold, background #6D4AEF, white text
- Income rows: light green tint (#F0FFF4)
- Expense rows: light red tint (#FFF5F5)
- Amount column: ₹#,##0.00 number format
- Running Balance column: calculated cumulatively
- Alternating subtle row borders
- Auto column widths

---

**Sheet 3: "Income Breakdown"**
Only income transactions:

| # | Date | Source/Category | Description | Amount (₹) | Payment Method | Notes |
|---|------|-----------------|-------------|------------|----------------|-------|

- Footer row: "Total Income" | SUM formula
- Header: background #BFAFF4, dark text
- Sorted by date descending

---

**Sheet 4: "Expense Breakdown"**
Only expense transactions:

| # | Date | Category | Description | Amount (₹) | Payment Method | Is Scanned Receipt | Notes |
|---|------|----------|-------------|------------|----------------|-------------------|-------|

- Footer row: "Total Expenses" | SUM formula
- Header: background #6D4AEF, white text
- Sorted by date descending

---

**Sheet 5: "Category Analysis"**
Spending and income grouped by category:

| Category | Type | No. of Transactions | Total Amount (₹) | % of Total | Avg per Transaction |
|----------|------|---------------------|-----------------|------------|---------------------|

- Sorted by Total Amount descending
- Separate sections for Income categories and Expense categories with a divider row
- % column shown as percentage format

---

**Sheet 6: "Monthly Summary"**
Month-by-month breakdown:

| Month | Year | Income (₹) | Expenses (₹) | Savings (₹) | Savings Rate % | No. Transactions |
|-------|------|-----------|-------------|------------|----------------|-----------------|

- Sorted chronologically
- Footer: Totals row with bold formatting
- Conditional formatting: Savings Rate below 10% in red, above 30% in green

---

#### 4c. Implementation Details

Install command:
```bash
npm install xlsx file-saver
```

Core utility function to create (new file: utils/exportToExcel.js or lib/excelExport.js):
```js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const downloadFinancialReport = (transactions, dateRange) => {
  const wb = XLSX.utils.book_new();

  // Build each sheet from transactions data
  // Sheet 1: Summary stats
  // Sheet 2: All transactions
  // Sheet 3: Income only
  // Sheet 4: Expenses only
  // Sheet 5: Category analysis (group by category)
  // Sheet 6: Monthly summary (group by month+year)

  // Apply styles using cell-level formatting (XLSX.utils.aoa_to_sheet)
  // Use !cols for column widths, !rows for row heights
  // Use cell.s for styles: { font, fill, alignment, numFmt, border }

  XLSX.writeFile(wb, `financial_report_${new Date().toISOString().split('T')[0]}.xlsx`);
};
```

Rules:
- Pull all data from the existing Redux store / Context / Zustand state — do NOT make a new API call
- If a date range filter exists on the dashboard, respect the selected range for the export
- All currency values must use ₹ symbol and en-IN locale formatting
- The export must work entirely client-side (no server involvement)
- Handle edge case: if no transactions exist, show a toast "No transactions to export" and abort
- Handle edge case: if only income or only expenses exist, still generate all sheets (empty ones with headers only)
- Add a comment in the code marking where to extend category keywords for auto-categorization

#### 4d. Button placement in Dashboard component
- Primary "⬇ Download Financial Report" button — full color, near summary cards
- Add a small helper text below it: "Includes all transactions, category analysis & monthly summary"
- On mobile: button becomes full-width, placed below the summary cards stack