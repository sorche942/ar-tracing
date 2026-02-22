import React, { useState } from 'react';
import { Stage, Layer } from 'react-konva';
import CameraBackground from './components/CameraBackground';
import DraggableImage from './components/DraggableImage';
import { Upload, Trash2, Layers } from 'lucide-react';

interface ImageData {
  id: string;
  src: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newImage: ImageData = {
          id: Math.random().toString(36).substr(2, 9),
          src: reader.result as string,
          x: 50,
          y: 50,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 0.5,
        };
        setImages([...images, newImage]);
        setSelectedId(newImage.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (newAttrs: ImageData) => {
    setImages(images.map((img) => (img.id === newAttrs.id ? newAttrs : img)));
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedId) {
      const opacity = parseFloat(e.target.value);
      setImages(images.map((img) => (img.id === selectedId ? { ...img, opacity } : img)));
    }
  };

  const removeSelected = () => {
    if (selectedId) {
      setImages(images.filter((img) => img.id !== selectedId));
      setSelectedId(null);
    }
  };

  const checkDeselect = (e: any) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const selectedImage = images.find((img) => img.id === selectedId);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', overflow: 'hidden', background: 'black' }}>
      <CameraBackground />

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Layer>
          {images.map((img) => (
            <DraggableImage
              key={img.id}
              imageProps={img}
              isSelected={img.id === selectedId}
              onSelect={() => setSelectedId(img.id)}
              onChange={handleImageChange}
            />
          ))}
        </Layer>
      </Stage>

      {/* UI Controls */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(20px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'rgba(0,0,0,0.6)',
        padding: '15px',
        borderRadius: '15px',
        backdropFilter: 'blur(5px)',
        color: 'white',
        zIndex: 100,
        width: '90%',
        maxWidth: '400px',
        fontFamily: "'Figtree', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Upload size={20} />
            <span>Add Image</span>
            <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
          </label>
          
          {selectedId && (
            <button onClick={removeSelected} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Trash2 size={20} />
              <span>Remove</span>
            </button>
          )}
        </div>

        {selectedId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Layers size={16} />
              <span style={{ fontSize: '14px' }}>Opacity: {Math.round((selectedImage?.opacity || 0) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedImage?.opacity || 0.5}
              onChange={handleOpacityChange}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      <style>{`
        body { margin: 0; padding: 0; overflow: hidden; background: black; }
        input[type=range] {
          -webkit-appearance: none;
          background: rgba(255, 255, 255, 0.2);
          height: 4px;
          border-radius: 2px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default App;
