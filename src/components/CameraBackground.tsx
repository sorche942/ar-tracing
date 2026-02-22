import React, { useEffect, useRef, useState } from 'react';

const CameraBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const setupCamera = async () => {
    setError(null);
    try {
      // Simplest possible constraints for maximum compatibility
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === 'NotAllowedError') {
        setError("Camera access denied. Please allow camera access in Safari settings.");
      } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        setError("Safari requires HTTPS to use the camera. Please use a secure connection.");
      } else {
        setError(`Camera Error: ${err.message || "Unknown error"}`);
      }
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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
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
          background: isStreaming ? 'transparent' : 'rgba(0,0,0,0.8)',
          zIndex: 500,
          padding: '20px',
          textAlign: 'center',
          color: 'white',
          fontFamily: "'Figtree', sans-serif"
        }}>
          {error ? (
            <div style={{ marginBottom: '20px', color: '#ff4d4d' }}>{error}</div>
          ) : (
            <p style={{ marginBottom: '20px' }}>Camera initialization required for AR tracing.</p>
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
