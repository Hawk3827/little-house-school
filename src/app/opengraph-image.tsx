import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'LITTLE HOUSE • A Family of Learning (Waiton Lamkhai, Manipur)';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundImage: 'linear-gradient(to bottom right, #0369a1, #0c4a6e, #0f172a)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Decorative Grid Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.08,
            backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Top Header Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '18px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              🏫
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  textTransform: 'uppercase',
                }}
              >
                LITTLE HOUSE
              </span>
              <span
                style={{
                  fontSize: '16px',
                  color: '#38bdf8',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                A Family of Learning
              </span>
            </div>
          </div>

          {/* Admissions Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f59e0b',
              color: '#0f172a',
              padding: '10px 24px',
              borderRadius: '9999px',
              fontWeight: 900,
              fontSize: '14px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
            }}
          >
            ● Admissions Open 2026–2027
          </div>
        </div>

        {/* Center Main Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
          <span
            style={{
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1px',
              maxWidth: '900px',
              textTransform: 'uppercase',
            }}
          >
            Shaping Minds. <br />
            <span style={{ color: '#38bdf8' }}>Inspiring</span> Character.
          </span>

          <span
            style={{
              fontSize: '20px',
              color: '#cbd5e1',
              maxWidth: '850px',
              lineHeight: 1.4,
            }}
          >
            Nurturing academic excellence, ethical leadership, and creative innovation for children in Manipur from Play-Group to Class VI.
          </span>
        </div>

        {/* Bottom Feature Tags & Campus Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '2px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '24px',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <span
              style={{
                fontSize: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '6px 16px',
                borderRadius: '12px',
                fontWeight: 700,
              }}
            >
              🎓 Play-Group to Class VI
            </span>
            <span
              style={{
                fontSize: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '6px 16px',
                borderRadius: '12px',
                fontWeight: 700,
              }}
            >
              👥 1:12 Teacher Ratio
            </span>
            <span
              style={{
                fontSize: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '6px 16px',
                borderRadius: '12px',
                fontWeight: 700,
              }}
            >
              🚌 Van Transport Available
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              fontSize: '13px',
              color: '#94a3b8',
              fontWeight: 600,
            }}
          >
            <span style={{ color: 'white', fontWeight: 800 }}>📍 Waiton Lamkhai, Imphal East</span>
            <span>www.littlehouse.edu.in</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
