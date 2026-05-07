import React from 'react';
import { LuDownload } from 'react-icons/lu';
import TransactionInfoCard from '../Cards/TransactionInfoCard';
import moment from 'moment';

const ExpenseList = ({ transactions, onDelete, onDownload, filterRange, onFilterChange }) => {
  return (
    <div className="card">
        <div className="flex items-center justify-between">
            <h5 className="text-lg">All Expenses</h5>

            <div className="flex items-center gap-4">
                <select
                    className="px-3 py-1.5 border border-gray-300 rounded-md outline-none focus:border-primary text-sm"
                    value={filterRange || ""}
                    onChange={(e) => onFilterChange(e.target.value)}
                >
                    <option value="">All Time</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="60">Last 60 Days</option>
                    <option value="90">Last 90 Days</option>
                </select>

                <button className="card-btn" onClick={onDownload}>
                    <LuDownload className="text-base" /> Download
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
            {transactions?.map((expense) => (
                <TransactionInfoCard
                    key={expense._id}
                    title={expense.category}
                    icon={expense.icon}
                    date={moment(expense.date).format("Do MMM YYYY")}
                    amount={expense.amount}
                    type="expense"
                    onDelete={() => onDelete(expense._id)}
                />
            ))}
        </div>
    </div>
  );
};

export default ExpenseList;