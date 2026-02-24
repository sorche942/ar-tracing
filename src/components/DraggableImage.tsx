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

  return (
    <React.Fragment>
      <Image
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...imageProps}
        image={img}
        draggable
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
          cornerRadius={isCoarsePointer ? 14 : 10}
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
