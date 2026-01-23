import React from "react";

const statements = [
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
  return (
    <div className="border border-gray-200 rounded-lg p-4 mt-4">
      <div className="flex flex-col items-center mb-4">
        <img src="/nera-logo.png" alt="NHRA Logo" className="h-16 mb-2" style={{objectFit:'contain'}} />
        <h4 className="font-semibold text-[#03215F] mb-2 text-center">
          Speaker Declaration Form
        </h4>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPD Activity Title</label>
            <input
              type="text"
              name="declaration_cpd_title"
              value={declarationData.declaration_cpd_title || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. Annual Dental Conference 2026"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label>
            <input
              type="text"
              name="declaration_speaker_name"
              value={declarationData.declaration_speaker_name || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter speaker's full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presentation Title</label>
            <input
              type="text"
              name="declaration_presentation_title"
              value={declarationData.declaration_presentation_title || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. Innovations in Restorative Dentistry"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presentation Date</label>
            <input
              type="date"
              name="declaration_presentation_date"
              value={declarationData.declaration_presentation_date || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Speaker’s Contact Number</label>
            <input
              type="text"
              name="declaration_contact_number"
              value={declarationData.declaration_contact_number || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. +97312345678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Speaker’s E-Mail Address</label>
            <input
              type="email"
              name="declaration_email"
              value={declarationData.declaration_email || ''}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g. speaker@email.com"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scientific Content/Abstract of the Presentation</label>
          <textarea
            name="declaration_abstract"
            value={declarationData.declaration_abstract || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={3}
            placeholder="Brief summary of your presentation..."
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Declaration Statements</label>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs md:text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border px-2 py-1 text-left">Statement</th>
                  <th className="border px-2 py-1">Agree</th>
                  <th className="border px-2 py-1">Disagree</th>
                </tr>
              </thead>
              <tbody>
                {statements.map((statement, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1 align-top">{statement}</td>
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="radio"
                        name={`declaration_statement_${idx}`}
                        value="agree"
                        checked={declarationData[`declaration_statement_${idx}`] === 'agree'}
                        onChange={onChange}
                        required
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="radio"
                        name={`declaration_statement_${idx}`}
                        value="disagree"
                        checked={declarationData[`declaration_statement_${idx}`] === 'disagree'}
                        onChange={onChange}
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-700 text-sm mb-2 font-medium">I have carefully read and declare that I am the above-mentioned speaker, and I have filled this form to the best of my ability.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Name</label>
              <input
                type="text"
                name="declaration_final_speaker_name"
                value={declarationData.declaration_final_speaker_name || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Type your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="declaration_final_date"
                value={declarationData.declaration_final_date || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
              <input
                type="text"
                name="declaration_final_signature"
                value={declarationData.declaration_final_signature || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Type your name as signature"
                required
              />
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
