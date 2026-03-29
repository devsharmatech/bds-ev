'use client';

export default function MembershipCardTemplate({ user }) {
  if (!user) return null;

  const expiryDate = user.membership_expiry_date ? new Date(user.membership_expiry_date).toLocaleDateString('en-BH', { 
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Bahrain' 
  }) : 'N/A';

  return (
    <div 
      className="relative rounded-2xl overflow-hidden shadow-2xl bg-white"
      style={{
        width: '540px',
        height: '340px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Premium Background */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/membership-bg.png" 
          alt="Card Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col p-8 z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-auto">
          <div>
            <h1 className="text-white text-xl font-bold tracking-wider mb-0.5">BAHRAIN DENTAL SOCIETY</h1>
            <p className="text-blue-200/80 text-[10px] uppercase font-semibold tracking-[0.2em]">Official Member Card</p>
          </div>
          <img src="/logo2-r.png" alt="BDS Logo" className="h-14 brightness-0 invert opacity-90" />
        </div>

        {/* Member Info Section */}
        <div className="flex gap-6 items-end">
          {/* Member Details */}
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-blue-200/60 text-[8px] uppercase font-bold tracking-widest mb-1">Card Holder</p>
              <h2 className="text-white text-2xl font-bold tracking-tight uppercase truncate max-w-[300px]">
                {user.full_name}
              </h2>
            </div>

            <div className="flex gap-10">
              <div>
                <p className="text-blue-200/60 text-[8px] uppercase font-bold tracking-widest mb-1">Member ID</p>
                <p className="text-white font-mono text-lg font-bold tracking-tighter">{user.membership_code}</p>
              </div>
              <div>
                <p className="text-blue-200/60 text-[8px] uppercase font-bold tracking-widest mb-1">Valid Until</p>
                <p className="text-white font-semibold text-sm uppercase">{expiryDate}</p>
              </div>
            </div>
          </div>

          {/* Type Badge */}
          <div className="flex flex-col items-center">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              user.membership_type === 'paid' 
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg' 
                : 'bg-blue-300/20 text-blue-200 border border-blue-400/30 backdrop-blur-sm'
            }`}>
              {user.membership_type === 'paid' ? 'Premium Member' : 'Standard Member'}
            </div>
          </div>
        </div>
      </div>

      {/* Micro-animations and effects */}
      <style jsx>{`
        .relative { transition: transform 0.3s ease; }
        .relative:hover { transform: scale(1.02) rotate(0.5deg); }
      `}</style>
    </div>
  );
}
