'use client'

export default function CertificateTemplate({ certificate, user }) {

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-BH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Generate NHRA code (if needed, you can customize this)
  const generateNHRACode = (eventId, date) => {
    const year = new Date(date).getFullYear();
    const shortYear = year.toString().slice(-2);
    return `25-${shortYear}-C1.5-BDNTS-NHRA-BH-${eventId?.slice(0, 2) || '27'}`;
  }

  // Resolve attendee display name from multiple possible sources
  const displayName =
    certificate?.member_name ||
    certificate?.participant_name ||
    certificate?.user_name ||
    user?.full_name ||
    user?.name ||
    'Member';

  // Prefer values coming from event/certificate payload
  const nhraHours =
    certificate?.nera_cme_hours ??
    certificate?.cme_hours ??
    certificate?.hours ??
    null;

  const nhraCodeExplicit =
    certificate?.nera_code ??
    certificate?.nhra_code ??
    certificate?.accreditation_code ??
    null;

  return (
    <div
      className="bg-white w-full mx-auto p-0 certificate-container"
      style={{
        width: '100%',
        height: '11in',
        backgroundColor: '#ffffff',
        color: '#000000',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Certificate Container */}
      <div className="relative bg-white h-full flex flex-col" style={{ border: 'none' }}>
        {/* Top Decorative Wave - Blue and Gold */}
        <div
          className="relative h-24 overflow-hidden flex-shrink-0"
          style={{
            background:
              "#fff",
            transform: 'rotate(180deg)'
          }}
        >
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#03215F" stopOpacity="0.99" />
                <stop offset="100%" stopColor="#03215F" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Back soft wave */}
            <path
              d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z"
              fill="#03215F"
              opacity="0.88"
            />

            {/* Middle wave */}
            <path
              d="M0,70 Q300,35 600,70 T1200,70 L1200,120 L0,120 Z"
              fill="url(#waveGradient)"
            />

            {/* Front sharp wave */}
            <path
              d="M0,85 Q300,55 600,85 T1200,85 L1200,120 L0,120 Z"
              fill="#03215F"
              opacity="0.18"
            />
          </svg>
        </div>


        {/* Header Section */}
        <div className="flex items-center justify-between px-12 pt-6 pb-3 flex-shrink-0">
          {/* BDS Logo - Left */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Bahrain Dental Society Logo"
              className="w-16 h-16 object-contain"
              style={{ maxWidth: '64px', maxHeight: '64px' }}
            />
            <div>
              <div className="text-xs mb-1 font-semibold" style={{ color: '#6b7280' }}>تأسست 1994</div>
              <div className="text-sm font-bold" style={{ color: '#03215F' }}>Bahrain Dental Society</div>
              <div className="text-xs" style={{ color: '#6b7280' }}>جمعية أطباء الفم والأسنان البحرينية</div>
            </div>
          </div>

          {/* Bahrain Emblem - Center */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 flex items-center justify-center">
              <img src="/kbh.png" alt="Bahrain Emblem" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* NHRA Logo - Right */}
          <div className="flex flex-col items-end">
            <img src="/nera-logo.png" alt="NHRA Logo" className="w-32  object-contain" />
          </div>
        </div>

        {/* Main Certificate Content */}
        <div className="px-12 py-6 flex-1 flex flex-col justify-between" style={{ minHeight: 0 }}>
          {/* Title */}
          <div className="text-center mb-5">
            <h1 className="text-5xl font-bold mb-2 pb-3" style={{ fontFamily: 'serif', letterSpacing: '2px', color: '#03215F' }}>
              CERTIFICATE
            </h1>
            <div className="flex items-center justify-center gap-4" style={{ marginBottom: '10px' }}>
              <div className="h-px flex-1 max-w-[200px]" style={{ backgroundColor: '#AE9B66' }}></div>
              <div className="w-3 h-3 transform" style={{ backgroundColor: '#AE9B66', transform: 'rotate(45deg)' }}></div>
              <div className="h-px flex-1 max-w-[200px]" style={{ backgroundColor: '#AE9B66' }}></div>
            </div>
            <h2 className="text-3xl font-semibold mt-2" style={{ fontFamily: 'serif', letterSpacing: '1px', color: '#AE9B66' }}>
              OF ATTENDANCE
            </h2>
          </div>

          {/* Recipient Name */}
          <div className="text-center mb-4">
            <p className="text-lg mb-3" style={{ fontFamily: 'serif', color: '#374151' }}>
              This certificate is proudly presented to:
            </p>
            <h3 className="text-4xl font-bold mb-2" style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#03215F' }}>
              {displayName}
            </h3>
          </div>

          {/* Recognition Statement */}
          <div className="text-center mb-4">
            <p className="text-lg mb-3" style={{ fontFamily: 'serif', color: '#374151' }}>
              In recognition of successfully attending
            </p>
            <h4 className="text-2xl font-semibold mb-3 px-8" style={{ fontFamily: 'serif', color: '#AE9B66' }}>
              {certificate?.event_title || 'Early treatment of Class 3 Malocclusion, a necessity or unnecessary hassle?'}
            </h4>
            <p className="text-lg mb-2" style={{ fontFamily: 'serif', color: '#374151' }}>
              Lecture in the Scientific Program of Bahrain Dental Society
            </p>
            <p className="text-lg font-semibold" style={{ fontFamily: 'serif', color: '#374151' }}>
              On {formatDate(certificate?.checked_in_at || certificate?.event_date || new Date())}
            </p>
          </div>

          {/* Accreditation Info */}
          <div className="mt-5 mb-4 space-y-2">
            {nhraHours ?
              <p className="text-base" style={{ fontFamily: 'serif', color: '#374151' }}>
                <span className="font-semibold">NHRA Approved Credits:</span>{' '}
                <span className="font-bold" style={{ color: '#b8352d' }}>
                  {nhraHours ? `${nhraHours} CME Credit Hours.` : ''}
                </span>
              </p>
              : null}
            {nhraCodeExplicit ?
              <p className="text-base" style={{ fontFamily: 'serif', color: '#374151' }}>
                <span className="font-semibold">NHRA Accreditation Code:</span>{' '}
                <span className="font-mono" style={{ color: '#b8352d' }}>
                  {nhraCodeExplicit || ''}
                </span>
              </p>
              : null}
            <p className="text-base" style={{ fontFamily: 'serif', color: '#374151' }}>
              Held in {certificate?.venue_name || ''}.
            </p>
          </div>

          {/* Disclaimer */}
          <div
            className="mt-4 mb-4 p-3"
            style={{ backgroundColor: "#f9fafb", borderLeft: "4px solid #03215F" }}
          >
            <p
              className="text-sm italic"
              style={{ fontFamily: "serif", color: "#6b7280" }}
            >
              This certificate is an attendance certificate of a CPD activity only that
              should &amp; can be used towards your CPD requirements for Professional
              License renewal. It is by no means an academic certificate.
            </p>
          </div>

          <div
            className="mb-4 p-3"
            style={{ backgroundColor: "#f9fafb", borderLeft: "4px solid #03215F" }}
          >
            <p
              className="text-sm italic"
              style={{ fontFamily: "serif", color: "#6b7280" }}
            >
              This is a digitally issued certificate and does not require a handwritten
              signature. The digital authorization is valid and acceptable for official
              use.
            </p>
          </div>



        </div>

        {/* Bottom Decorative Wave - Blue and Gold */}
        <div
          className="relative h-24 overflow-hidden flex-shrink-0"
          style={{
            background:
              "#fff"
          }}
        >
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
           
          >
            <defs>
              <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#03215F" stopOpacity="0.99" />
                <stop offset="100%" stopColor="#03215F" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Back soft wave */}
            <path
              d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z"
              fill="#03215F"
              opacity="0.88"
            />

            {/* Middle wave */}
            <path
              d="M0,70 Q300,35 600,70 T1200,70 L1200,120 L0,120 Z"
              fill="url(#waveGradient)"
            />

            {/* Front sharp wave */}
            <path
              d="M0,85 Q300,55 600,85 T1200,85 L1200,120 L0,120 Z"
              fill="#03215F"
              opacity="0.18"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
