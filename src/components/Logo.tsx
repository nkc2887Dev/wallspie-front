interface LogoProps {
  variant?: 'default' | 'light' | 'dark' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function Logo({
  variant = 'default',
  size = 'md',
  showText = true,
  className = ''
}: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-2xl' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl' },
  };

  const variants = {
    default: {
      icon: 'text-purple-600',
      text: 'text-purple-600',
      gradient: false,
    },
    light: {
      icon: 'text-white',
      text: 'text-white',
      gradient: false,
    },
    dark: {
      icon: 'text-gray-900',
      text: 'text-gray-900',
      gradient: false,
    },
    gradient: {
      icon: '',
      text: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
      gradient: true,
    },
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        {currentVariant.gradient ? (
          <div className="relative">
            {/* Gradient background for icon */}
            <div className={`${currentSize.icon} rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 p-1.5 shadow-lg`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full text-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Mountain/Wall shape */}
                <path
                  d="M3 19L8 9L12 14L16 6L21 15V19H3Z"
                  fill="currentColor"
                  opacity="0.8"
                />
                {/* Camera/Frame shape */}
                <path
                  d="M4 5H9L10 3H14L15 5H20C20.5523 5 21 5.44772 21 6V18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18V6C3 5.44772 3.44772 5 4 5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Circle in center (lens) */}
                <circle
                  cx="12"
                  cy="12"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Sparkle effect */}
                <path
                  d="M18 8L18.5 9.5L20 10L18.5 10.5L18 12L17.5 10.5L16 10L17.5 9.5L18 8Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 opacity-20 blur-md -z-10"></div>
          </div>
        ) : (
          <div className={`${currentSize.icon} rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 p-1.5 shadow-md`}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={`w-full h-full ${currentVariant.icon}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Mountain/Wall shape */}
              <path
                d="M3 19L8 9L12 14L16 6L21 15V19H3Z"
                fill="white"
                opacity="0.8"
              />
              {/* Camera/Frame shape */}
              <path
                d="M4 5H9L10 3H14L15 5H20C20.5523 5 21 5.44772 21 6V18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18V6C3 5.44772 3.44772 5 4 5Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Circle in center (lens) */}
              <circle
                cx="12"
                cy="12"
                r="3.5"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Sparkle effect */}
              <path
                d="M18 8L18.5 9.5L20 10L18.5 10.5L18 12L17.5 10.5L16 10L17.5 9.5L18 8Z"
                fill="white"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`font-bold ${currentSize.text} ${currentVariant.text}`}>
          WallsPie
        </span>
      )}
    </div>
  );
}
