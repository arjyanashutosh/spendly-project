// const User = require("../models/User");
const xlsx = require("xlsx");
const Expense = require("../models/Expense");
const Tesseract = require('tesseract.js');

// Add Expense Source 
exports.addExpense = async (req, res) => {
    const userId = req.user.id;

    try {
        const { icon, category, amount, date } = req.body;

        // Validation: Check for missing fields 
        if (!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date)
        });

        await newExpense.save();
        res.status(200).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Get All Expense Source 
exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;
    const { range } = req.query;

    try {
        let query = { userId };
        if (range) {
            query.date = { $gte: new Date(Date.now() - parseInt(range) * 24 * 60 * 60 * 1000) };
        }
        const expense = await Expense.find(query).sort({ date: -1 });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete Expense Source 
exports.deleteExpense = async (req, res) => {
    // const userId = req.user.id;

    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Download Excel 
exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;
    const { range } = req.query;

    try {
        let query = { userId };
        if (range) {
            query.date = { $gte: new Date(Date.now() - parseInt(range) * 24 * 60 * 60 * 1000) };
        }
        const expense = await Expense.find(query).sort({ date: -1 });
        
        // Prepare data for Excel 
        const data = expense.map((item) => ({
            Category: item.category,
            Amount: item.amount,
            Date: item.date
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Expense");
        xlsx.writeFile(wb, "expense_details.xlsx");
        res.download("expense_details.xlsx");
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// Scan Receipt using OCR
exports.scanReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No receipt image provided" });
        }

        const imagePath = req.file.path;
        const result = await Tesseract.recognize(imagePath, 'eng');
        const text = result.data.text;

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        let merchant = lines.length > 0 ? lines[0] : "Unknown Merchant";
        
        const amountRegex = /\$?(\d+\.\d{2})/g;
        let amounts = [];
        let match;
        while ((match = amountRegex.exec(text)) !== null) {
            amounts.push(parseFloat(match[1]));
        }
        let total = amounts.length > 0 ? Math.max(...amounts) : 0;

        const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
        const dateMatch = text.match(dateRegex);
        let date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];

        const categories = {
            "Groceries": ["supermarket", "walmart", "target", "grocery", "food"],
            "Dining": ["restaurant", "cafe", "bistro", "pizza", "coffee"],
            "Transport": ["uber", "lyft", "taxi", "gas", "fuel", "shell", "chevron"],
            "Utilities": ["electric", "water", "internet", "comcast", "att"]
        };

        let category = "Miscellaneous";
        const textLower = text.toLowerCase();
        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(kw => textLower.includes(kw))) {
                category = cat;
                break;
            }
        }

        res.json({
            merchant,
            date,
            total,
            category,
            rawText: text
        });

    } catch (error) {
        console.error("OCR Error:", error);
        res.status(500).json({ message: "Error processing receipt" });
    }
};
