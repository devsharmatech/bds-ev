"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ArrowLeft,
  Loader2,
  FileCheck,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function BulkUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setResults(null);

    // Read and preview CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file must have at least a header row and one data row');
        setFile(null);
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Parse first few rows for preview
      const previewRows = [];
      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length === headers.length) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          previewRows.push(row);
        }
      }

      setPreview({
        headers,
        rows: previewRows,
        totalRows: lines.length - 1
      });
    };
    reader.readAsText(selectedFile);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const template = `email,full_name,membership_code,password,phone,mobile,gender,dob,address,city,state,pin_code,cpr_id,nationality,type_of_application,membership_date,work_sector,employer,position,specialty,category,membership_status,membership_type,subscription_plan,profile_image,id_card_url,personal_photo_url
john.doe@example.com,John Doe,MEM001,password123,+97312345678,+97312345678,Male,1990-01-15,123 Main St,Manama,Capital Governorate,12345,123456789,Bahraini,New,2024-01-01,Private,Hospital,Doctor,General Dentistry,Dental Technologist,active,free,active,https://drive.google.com/profile.jpg,https://drive.google.com/id_card.jpg,https://drive.google.com/photo.jpg
jane.smith@example.com,Jane Smith,MEM002,password123,+97387654321,+97387654321,Female,1985-05-20,456 Park Ave,Riffa,Northern Governorate,54321,987654321,Bahraini,New,2024-01-01,Public,Clinic,Dentist,Orthodontics,Dental Hygienist,active,paid,associate,,https://drive.google.com/id.jpg,`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members_bulk_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded');
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/members/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        toast.success(data.message);
        
        // Refresh members list after 2 seconds
        setTimeout(() => {
          router.push('/admin/members');
        }, 3000);
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/members')}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#03215F]" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#03215F] to-[#03215F] bg-clip-text text-transparent">
                Bulk Upload Members
              </h1>
              <p className="text-gray-600 mt-1">
                Upload CSV file to create multiple members at once
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#9cc2ed] rounded-lg">
              <FileText className="w-6 h-6 text-[#03215F]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#03215F] mb-2">
                CSV Format Requirements
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                  <span><strong>Required columns:</strong> email, full_name, membership_code</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                  <span><strong>Optional columns:</strong> password, phone, mobile, gender, dob, address, city, state, pin_code, cpr_id, nationality, type_of_application, membership_date, work_sector, employer, position, specialty, category, membership_status, membership_type, subscription_plan, profile_image, id_card_url, personal_photo_url</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                  <span><strong>Subscription plan:</strong> Use plan name like <code className="bg-gray-100 px-1 rounded">active</code>, <code className="bg-gray-100 px-1 rounded">associate</code>, <code className="bg-gray-100 px-1 rounded">honorary</code>, <code className="bg-gray-100 px-1 rounded">student</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                  <span><strong>Image/Document URLs:</strong> Direct links to images (Google Drive, Dropbox, etc.) for profile_image, id_card_url, personal_photo_url</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                  <span><strong>Date formats:</strong> Supported formats for dob and membership_date: <code className="bg-gray-100 px-1 rounded">YYYY-MM-DD</code>, <code className="bg-gray-100 px-1 rounded">DD-MM-YYYY</code>, <code className="bg-gray-100 px-1 rounded">DD/MM/YYYY</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                  <span>If password is not provided, default will be: <code className="bg-gray-100 px-1 rounded">membership_code + "123"</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#AE9B66] mt-0.5 flex-shrink-0" />
                  <span>Each email and membership_code must be unique</span>
                </li>
              </ul>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {!results && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-[#03215F] mb-4">
              Upload CSV File
            </h3>

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-[#03215F] transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to select CSV file or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  CSV files only
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-8 h-8 text-[#AE9B66]" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-2 text-gray-500 hover:text-[#b8352d] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {preview && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-700">
                        Preview ({preview.totalRows} total rows, showing first {preview.rows.length})
                      </p>
                    </div>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            {preview.headers.map((header, index) => (
                              <th
                                key={index}
                                className="px-4 py-2 text-left font-medium text-gray-700 border-b border-gray-200"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {preview.rows.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              {preview.headers.map((header, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="px-4 py-2 text-gray-600"
                                >
                                  {row[header] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload & Process
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={uploading}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-[#03215F] mb-4">
                Upload Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Rows</p>
                  <p className="text-2xl font-bold text-gray-900">{results.total}</p>
                </div>
                <div className="p-4 bg-[#AE9B66]/10 rounded-lg">
                  <p className="text-sm text-[#AE9B66] mb-1">Success</p>
                  <p className="text-2xl font-bold text-[#AE9B66]">{results.successCount}</p>
                </div>
                <div className="p-4 bg-[#b8352d]/10 rounded-lg">
                  <p className="text-sm text-[#b8352d] mb-1">Failed</p>
                  <p className="text-2xl font-bold text-[#b8352d]">{results.failedCount}</p>
                </div>
              </div>
            </div>

            {/* Success List */}
            {results.success.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-[#AE9B66]" />
                  <h3 className="text-lg font-semibold text-[#03215F]">
                    Successfully Created ({results.success.length})
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Row</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Full Name</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Membership Code</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Subscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.success.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-600">{item.row}</td>
                          <td className="px-4 py-2 text-gray-900">{item.email}</td>
                          <td className="px-4 py-2 text-gray-900">{item.full_name}</td>
                          <td className="px-4 py-2 text-gray-900">{item.membership_code}</td>
                          <td className="px-4 py-2 text-gray-900">
                            {item.subscription_plan ? (
                              <span className="px-2 py-1 bg-[#AE9B66]/10 text-[#AE9B66] rounded text-xs">
                                {item.subscription_plan}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Failed List */}
            {results.failed.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-[#b8352d]" />
                  <h3 className="text-lg font-semibold text-[#03215F]">
                    Failed ({results.failed.length})
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Row</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.failed.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-600">{item.row}</td>
                          <td className="px-4 py-2 text-gray-900">
                            {item.data?.email || 'N/A'}
                          </td>
                          <td className="px-4 py-2">
                            <div className="space-y-1">
                              {item.errors?.map((error, errIndex) => (
                                <span
                                  key={errIndex}
                                  className="inline-block px-2 py-1 bg-[#b8352d]/10 text-[#b8352d] rounded text-xs mr-1"
                                >
                                  {error}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Upload Another File
              </button>
              <button
                onClick={() => router.push('/admin/members')}
                className="px-6 py-3 bg-gradient-to-r from-[#03215F] to-[#03215F] text-white rounded-lg font-medium hover:from-[#03215F] hover:to-[#03215F] transition-all duration-200"
              >
                Back to Members
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

