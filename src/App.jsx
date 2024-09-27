import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';

const CANVAS_HEIGHT = 1080;
const CANVAS_WIDTH = 1080;

const FrameComponent = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        fill="red"
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const TemplateCreator = () => {
  const [canvasWidth, setCanvasWidth] = useState(CANVAS_WIDTH);
  const [frames, setFrames] = useState([]);
  const [selectedId, selectShape] = useState(null);

  const handleExtendCanvas = () => {
    setCanvasWidth(canvasWidth + CANVAS_WIDTH);
  };

  const handleAddFrame = () => {
    const newFrame = {
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      rotation: 0,
      id: `frame-${frames.length + 1}`,
    };
    setFrames([...frames, newFrame]);
  };

  const handleSelectShape = (id) => {
    selectShape(id);
  };

  const handleShapeChange = (newAttrs) => {
    const updatedFrames = frames.map((frame) => {
      if (frame.id === newAttrs.id) {
        return newAttrs;
      }
      return frame;
    });
    setFrames(updatedFrames);
  };

  const generateJSON = () => {
    const template = {
      name: "Custom Template",
      panels: Math.ceil(canvasWidth / CANVAS_WIDTH),
      frames: frames.map((frame) => ({
        x: frame.x / canvasWidth,
        y: frame.y / CANVAS_HEIGHT,
        width: frame.width,
        height: frame.height,
        rotation: frame.rotation,
      })),
    };
    return JSON.stringify([template], null, 2);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className=" flex-grow overflow-auto bg-gray-100">
        <Stage width={canvasWidth} height={CANVAS_HEIGHT}>
          <Layer>
            <Rect width={canvasWidth} height={CANVAS_HEIGHT} fill="white" />
            {frames.map((frame, i) => (
              <FrameComponent
                
                key={frame.id}
                shapeProps={frame}
                isSelected={frame.id === selectedId}
                onSelect={() => handleSelectShape(frame.id)}
                onChange={handleShapeChange}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <div className="p-4 bg-gray-200">
        <div className="flex justify-between mb-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleExtendCanvas}>
            Extend Canvas
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleAddFrame}>
            Add Frame
          </button>
        </div>
        <textarea
          className="w-full h-40 p-2 border rounded"
          value={generateJSON()}
          readOnly
        />
      </div>
    </div>
  );
};

export default TemplateCreator;