'use client';

interface EurekaLogoProps {
  size?: number;
  className?: string;
}

export default function EurekaLogo({ size = 32, className = '' }: EurekaLogoProps) {
  const padding = size * 0.2;
  const boltSize = size - padding * 2;

  return (
    <div
      className={`flex items-center justify-center rounded-lg flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #1A1A3A 0%, #12122A 100%)',
        border: '1px solid rgba(79, 142, 255, 0.2)',
        boxShadow: '0 0 12px rgba(79, 142, 255, 0.08)',
      }}
    >
      <svg
        width={boltSize}
        height={boltSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 2L4.09 12.64a1 1 0 00.78 1.64H11l-1 7.28a.5.5 0 00.86.42L20.91 11.36a1 1 0 00-.78-1.64H13l1-7.28A.5.5 0 0013.14 2z"
          fill="url(#bolt-gradient)"
          stroke="url(#bolt-stroke)"
          strokeWidth="0.5"
        />
        <defs>
          <linearGradient id="bolt-gradient" x1="4" y1="2" x2="20" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6BABFF" />
            <stop offset="0.5" stopColor="#4F8EFF" />
            <stop offset="1" stopColor="#7C5CF6" />
          </linearGradient>
          <linearGradient id="bolt-stroke" x1="4" y1="2" x2="20" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8EC5FF" />
            <stop offset="1" stopColor="#9B72FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
