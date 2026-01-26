import React, { useState } from "react";
import { FileText, Calendar, Phone, Mail, Signature, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export const statements = [
  "The content of my presentation will promote quality improvement in practice, remain evidence-based, balanced, and unbiased, and will not promote the business interests of any commercial entity.",
  "I confirm that no material used in my presentation infringes copyright. Where copyrighted material is included, I have obtained the necessary permissions. NHRA will not be held responsible for any misrepresentation in this regard.",
  "I understand that the NHRA approval process may require review of my credentials, presentation, and content in advance, and I will provide all requested materials accordingly.",
  "For live events, I acknowledge that NHRA CPD Committee members may attend to ensure the presentation is educational and not promotional.",
  "When referring to products or services, I will use generic names whenever possible. If trade names are used, they will represent more than one company where available.",
  "If I have been trained or engaged by a commercial entity, I confirm that no promotional aspects will be included in my presentation.",
  "If my research is funded by a commercial entity, I confirm it will be presented in line with accepted scientific principles and without promoting the funding company.",
  "My lecture content will remain purely scientific or clinical, and any reference to drugs, products, treatments, or services will be for teaching purposes only and in generic form.",
  "In line with NHRA regulations, I will not endorse any commercial products, materials, or services in my presentation.",
  "An Ethical Confederation declaration will be included as part of my presentation."
];

export default function SpeakerDeclarationSection({ declarationData, onChange, error }) {
  const [expandedStatement, setExpandedStatement] = useState(null);

  return (
    <div className="border-2 border-blue-200 rounded-xl p-4 sm:p-6 mt-4 bg-gradient-to-b from-white to-blue-50 shadow-inner">
      {/* Header */}
      <div className="flex justify-center">
         <img src="/nera-logo.png" alt="NHRA Logo" className="h-20"/>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-blue-100">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#03215F]" />
          </div>
          <div>
            <h4 className="font-bold text-[#03215F] text-base sm:text-lg">
              NHRA Speaker Declaration Form
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Please complete all required fields below
            </p>
          </div>
        </div>
        <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          Required for NHRA Declaration
        </div>
      </div>

      {/* Form Grid */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              CPD Activity Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="declaration_cpd_title"
              value={declarationData.declaration_cpd_title || ''}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g. Annual Dental Conference 2026"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Speaker Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="declaration_speaker_name"
              value={declarationData.declaration_speaker_name || ''}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter speaker's full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Presentation Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="declaration_presentation_title"
              value={declarationData.declaration_presentation_title || ''}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g. Innovations in Restorative Dentistry"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Presentation Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="declaration_presentation_date"
              value={declarationData.declaration_presentation_date || ''}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="declaration_contact_number"
              value={declarationData.declaration_contact_number || ''}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="+973 1234 5678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="declaration_email"
              value={declarationData.declaration_email || ''}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="speaker@email.com"
              required
            />
          </div>
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Scientific Content / Abstract <span className="text-red-500">*</span>
          </label>
          <textarea
            name="declaration_abstract"
            value={declarationData.declaration_abstract || ''}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={4}
            placeholder="Provide a brief summary of your presentation content, methodology, and expected outcomes..."
            required
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-1">
            <span className="text-xs text-gray-500">
              Minimum 100 characters recommended
            </span>
            <span className={`text-xs ${(declarationData.declaration_abstract?.length || 0) < 100 ? 'text-amber-500' : 'text-green-500'}`}>
              {(declarationData.declaration_abstract?.length || 0)} characters
            </span>
          </div>
        </div>

        {/* Declaration Statements - Enhanced Mobile Responsive */}
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <label className="block text-sm font-semibold text-gray-700">
              Declaration Statements <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-3 h-3" /> Agree
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="w-3 h-3" /> Disagree
              </span>
            </div>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-gray-300 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <th className="border-b p-4 text-left text-sm font-semibold text-gray-700 min-w-[300px]">Statement</th>
                    <th className="border-b p-4 text-center text-sm font-semibold text-gray-700 w-32">Agree</th>
                    <th className="border-b p-4 text-center text-sm font-semibold text-gray-700 w-32">Disagree</th>
                  </tr>
                </thead>
                <tbody>
                  {statements.map((statement, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="border-b p-4 align-top">
                        <div className="text-sm text-gray-700 leading-relaxed">
                          <span className="font-medium text-blue-600 mr-2">{idx + 1}.</span>
                          {statement}
                        </div>
                      </td>
                      <td className="border-b p-4 text-center align-top">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input
                              type="radio"
                              name={`declaration_statement_${idx}`}
                              value="agree"
                              checked={declarationData[`declaration_statement_${idx}`] === 'agree'}
                              onChange={onChange}
                              className="hidden"
                            />
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${declarationData[`declaration_statement_${idx}`] === 'agree'
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                              }`}
                            >
                              {declarationData[`declaration_statement_${idx}`] === 'agree' && (
                                <CheckCircle className="w-5 h-5 text-white" />
                              )}
                            </div>
                          </label>
                        </div>
                      </td>
                      <td className="border-b p-4 text-center align-top">
                        <div className="flex justify-center">
                          <label className="cursor-pointer">
                            <input
                              type="radio"
                              name={`declaration_statement_${idx}`}
                              value="disagree"
                              checked={declarationData[`declaration_statement_${idx}`] === 'disagree'}
                              onChange={onChange}
                              className="hidden"
                            />
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${declarationData[`declaration_statement_${idx}`] === 'disagree'
                                ? 'border-red-500 bg-red-500'
                                : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
                              }`}
                            >
                              {declarationData[`declaration_statement_${idx}`] === 'disagree' && (
                                <XCircle className="w-5 h-5 text-white" />
                              )}
                            </div>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Accordion - Enhanced */}
          <div className="md:hidden space-y-3">
            {statements.map((statement, idx) => (
              <div key={idx} className="border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedStatement(expandedStatement === idx ? null : idx)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors active:bg-gray-200"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="font-medium text-blue-600 text-sm flex-shrink-0">{idx + 1}.</span>
                        <span className="text-sm font-medium text-gray-700">
                          {statement.substring(0, 50)}...
                        </span>
                      </div>
                      <div className="mt-2">
                        {declarationData[`declaration_statement_${idx}`] === 'agree' ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded">
                            <CheckCircle className="w-3 h-3" /> Agreed
                          </span>
                        ) : declarationData[`declaration_statement_${idx}`] === 'disagree' ? (
                          <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium px-2 py-1 bg-red-50 rounded">
                            <XCircle className="w-3 h-3" /> Disagreed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                            Not answered
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedStatement === idx ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>
                {expandedStatement === idx && (
                  <div className="p-4 border-t border-gray-300 bg-white">
                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">{statement}</p>
                    <div className="flex gap-3">
                      <label className="flex-1">
                        <input
                          type="radio"
                          name={`declaration_statement_${idx}`}
                          value="agree"
                          checked={declarationData[`declaration_statement_${idx}`] === 'agree'}
                          onChange={onChange}
                          className="hidden"
                        />
                        <div className={`w-full py-3 text-center rounded-lg border-2 transition-all active:scale-95 ${declarationData[`declaration_statement_${idx}`] === 'agree'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-green-400 hover:bg-green-50 text-gray-700'
                          }`}
                        >
                          <span className="flex items-center justify-center gap-2 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Agree
                          </span>
                        </div>
                      </label>
                      <label className="flex-1">
                        <input
                          type="radio"
                          name={`declaration_statement_${idx}`}
                          value="disagree"
                          checked={declarationData[`declaration_statement_${idx}`] === 'disagree'}
                          onChange={onChange}
                          className="hidden"
                        />
                        <div className={`w-full py-3 text-center rounded-lg border-2 transition-all active:scale-95 ${declarationData[`declaration_statement_${idx}`] === 'disagree'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700'
                          }`}
                        >
                          <span className="flex items-center justify-center gap-2 font-medium">
                            <XCircle className="w-4 h-4" />
                            Disagree
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final Declaration */}
        <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <p className="text-gray-700 text-sm mb-6 font-medium leading-relaxed">
            I have carefully read and declare that I am the above-mentioned speaker, 
            and I have filled this form to the best of my ability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Signature className="w-4 h-4" />
                Speaker Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="declaration_final_speaker_name"
                value={declarationData.declaration_final_speaker_name || ''}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Type your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="declaration_final_date"
                value={declarationData.declaration_final_date || ''}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Digital Signature <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="declaration_final_signature"
                value={declarationData.declaration_final_signature || ''}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-signature"
                placeholder="Type your name as signature"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                This serves as your digital signature
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        
      </div>
    </div>
  );
}