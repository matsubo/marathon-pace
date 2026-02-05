export default function OgImage() {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}
    >
      {/* Coral gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #D94F30 0%, #A93B24 100%)',
        }}
      />

      {/* Diagonal track lines */}
      <svg
        style={{ position: 'absolute', inset: 0, width: 1200, height: 630 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: 50 }, (_, i) => {
          const x = i * 50 - 630
          return (
            <line
              key={i}
              x1={x}
              y1={0}
              x2={x + 630}
              y2={630}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          )
        })}
      </svg>

      {/* White card */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 48,
          right: 48,
          bottom: 48,
          background: 'white',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 60px',
        }}
      >
        {/* Runner emoji + Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 36 }}>🏃</span>
          <h1
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 34,
              fontWeight: 600,
              color: '#1C1917',
              letterSpacing: '0.02em',
              margin: 0,
            }}
          >
            Marathon Pace Chart
          </h1>
        </div>

        {/* Big time display */}
        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 140,
            color: '#D94F30',
            lineHeight: 1,
            letterSpacing: '0.04em',
            marginTop: 4,
            marginBottom: 4,
          }}
        >
          4:00:00
        </div>

        {/* Target finish time label */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: '#78716C',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.15em',
            marginBottom: 24,
          }}
        >
          Target Finish Time
        </div>

        {/* Pace box */}
        <div
          style={{
            background: '#FEF2EF',
            borderRadius: 14,
            padding: '16px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#78716C',
              letterSpacing: '0.05em',
            }}
          >
            PACE PER KM
          </div>
          <div
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 52,
              color: '#D94F30',
              lineHeight: 1,
              letterSpacing: '0.03em',
            }}
          >
            5:41 /km
          </div>
        </div>

        {/* Bottom stats */}
        <div
          style={{
            fontSize: 17,
            color: '#A8A29E',
            fontWeight: 400,
          }}
        >
          Half Marathon: 1:59:57 &nbsp;|&nbsp; Full Marathon: 4:00:00
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: 15,
            color: '#D6D3D1',
            marginTop: 8,
            letterSpacing: '0.03em',
          }}
        >
          Marathon Pace Chart &middot; 42.195 km
        </div>
      </div>
    </div>
  )
}
