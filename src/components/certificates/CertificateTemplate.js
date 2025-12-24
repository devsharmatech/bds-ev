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

  return (
    <div 
      className="bg-white w-full mx-auto p-0 certificate-container"
      style={{
        width: '8.5in',
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
        <div className="relative h-20 overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(to bottom, rgba(3, 33, 95, 0.05), transparent)' }}>
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path d="M0,50 Q300,0 600,50 T1200,50 L1200,100 L0,100 Z" fill="#03215F" opacity="0.15"/>
            <path d="M0,60 Q300,20 600,60 T1200,60 L1200,100 L0,100 Z" fill="#AE9B66" opacity="0.15"/>
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
            <div className="w-16 h-16 flex items-center justify-center">
              {/* Bahrain National Emblem */}
              <div className="text-4xl">🇧🇭</div>
            </div>
          </div>

          {/* NHRA Logo - Right */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xs font-bold lowercase" style={{ fontFamily: 'sans-serif', letterSpacing: '0.5px', color: '#03215F' }}>nhra</div>
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#16a34a' }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffffff' }}></div>
              </div>
            </div>
            <div className="text-xs font-bold mb-1" style={{ color: '#03215F' }}>BAHRAIN</div>
            <div className="text-[8px] mt-1 text-right max-w-[140px] leading-tight" style={{ color: '#6b7280' }}>
              الهيئة الوطنية لتنظيم المهن والخدمات الصحية
              <br />
              NATIONAL HEALTH REGULATORY AUTHORITY
            </div>
          </div>
        </div>

        {/* Main Certificate Content */}
        <div className="px-12 py-6 flex-1 flex flex-col justify-between" style={{ minHeight: 0 }}>
          {/* Title */}
          <div className="text-center mb-5">
            <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'serif', letterSpacing: '2px', color: '#03215F' }}>
              CERTIFICATE
            </h1>
            <div className="flex items-center justify-center gap-4 my-3">
              <div className="h-px flex-1 max-w-[200px]" style={{ backgroundColor: '#AE9B66' }}></div>
              <div className="w-3 h-3 transform rotate-45" style={{ backgroundColor: '#AE9B66' }}></div>
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
              {user?.full_name || 'Dr. Talal Al Alawi'}
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
            <p className="text-base" style={{ fontFamily: 'serif', color: '#374151' }}>
              <span className="font-semibold">NHRA Approved Credits:</span>{' '}
              <span className="font-bold" style={{ color: '#b8352d' }}>1 CME Credit Hours.</span>
            </p>
            <p className="text-base" style={{ fontFamily: 'serif', color: '#374151' }}>
              <span className="font-semibold">NHRA Accreditation Code:</span>{' '}
              <span className="font-mono" style={{ color: '#b8352d' }}>
                {generateNHRACode(certificate?.event_id, certificate?.checked_in_at || certificate?.event_date)}
              </span>
            </p>
            <p className="text-base" style={{ fontFamily: 'serif', color: '#374151' }}>
              Held in {certificate?.venue_name || 'Crown Prince Center for Training and Medical Research, Kingdom of Bahrain'}.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 mb-4 p-3" style={{ backgroundColor: '#f9fafb', borderLeft: '4px solid #03215F' }}>
            <p className="text-sm italic" style={{ fontFamily: 'serif', color: '#6b7280' }}>
              This certificate is an attendance certificate of a CPD activity only that should & can be used towards your CPD requirements for Professional License renewal. It is by no means an academic certificate.
            </p>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-6 mb-4">
            <div className="flex-1 text-center">
              <div className="h-14 mb-2 w-44 mx-auto" style={{ borderBottom: '2px solid #9ca3af' }}></div>
              <p className="text-base font-semibold" style={{ fontFamily: 'serif', color: '#1f2937' }}>
                Dr. Abbas Alfardan
              </p>
              <p className="text-sm" style={{ fontFamily: 'serif', color: '#6b7280' }}>
                President of Bahrain Dental Society
              </p>
            </div>
            <div className="flex-1 text-center">
              <div className="h-14 mb-2 w-44 mx-auto" style={{ borderBottom: '2px solid #9ca3af' }}></div>
              <p className="text-base font-semibold" style={{ fontFamily: 'serif', color: '#1f2937' }}>
                Dr. Maysoon Alalawi
              </p>
              <p className="text-sm" style={{ fontFamily: 'serif', color: '#6b7280' }}>
                Head of Scientific Committee
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Wave - Blue and Gold */}
        <div className="relative h-20 overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(to top, rgba(3, 33, 95, 0.05), transparent)' }}>
          <svg className="absolute top-0 w-full h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path d="M0,50 Q300,0 600,50 T1200,50 L1200,0 L0,0 Z" fill="#03215F" opacity="0.15"/>
            <path d="M0,60 Q300,20 600,60 T1200,60 L1200,0 L0,0 Z" fill="#AE9B66" opacity="0.15"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
