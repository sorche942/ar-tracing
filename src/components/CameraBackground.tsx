import React, { useEffect, useRef, useState } from 'react';

const CameraBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      const constraints = [
        {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false,
        },
        {
          video: { facingMode: 'environment' },
          audio: false,
        },
        {
          video: true,
          audio: false,
        }
      ];

      let stream: MediaStream | null = null;
      
      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          if (stream) break;
        } catch (err) {
          console.warn("Failed to get camera with constraint:", constraint, err);
        }
      }

      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays on iOS
        videoRef.current.play().catch(e => {
          console.error("Video play failed:", e);
          setError("Tap to start camera if it doesn't appear.");
        });
      } else {
        setError("Could not access camera. Please ensure permissions are granted.");
      }
    }

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
        webkit-playsinline="true"
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
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,0,0,0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          zIndex: 1000,
          fontSize: '14px',
          fontFamily: "'Figtree', sans-serif"
        }}>
          {error}
        </div>
      )}
    </>
  );
};

export default CameraBackground;
