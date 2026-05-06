import React, { useState } from 'react';
import { LuCloudUpload, LuCamera, LuLoaderCircle } from 'react-icons/lu';
import Input from '../Inputs/Input';
import EmojiPickerPopup from '../EmojiPickerPopup';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';

const ScanReceiptModal = ({ onAddExpense, onCancel }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scannedData, setScannedData] = useState(null);

    const [expense, setExpense] = useState({
        merchant: "",
        category: "",
        amount: "",
        date: "",
        icon: "",
        items: ""
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) processFile(selectedFile);
    };

    const processFile = (selectedFile) => {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleScan = async () => {
        if (!file) {
            toast.error("Please upload or capture a receipt image");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('receipt', file);

        try {
            const response = await axiosInstance.post(API_PATHS.EXPENSE.SCAN_RECEIPT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data) {
                setScannedData(response.data);
                
                let formattedDate = "";
                if (response.data.date) {
                    const d = new Date(response.data.date);
                    if (!isNaN(d.getTime())) {
                        formattedDate = d.toISOString().split('T')[0];
                    }
                }

                setExpense({
                    merchant: response.data.merchant || "",
                    category: response.data.category || "",
                    amount: response.data.total || "",
                    date: formattedDate,
                    icon: "🧾",
                    items: response.data.rawText ? response.data.rawText.substring(0, 100) + "..." : ""
                });
                toast.success("Receipt scanned successfully!");
            }
        } catch (error) {
            console.error("Scanning error", error);
            toast.error("Failed to scan receipt.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => setExpense({ ...expense, [key]: value });

    if (scannedData) {
        return (
            <div>
                <EmojiPickerPopup
                    icon={expense.icon}
                    onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
                />
                
                <Input
                    value={expense.merchant}
                    onChange={({ target }) => handleChange("merchant", target.value)}
                    label="Merchant Name"
                    placeholder="e.g. Walmart"
                    type="text"
                />

                <Input
                    value={expense.category}
                    onChange={({ target }) => handleChange("category", target.value)}
                    label="Category"
                    placeholder="Rent, Groceries, etc."
                    type="text"
                />

                <Input
                    value={expense.amount}
                    onChange={({ target }) => handleChange("amount", target.value)}
                    label="Amount"
                    placeholder="₹450"
                    type="number"
                />

                <Input
                    value={expense.date}
                    onChange={({ target }) => handleChange("date", target.value)}
                    label="Date"
                    placeholder=""
                    type="date"
                />

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="add-btn add-btn-fill"
                        onClick={() => onAddExpense(expense)}
                    >
                        Save Expense
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <div 
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => document.getElementById('receiptUpload').click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processFile(e.dataTransfer.files[0]);
                    }
                }}
            >
                {preview ? (
                    <img src={preview} alt="Receipt preview" className="max-h-48 object-contain mb-4 rounded" />
                ) : (
                    <>
                        <LuCloudUpload className="text-4xl text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Click or drag receipt to upload</p>
                        <p className="text-xs text-gray-400">JPG, PNG, PDF, HEIC</p>
                    </>
                )}
            </div>

            <input 
                id="receiptUpload"
                type="file"
                accept="image/*,application/pdf,.heic"
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="w-full flex items-center justify-center my-4">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="px-3 text-xs text-gray-400 uppercase">OR</span>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <button
                className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                onClick={() => document.getElementById('cameraCapture').click()}
            >
                <LuCamera className="text-lg" />
                Take Photo
            </button>

            <input 
                id="cameraCapture"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="w-full flex justify-end gap-3 mt-8">
                <button
                    type="button"
                    className="py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="add-btn add-btn-fill flex items-center gap-2"
                    onClick={handleScan}
                    disabled={!file || loading}
                >
                    {loading ? (
                        <>
                            <LuLoaderCircle className="animate-spin text-lg" />
                            Scanning receipt...
                        </>
                    ) : (
                        "Scan Receipt"
                    )}
                </button>
            </div>
        </div>
    );
};

export default ScanReceiptModal;
