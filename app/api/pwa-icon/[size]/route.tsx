import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params
  const dim = Math.min(Math.max(parseInt(size) || 192, 16), 512)
  const r = Math.round(dim * 0.22)  // corner radius

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0D9488',
          width: '100%',
          height: '100%',
          borderRadius: r,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        {/* Briefcase shape */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          {/* Handle */}
          <div
            style={{
              width: Math.round(dim * 0.28),
              height: Math.round(dim * 0.09),
              border: `${Math.round(dim * 0.04)}px solid rgba(255,255,255,0.9)`,
              borderBottom: 'none',
              borderRadius: `${Math.round(dim * 0.06)}px ${Math.round(dim * 0.06)}px 0 0`,
              marginBottom: -Math.round(dim * 0.015),
            }}
          />
          {/* Body */}
          <div
            style={{
              width: Math.round(dim * 0.55),
              height: Math.round(dim * 0.38),
              background: 'rgba(255,255,255,0.9)',
              borderRadius: Math.round(dim * 0.05),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: Math.round(dim * 0.14),
                height: Math.round(dim * 0.14),
                borderRadius: '50%',
                background: '#0D9488',
              }}
            />
          </div>
        </div>
        {/* Wordmark */}
        <div
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: Math.round(dim * 0.1),
            fontWeight: 700,
            fontFamily: 'Arial, sans-serif',
            letterSpacing: Math.round(dim * 0.012),
            marginTop: Math.round(dim * 0.04),
          }}
        >
          SHO8LANA
        </div>
      </div>
    ),
    { width: dim, height: dim },
  )
}
