const express = require("express");
const {
    addExpense,
    getAllExpense,
    deleteExpense,
    downloadExpenseExcel,
    scanReceipt
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.post("/scan-receipt", protect, upload.single("receipt"), scanReceipt);
router.delete("/:id", protect, deleteExpense);

module.exports = router;
