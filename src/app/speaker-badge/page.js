'use client';

import { useState, useEffect, useRef } from 'react';
import { Printer, Search, Loader2, CheckCircle, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SpeakerBadgePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [badgeData, setBadgeData] = useState(null);
  const [formData, setFormData] = useState({
    event_id: '',
    email: '',
  });
  const badgeRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/event/public?limit=100&isUpcoming=false');
      const data = await res.json();
      if (data.events) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!formData.event_id || !formData.email) {
      toast.error('Please select an event and enter your email');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`/api/speaker-badge/verify?event_id=${formData.event_id}&email=${encodeURIComponent(formData.email)}`);
      const data = await res.json();

      if (data.success && data.speaker) {
        setBadgeData(data.speaker);
        toast.success('Badge verified successfully!');
      } else {
        toast.error(data.message || 'No approved speaker found with this email');
        setBadgeData(null);
      }
    } catch (error) {
      console.error('Error verifying:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handlePrint = () => {
    if (badgeRef.current) {
      const printContents = badgeRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = `
        <html>
          <head>
            <title>Speaker Badge - ${badgeData?.full_name}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .badge-container { 
                  width: 4in; 
                  height: 6in; 
                  margin: 0 auto;
                  page-break-after: always;
                }
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `;
      
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-[#03215F] mb-4">
              Speaker Badge
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Verify your speaker application and print your event badge.
              Only approved speakers can access their badge.
            </p>
          </div>

          {/* Verification Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Search className="text-[#03215F]" size={24} />
              Verify Your Application
            </h2>
            
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Event <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.event_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent bg-white"
                >
                  <option value="">Select an event...</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter the email you used to apply"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03215F] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-[#03215F] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#021845] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Verify & Get Badge
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Badge Display */}
          {badgeData && (
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={24} />
                  Your Speaker Badge
                </h2>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#03215F] text-white rounded-lg hover:bg-[#021845] flex items-center gap-2"
                >
                  <Printer size={18} />
                  Print Badge
                </button>
              </div>

              {/* Badge Preview */}
              <div className="flex justify-center">
                <div 
                  ref={badgeRef}
                  className="badge-container w-[4in] bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg"
                >
                  {/* Badge Header */}
                  <div className="bg-[#03215F] text-white py-6 px-4 text-center">
                    <h3 className="text-lg font-bold tracking-wider">BAHRAIN DENTAL SOCIETY</h3>
                    <p className="text-sm opacity-90 mt-1">{badgeData.events?.title}</p>
                  </div>

                  {/* Category Banner */}
                  <div className={`py-2 text-center font-bold text-white text-lg tracking-wide ${
                    badgeData.category === 'VIP' ? 'bg-purple-600' :
                    badgeData.category === 'Speaker' ? 'bg-blue-600' :
                    badgeData.category === 'Delegate' ? 'bg-green-600' :
                    badgeData.category === 'Organizer' ? 'bg-red-600' :
                    badgeData.category === 'Exhibitor' ? 'bg-orange-600' :
                    'bg-gray-600'
                  }`}>
                    {badgeData.category || 'SPEAKER'}
                  </div>

                  {/* Badge Body */}
                  <div className="p-6 text-center">
                    {/* Name */}
                    <h2 className="text-2xl font-bold text-[#03215F] mb-2">
                      {badgeData.full_name}
                    </h2>

                    {/* Title */}
                    <p className="text-gray-600 font-medium mb-4">
                      {badgeData.professional_title}
                    </p>

                    {/* Institution */}
                    {badgeData.affiliation_institution && (
                      <p className="text-gray-500 text-sm mb-4">
                        {badgeData.affiliation_institution}
                      </p>
                    )}

                    {/* Country */}
                    <div className="inline-block bg-gray-100 px-4 py-2 rounded-full">
                      <p className="text-gray-700 text-sm font-medium">
                        {badgeData.country_of_practice}
                      </p>
                    </div>

                    {/* Topics */}
                    {badgeData.presentation_topics?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">TOPICS</p>
                        <div className="flex flex-wrap justify-center gap-1">
                          {badgeData.presentation_topics.slice(0, 3).map((topic, i) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badge Footer */}
                  <div className="bg-gray-100 py-3 px-4 text-center border-t">
                    <p className="text-xs text-gray-500">
                      {badgeData.events?.start_date && new Date(badgeData.events.start_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong> Click the &quot;Print Badge&quot; button to print your badge. 
                  For best results, use a printer with badge paper (4&quot; x 6&quot;) or print on standard paper 
                  and cut along the edges.
                </p>
              </div>
            </div>
          )}

          {/* Not Found Message */}
          {badgeData === null && formData.email && !verifying && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Badge Not Available</h3>
              <p className="text-gray-600">
                No approved speaker application found with this email for the selected event.
                Please make sure your application has been approved.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
