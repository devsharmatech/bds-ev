// components/events/BulkAddModal.js
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Upload,
  Download,
  FileText,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function BulkAddModal({ eventId, event, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Results
  const [file, setFile] = useState(null);
  const [membersData, setMembersData] = useState([]);
  const [results, setResults] = useState([]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    
    // Parse CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Validate headers
        const requiredHeaders = ['email', 'full_name'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          toast.error(`Missing required headers: ${missingHeaders.join(', ')}`);
          return;
        }

        const parsedData = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const member = {};
            headers.forEach((header, index) => {
              member[header] = values[index]?.trim() || '';
            });
            parsedData.push(member);
          }
        }

        setMembersData(parsedData);
        setStep(2);
        toast.success(`Found ${parsedData.length} members to import`);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to parse CSV file");
      }
    };
    reader.readAsText(selectedFile);
  };

  // Download template
  const downloadTemplate = () => {
    const headers = ['email', 'full_name', 'phone', 'mobile', 'membership_code'];
    const template = [headers.join(','), 'example@email.com,John Doe,+97312345678,,M123456'].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-add-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Process bulk add
  const handleBulkAdd = async () => {
    setLoading(true);
    try {
      // First, get user IDs for the emails
      const emails = membersData.map(m => m.email);
      
      // In a real implementation, you would:
      // 1. Look up users by email
      // 2. Create event members
      // 3. Handle errors for each row
      
      // For now, simulate success
      const simulatedResults = membersData.map((member, index) => ({
        email: member.email,
        full_name: member.full_name,
        success: Math.random() > 0.2, // 80% success rate for demo
        message: Math.random() > 0.2 ? "Added successfully" : "User not found",
        token: Math.random().toString(36).substring(2, 8).toUpperCase(),
      }));

      setResults(simulatedResults);
      setStep(3);
      
      // If this were real, you'd call the bulk API:
      // const response = await fetch(`/api/admin/events/${eventId}/members/bulk`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ members: processedMembers }),
      // });
      
    } catch (error) {
      console.error("Error in bulk add:", error);
      toast.error("Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  // Handle complete
  const handleComplete = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Bulk Add Members
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {event?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-[#03215F]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload CSV File
                </h3>
                <p className="text-gray-600">
                  Upload a CSV file with member information
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-[#03215F] transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-700 font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    CSV files only (max 5MB)
                  </p>
                </label>
              </div>

              <div className="bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#03215F] mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      CSV Format Requirements
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Required columns: <code className="bg-gray-100 px-1 rounded">email</code>, <code className="bg-gray-100 px-1 rounded">full_name</code></li>
                      <li>• Optional columns: <code className="bg-gray-100 px-1 rounded">phone</code>, <code className="bg-gray-100 px-1 rounded">mobile</code>, <code className="bg-gray-100 px-1 rounded">membership_code</code></li>
                      <li>• First row must contain headers</li>
                      <li>• Use commas to separate values</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={downloadTemplate}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#ECCF0F] to-[#ECCF0F] flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-[#03215F]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Preview Import ({membersData.length} members)
                </h3>
                <p className="text-gray-600">
                  Review the data before importing
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(membersData[0] || {}).map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {membersData.slice(0, 5).map((member, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(member).map((value, i) => (
                            <td key={i} className="px-4 py-3 text-sm text-gray-700">
                              {value || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {membersData.length > 5 && (
                  <div className="px-4 py-3 text-center text-sm text-gray-500 border-t border-gray-200">
                    ... and {membersData.length - 5} more rows
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setFile(null);
                    setMembersData([]);
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleBulkAdd}
                  disabled={loading}
                  className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Import Members
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Import Results
                </h3>
                <p className="text-gray-600">
                  Summary of the bulk import operation
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#AE9B66] to-[#AE9B66] rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-white">
                    {results.filter(r => r.success).length}
                  </p>
                  <p className="text-sm text-white/90">Successful</p>
                </div>
                <div className="bg-gradient-to-br from-[#b8352d] to-[#b8352d] rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-white">
                    {results.filter(r => !r.success).length}
                  </p>
                  <p className="text-sm text-white/90">Failed</p>
                </div>
                <div className="bg-gradient-to-br from-[#9cc2ed] to-[#9cc2ed] rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-[#03215F]">
                    {results.length}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                          Token
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.slice(0, 10).map((result, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {result.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {result.full_name}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              result.success
                                ? 'bg-[#AE9B66] text-white'
                                : 'bg-[#b8352d] text-white'
                            }`}>
                              {result.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-700">
                            {result.token}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-xl font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}