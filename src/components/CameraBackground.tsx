import React, { useEffect, useRef, useState } from 'react';

const CameraBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const setupCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Safari fix: ensure video is ready before playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsStreaming(true);
          }).catch(e => {
            console.error("Play failed:", e);
            setError("Tap 'Enable Camera' to start video feed.");
          });
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError(`Camera Error: ${err.message || "Unknown error"}`);
    }
  };

  useEffect(() => {
    setupCamera();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        // Safari specific attributes
        controls={false}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1, // Base layer
          pointerEvents: 'none', // Critical: allows clicks to pass through to Konva
          background: 'black'
        }}
      />
      
      {(!isStreaming || error) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 500, // Above video but below UI
          padding: '20px',
          textAlign: 'center',
          color: 'white',
          fontFamily: "'Figtree', sans-serif"
        }}>
          {error ? (
            <div style={{ marginBottom: '20px', color: '#ff4d4d' }}>{error}</div>
          ) : (
            <p style={{ marginBottom: '20px' }}>Waiting for camera...</p>
          )}
          <button 
            onClick={setupCamera}
            style={{
              padding: '12px 24px',
              borderRadius: '30px',
              border: 'none',
              background: '#ffffff',
              color: '#000000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {error ? "Try Again" : "Enable Camera"}
          </button>
        </div>
      )}
    </>
  );
};

export default CameraBackground;
