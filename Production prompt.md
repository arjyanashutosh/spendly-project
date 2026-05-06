You are an expert full-stack developer. I have an existing personal finance management project and I want you to upgrade it with 4 specific features. You must follow the existing codebase structure strictly, preserve all core functionality, and match the existing design system throughout.

---

##  UPGRADE OBJECTIVES

### 1. Currency Symbol Change (Global)
- Replace ALL occurrences of the `$` (dollar) symbol with `₹` (Indian Rupee) across the entire application
- This includes: UI labels, formatted amounts, chart tooltips, transaction displays, invoice previews, PDF exports, and any utility/helper functions that format currency
- Search for patterns like: `$`, `USD`, `formatCurrency`, `toLocaleString('en-US'`, `Intl.NumberFormat('en-US'` and update them to use `₹` and `en-IN` locale
- Do NOT change any backend logic, only the display/formatting layer

---

### 2. Bar Chart Color Update
- Locate ALL bar chart components in:
  - The **Dashboard** section
  - The **Income** section
- Update bar chart colors to use this exact two-color scheme:
  - Primary bar color: `#BFAFF4` (soft lavender)
  - Secondary / accent bar color: `#6D4AEF` (deep violet)
- If the charts use a single color, use `#6D4AEF` as primary and `#BFAFF4` as hover/secondary
- If using Chart.js, update `backgroundColor` and `borderColor` in the dataset config
- If using Recharts, update `fill` and `stroke` props on `<Bar>` components
- If using D3, update the color scale or hardcoded fill values
- Ensure tooltips, legends, and axes still render correctly after color changes

---

### 3. Invoice/Receipt OCR Scanning with Auto-Categorization (Full Stack)

#### 3a. Frontend (Expense Section UI)
- Add an "📷 Scan Receipt" button in the Expense section, styled consistently with existing buttons
- On click, open a modal/drawer with:
  - A file upload zone (drag & drop + click to upload) accepting: JPG, PNG, PDF, HEIC
  - A live camera capture option (if on mobile/browser supports it)
  - A loading spinner with text "Scanning receipt..." while OCR processes
  - An editable form auto-populated with extracted fields:
    - Merchant Name
    - Date
    - Total Amount
    - Line items (if available)
    - Auto-detected Category (with a dropdown to override)
  - "Save Expense" and "Cancel" buttons
- The modal design must match the existing modal/drawer style (same border radius, shadows, font, spacing)

#### 3b. Backend API (Node.js / Express)
Create a new route: `POST /api/expenses/scan-receipt`
- Accept `multipart/form-data` with a file field named `receipt`
- Use **Tesseract.js** (if no paid OCR available) OR integrate **Google Cloud Vision API** for better accuracy
- Parse the OCR text to extract:
  - `merchant`: business name (first prominent line or header)
  - `date`: any date pattern (MM/DD/YYYY, DD-MM-YYYY, etc.) using regex or date-fns
  - `total`: the largest currency amount near words like "Total", "Amount Due", "Grand Total"
  - `items`: array of line items if parseable
- Auto-categorize using keyword matching against these categories (extend as needed):