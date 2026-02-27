import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const FALLBACK_TITLE = 'Sifael Mahali';
const FALLBACK_SUBTITLE = 'Cybersecurity | CTF Player | Networking Enthusiast';

function clampText(value: string | null, max: number) {
  if (!value) return null;
  return value.trim().slice(0, max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = clampText(searchParams.get('title'), 70) ?? FALLBACK_TITLE;
  const subtitle = clampText(searchParams.get('subtitle'), 110) ?? FALLBACK_SUBTITLE;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background:
            'radial-gradient(circle at 20% 20%, rgba(255,138,61,.25), transparent 35%), radial-gradient(circle at 80% 80%, rgba(255,88,31,.22), transparent 40%), #080909',
          color: '#f6ede6',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          letterSpacing: '-0.02em',
          padding: '56px 72px',
          width: '100%'
        }}
      >
        <div
          style={{
            border: '1px solid rgba(255,153,102,0.34)',
            borderRadius: 18,
            color: '#ffa366',
            fontSize: 22,
            letterSpacing: '0.18em',
            marginBottom: 26,
            padding: '10px 18px',
            textTransform: 'uppercase'
          }}
        >
          Portfolio
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 980,
            textAlign: 'center'
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: '#c8b6a8',
            fontSize: 30,
            marginTop: 20,
            maxWidth: 980,
            textAlign: 'center'
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { height: 630, width: 1200 }
  );
}
