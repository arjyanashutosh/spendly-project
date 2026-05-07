const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId, Types } = require("mongoose");

// Dashboard Data  
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));
        const { range } = req.query;
        
        let matchQuery = { userId: userObjectId };
        let findQuery = { userId };

        if (range) {
            const dateFilter = { $gte: new Date(Date.now() - parseInt(range) * 24 * 60 * 60 * 1000) };
            matchQuery.date = dateFilter;
            findQuery.date = dateFilter;
        }

        // Fetch total income 
        const totalIncome = await Income.aggregate([
            { $match: matchQuery },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalExpense = await Expense.aggregate([
            // Fetch total expense 
            { $match: matchQuery },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Get income transactions
        const last60DaysIncomeTransaction = await Income.find(
            range ? findQuery : { userId, date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } }
        ).sort({ date: -1 });

        // Get total income
        const incomeLast60Days = last60DaysIncomeTransaction.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        // Get expense transaction
        const last30DaysExpenseTransaction = await Expense.find(
            range ? findQuery : { userId, date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        ).sort({ date: -1 });

        // Get total expense
        const expenseLast30Days = last30DaysExpenseTransaction.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        // Fetch last 5 transactions (income + expense) 
        const lastTransactions = [
            ...(await Income.find(findQuery).sort({ date: -1 }).limit(5)).map(
                (txn) => ({
                    ...txn.toObject(),
                    type: "income",
                })
            ),
            ...(await Expense.find(findQuery).sort({ date: -1 }).limit(5)).map(
                (txn) => ({
                    ...txn.toObject(),
                    type: "expense",
                })
            ),
        ].sort((a, b) => b.date - a.date); // Sort latest first 

        // Final Response 
        res.json({
            totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            last30DaysExpense: { total: expenseLast30Days, transaction: last30DaysExpenseTransaction },
            last60DaysIncome: { total: incomeLast60Days, transaction: last60DaysIncomeTransaction },
            recentTransaction: lastTransactions
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
