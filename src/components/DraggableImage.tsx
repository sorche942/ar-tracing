import React, { useRef, useEffect } from 'react';
import { Image, Rect, Transformer } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';

interface DraggableImageProps {
  imageProps: {
    id: string;
    src: string;
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    opacity: number;
  };
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}

const DraggableImage: React.FC<DraggableImageProps> = ({ imageProps, isSelected, onSelect, onChange }) => {
  const [img] = useImage(imageProps.src);
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const lastDist = useRef<number>(0);
  const startScale = useRef<{ x: number, y: number }>({ x: 1, y: 1 });
  const startPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const startCenter = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  
  const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const anchorSize = isCoarsePointer ? 30 : 16;
  const selectionColor = '#c4b5fd';
  const rotateOffset = isCoarsePointer ? 96 : 70;

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const getDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const getCenter = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  return (
    <React.Fragment>
      <Image
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...imageProps}
        image={img}
        draggable
        onTouchStart={(e) => {
          if (e.evt.touches.length === 2) {
            if (!isSelected) {
              onSelect();
            }
            const p1 = {
              x: e.evt.touches[0].clientX,
              y: e.evt.touches[0].clientY,
            };
            const p2 = {
              x: e.evt.touches[1].clientX,
              y: e.evt.touches[1].clientY,
            };
            lastDist.current = getDistance(p1, p2);
            startScale.current = { x: imageProps.scaleX, y: imageProps.scaleY };
            startPos.current = { x: imageProps.x, y: imageProps.y };
            startCenter.current = getCenter(p1, p2);
          }
        }}
        onTouchMove={(e) => {
          if (e.evt.touches.length === 2 && isSelected) {
            if (e.evt.cancelable) {
              e.evt.preventDefault();
            }
            // Stop dragging when pinching
            e.target.stopDrag();
            
            const p1 = {
              x: e.evt.touches[0].clientX,
              y: e.evt.touches[0].clientY,
            };
            const p2 = {
              x: e.evt.touches[1].clientX,
              y: e.evt.touches[1].clientY,
            };

            const dist = getDistance(p1, p2);
            if (lastDist.current > 0) {
              const scaleRatio = dist / lastDist.current;
              const newScaleX = startScale.current.x * scaleRatio;
              const newScaleY = startScale.current.y * scaleRatio;

              // Calculate new position to scale from center of pinch
              const newX = startCenter.current.x + (startPos.current.x - startCenter.current.x) * scaleRatio;
              const newY = startCenter.current.y + (startPos.current.y - startCenter.current.y) * scaleRatio;

              if (Math.abs(newScaleX) > 0.05 && Math.abs(newScaleY) > 0.05) {
                onChange({
                  ...imageProps,
                  x: newX,
                  y: newY,
                  scaleX: newScaleX,
                  scaleY: newScaleY,
                });
              }
            }
          }
        }}
        onTouchEnd={() => {
          lastDist.current = 0;
        }}
        onDragMove={(e) => {
          onChange({
            ...imageProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragEnd={(e) => {
          onChange({
            ...imageProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransform={() => {
          const node = shapeRef.current;
          if (!node) return;
          onChange({
            ...imageProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // reset scale to 1 and update width/height instead? 
          // Actually for Konva images, keeping scale is fine.
          onChange({
            ...imageProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: scaleY,
          });
        }}
      />
      {isSelected && img && (
        <Rect
          listening={false}
          x={imageProps.x}
          y={imageProps.y}
          width={img.width}
          height={img.height}
          rotation={imageProps.rotation}
          scaleX={imageProps.scaleX}
          scaleY={imageProps.scaleY}
          stroke={selectionColor}
          strokeWidth={isCoarsePointer ? 3 : 2}
          shadowColor="rgba(196,181,253,0.45)"
          shadowBlur={isCoarsePointer ? 14 : 10}
          shadowEnabled
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          borderEnabled={false}
          anchorSize={anchorSize}
          anchorCornerRadius={anchorSize / 2}
          anchorFill="#f5f3ff"
          anchorStroke={selectionColor}
          anchorStrokeWidth={isCoarsePointer ? 3 : 2}
          padding={isCoarsePointer ? 18 : 10}
          rotateAnchorOffset={rotateOffset}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default DraggableImage;
