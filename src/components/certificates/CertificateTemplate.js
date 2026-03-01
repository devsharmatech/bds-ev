'use client'

export default function CertificateTemplate({ certificate, user }) {

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-BH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Bahrain'
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
      className="bg-white p-0 certificate-container"
      style={{
        width: '816px',
        minWidth: '816px',
        height: '1056px',
        backgroundColor: '#ffffff',
        color: '#000000',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style jsx>{`
        @media print {
          .certificate-container {
            width: 8.5in !important;
            min-width: 8.5in !important;
            height: 11in !important;
          }
        }
      `}</style>

      {/* Certificate Border Overlay */}
      <div className="absolute top-0 left-0" style={{ width: '816px', height: '1056px', pointerEvents: 'none' }}>
        <svg width="816" height="1056" viewBox="0 0 816 1056" style={{ display: 'block' }}>
          <g transform="translate(32, 32)">
            {/* Outer Rectangle */}
            <rect x="0" y="0" width="752" height="992" fill="none" stroke="#B19756" strokeWidth="2" />

            {/* Inner Rectangle with Rounded Corners */}
            <path
              d="
                 M 6 18 
                 L 6 974 
                 A 12 12 0 0 0 18 986 
                 L 734 986 
                 A 12 12 0 0 0 746 974 
                 L 746 18 
                 A 12 12 0 0 0 734 6 
                 L 18 6 
                 A 12 12 0 0 0 6 18 
                 Z
                "
              fill="none"
              stroke="#B19756"
              strokeWidth="1"
            />

            {/* Corner Arcs */}
            <path d="M 6 18 A 12 12 0 0 0 18 6" fill="none" stroke="#B19756" strokeWidth="1" />
            <path d="M 734 6 A 12 12 0 0 0 746 18" fill="none" stroke="#B19756" strokeWidth="1" />
            <path d="M 746 974 A 12 12 0 0 0 734 986" fill="none" stroke="#B19756" strokeWidth="1" />
            <path d="M 18 986 A 12 12 0 0 0 6 974" fill="none" stroke="#B19756" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* Watermark Logo (Centered, very low opacity) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 1, pointerEvents: 'none', opacity: 0.03 }}
      >
        <img
          src="/logo2-r.png"
          alt="Watermark"
          style={{ width: '480px', height: 'auto', filter: 'grayscale(100%) blur(1px)' }}
        />
      </div>

      {/* Main Content Flow */}
      <div className="relative w-full h-full flex flex-col items-center px-20 py-14 text-center" style={{ zIndex: 10 }}>

        {/* Logo */}
        <div className="mt-8 mb-10">
          <img
            src="/logo2-r.png"
            alt="Bahrain Dental Society"
            className="h-28 object-contain drop-shadow-sm"
          />
        </div>

        {/* Title */}
        <h1 className="text-[58px] font-bold mb-1 mt-2 tracking-[0.1em]" style={{ fontFamily: 'Georgia, serif', color: '#0B1A42' }}>
          CERTIFICATE
        </h1>
        <h2 className="text-[30px] font-semibold tracking-[0.15em] mb-3" style={{ fontFamily: 'Georgia, serif', color: '#B8860B' }}>
          OF ATTENDANCE
        </h2>

        {/* Line + Diamond Separator */}
        <svg width="340" height="24" viewBox="0 0 340 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-8">
          {/* Horizontal lines */}
          <line x1="0" y1="12" x2="148" y2="12" stroke="#B19756" strokeWidth="1" />
          <line x1="192" y1="12" x2="340" y2="12" stroke="#B19756" strokeWidth="1" />

          {/* Center diamond (larger) */}
          <g transform="translate(170, 12)">
            <rect x="-6" y="-6" width="12" height="12" transform="rotate(45)" fill="none" stroke="#B19756" strokeWidth="1.5" />
            <rect x="-3" y="-3" width="6" height="6" transform="rotate(45)" fill="none" stroke="#B19756" strokeWidth="1" />
          </g>

          {/* Left diamond */}
          <g transform="translate(155, 12)">
            <rect x="-4" y="-4" width="8" height="8" transform="rotate(45)" fill="none" stroke="#B19756" strokeWidth="1" />
          </g>

          {/* Right diamond */}
          <g transform="translate(185, 12)">
            <rect x="-4" y="-4" width="8" height="8" transform="rotate(45)" fill="none" stroke="#B19756" strokeWidth="1" />
          </g>
        </svg>

        {/* Presentation Text */}
        <p className="text-lg mb-3" style={{ fontFamily: 'Georgia, serif', color: '#444444' }}>
          This certificate is proudly presented to:
        </p>

        {/* Dynamic Name */}
        <h3 className="text-[28px] font-bold mb-6 min-h-[40px]" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#0B1A42' }}>
          {displayName}
        </h3>

        <p className="text-lg font-semibold mb-4" style={{ fontFamily: 'Georgia, serif', color: '#222222' }}>
          In recognition of successfully attending
        </p>

        {/* Dynamic Event */}
        <h4 className="text-[22px] font-bold max-w-[85%] mx-auto mb-6" style={{ fontFamily: 'Georgia, serif', color: '#111111', lineHeight: '1.4' }}>
          {certificate?.event_title || '_____________________________________'}
        </h4>

        {/* Date and Venue */}
        <div className="mb-auto">
          {certificate?.checked_in_at || certificate?.event_date ? (
            <p className="text-[19px] mb-2" style={{ fontFamily: 'Georgia, serif', color: '#333333' }}>
              On <span className="font-semibold">{formatDate(certificate?.checked_in_at || certificate?.event_date)}</span>
            </p>
          ) : null}
          {certificate?.venue_name ? (
            <p className="text-[17px]" style={{ fontFamily: 'Georgia, serif', color: '#444444' }}>
              Held at {certificate.venue_name}
            </p>
          ) : null}
        </div>

        {/* Add minimal padding to push footer down */}
        <div className="flex-1" />

        {/* NHRA/CME Optional Meta Data */}
        <div className="mb-8 space-y-1.5 text-center">
          {nhraHours && (
            <p className="text-[15px]" style={{ fontFamily: 'Georgia, serif', color: '#222222' }}>
              <strong style={{ color: '#0B1A42' }}>NHRA Approved Credits:</strong> {nhraHours} CME Credit Hours
            </p>
          )}
          {nhraCodeExplicit && (
            <p className="text-[15px]" style={{ fontFamily: 'Georgia, serif', color: '#222222' }}>
              <strong style={{ color: '#0B1A42' }}>Accreditation Code:</strong> {nhraCodeExplicit}
            </p>
          )}
        </div>

        {/* Legal Footer (matching image) */}
        <div className="max-w-[90%] text-center pb-2 opacity-80">
          <p className="text-[10px] leading-relaxed mb-2 uppercase tracking-wide" style={{ fontFamily: 'Arial, sans-serif', color: '#555555' }}>
            This certificate is an attendance certificate of a CPD activity only that should &amp; can be used towards your CPD requirements for Professional License renewal. It is by no means an academic certificate.
          </p>
          <p className="text-[10px] leading-relaxed uppercase tracking-wide" style={{ fontFamily: 'Arial, sans-serif', color: '#555555' }}>
            This is a digitally issued certificate and does not require a handwritten signature. The digital authorization is valid and acceptable for official use.
          </p>
        </div>

      </div>
    </div>
  )
}
