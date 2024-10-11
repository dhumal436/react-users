import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer, Image as KonvaImage, Line, Group, Text } from 'react-konva';
import { FaEye, FaEyeSlash, FaArrowUp, FaArrowDown, FaBars, FaExchangeAlt } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CanvasRenderer from './CanvaRendere';
// import elementImages from './elementImages';
const elementImages = [
  {
    name: "Star",
    url: "https://www.transparentpng.com/thumb/flower/flowers-photo-png-34.png"
  },
  {
    name: "Heart",
    url: "https://www.transparentpng.com/thumb/flower/flowers-photo-png-34.png"
  },
  {
    name: "Cloud",
    url: "https://www.transparentpng.com/thumb/flower/flowers-photo-png-34.png"
  },
  {
    name: "Tree",
    url: "https://www.transparentpng.com/thumb/flower/flowers-photo-png-34.png"
  },
  {
    name: "Sun",
    url: "https://www.transparentpng.com/thumb/flower/flowers-photo-png-34.png"
  },
  {
    name: "Moon",
    url: "https://www.transparentpng.com/thumb/flower/flowers-photo-png-34.png"
  }
];
const CANVAS_HEIGHT = 1080;
const CANVAS_WIDTH = 1080;
const SNAP_THRESHOLD = 10; // Distance in pixels to trigger snapping

function randomColorFromPalette() {
  // Base color in RGB
  const baseColor = {
      r: 238, // Red
      g: 255, // Green
      b: 150, // Blue
  };

  // Define the maximum brightness to avoid whites
  const maxBrightness = 200;

  // Randomly adjust the RGB values while ensuring they stay below the max brightness
  const randomR = Math.max(0, Math.min(255, baseColor.r + Math.floor(Math.random() * 50) - 25));
  const randomG = Math.max(0, Math.min(255, baseColor.g + Math.floor(Math.random() * 50) - 25));
  const randomB = Math.max(0, Math.min(255, baseColor.b + Math.floor(Math.random() * 50) - 25));

  // 

  // Generate a random alpha value (0.4 to 1.0)
  const randomA = (Math.random() * (1 - 0.4)) + 0.4;

  // Return the color in RGBA format
  return `rgba(${randomR}, ${randomG}, ${randomB}, ${randomA})`;
}


const Grid = ({ width, height, mainGridColor, thirdsGridColor, gridSize }) => {
  const lines = [];
  
  // Fine grid
  for (let i = 0; i <= width; i += gridSize) {
    lines.push(
      <Line
        key={`v${i}`}
        points={[i, 0, i, height]}
        stroke={mainGridColor}
        strokeWidth={1}
      />
    );
  }
  
  for (let i = 0; i <= height; i += gridSize) {
    lines.push(
      <Line
        key={`h${i}`}
        points={[0, i, width, i]}
        stroke={mainGridColor}
        strokeWidth={1}
      />
    );
  }
  
  // 3x3 grid
  const thirdWidth = width / 3;
  const thirdHeight = height / 3;
  
  for (let i = 1; i < (width/1080)*3; i++) {
    lines.push(
      <Line
        key={`v3${i}`}
        points={[i * 360, 0, i * 360, height]}
        stroke={thirdsGridColor}
        strokeWidth={2}
      />
    );
    if(i<=3){
      lines.push(
        <Line
          key={`h3${i}`}
          points={[0, i * thirdHeight, width, i * thirdHeight]}
          stroke={thirdsGridColor}
          strokeWidth={2}
        />
      );
    }
  }
  
  return <Group>{lines}</Group>;
};

const FrameComponent = ({ shapeProps, isSelected, onSelect, onChange, onDragMove, snapToGrid, gridSize, onDelete }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const snapSizeToGrid = (size) => {
    return Math.round(size / gridSize) * gridSize;
  };

  return (
    <>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        fill={shapeProps.backgroundColor}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragMove={(e) => {
          const newPos = e.target.position();
          const snappedPos = snapToGrid(newPos);
          e.target.position(snappedPos);
          onDragMove(e, snappedPos);
        }}
        onDragEnd={(e) => {
          const snappedPos = snapToGrid(e.target.position());
          onChange({
            ...shapeProps,
            x: snappedPos.x,
            y: snappedPos.y,
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          const snappedPos = snapToGrid({ x: node.x(), y: node.y() });
          const snappedWidth = snapSizeToGrid(Math.max(5, node.width() * scaleX));
          const snappedHeight = snapSizeToGrid(Math.max(5, node.height() * scaleY));

          onChange({
            ...shapeProps,
            x: snappedPos.x,
            y: snappedPos.y,
            width: snappedWidth,
            height: snappedHeight,
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <>
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Snap to grid while resizing
              const snappedBox = {
                ...newBox,
                width: snapSizeToGrid(newBox.width),
                height: snapSizeToGrid(newBox.height),
              };
              return snappedBox.width < 5 || snappedBox.height < 5 ? oldBox : snappedBox;
            }}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            rotationSnapTolerance={5}
          />
         
          <Text
            text={shapeProps.rotation + "X"}
            x={shapeProps.x + shapeProps.width - 20}
            y={shapeProps.y}
            fontSize={20}
            fill="red"
            onClick={() => onDelete(shapeProps.id)}
            onTap={() => onDelete(shapeProps.id)}
          />
        </>
      )}
    </>
  );
};

const ElementComponent = ({ elementProps, isSelected, onSelect, onChange, onDragMove, snapToGrid, gridSize, onDelete }) => {
  const elementRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([elementRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const snapSizeToGrid = (size) => {
    return Math.round(size / gridSize) * gridSize;
  };

  const handleFlipHorizontal = () => {
    onChange({
      ...elementProps,
      scaleX: -elementProps.scaleX ?? -1,
    });
  };

  const handleFlipVertical = () => {
    onChange({
      ...elementProps,
      scaleY: -elementProps.scaleY,
    });
  };

  return (
    <>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        image={elementProps.image}
        ref={elementRef}
        {...elementProps}
        draggable
        onDragMove={(e) => {
          const newPos = e.target.position();
          const snappedPos = snapToGrid(newPos);
          e.target.position(snappedPos);
          onDragMove(e, snappedPos);
        }}
        onDragEnd={(e) => {
          const snappedPos = snapToGrid(e.target.position());
          onChange({
            ...elementProps,
            x: snappedPos.x,
            y: snappedPos.y,
          });
        }}
        onTransformEnd={(e) => {
          const node = elementRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          const snappedPos = snapToGrid({ x: node.x(), y: node.y() });
          const snappedWidth = snapSizeToGrid(Math.max(5, node.width() * scaleX));
          const snappedHeight = snapSizeToGrid(Math.max(5, node.height() * scaleY));

          onChange({
            ...elementProps,
            x: snappedPos.x,
            y: snappedPos.y,
            width: snappedWidth,
            height: snappedHeight,
            rotation: node.rotation(),
          });
        }}
        scaleX={elementProps.scaleX || 1}
        scaleY={elementProps.scaleY || 1}
      />

      {isSelected && (
        <>
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              const snappedBox = {
                ...newBox,
                width: snapSizeToGrid(newBox.width),
                height: snapSizeToGrid(newBox.height),
              };
              return snappedBox.width < 5 || snappedBox.height < 5 ? oldBox : snappedBox;
            }}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            rotationSnapTolerance={5}
          />
          <Group>

          <Text
            text={elementProps.rotation + "X"}
            x={elementProps.x + elementProps.width - 20}
            y={elementProps.y}
            fontSize={20}
            fill="red"
            onClick={() => onDelete(elementProps.id)}
            onTap={() => onDelete(elementProps.id)}
          />
            <Rect
              x={elementProps.x}
              y={elementProps.y - 30}
              width={30}
              height={30}
              fill="white"
              stroke="black"
              strokeWidth={1}
            />
            <Text
              text="↔"
              x={elementProps.x + 5}
              y={elementProps.y - 25}
              fontSize={20}
              onClick={handleFlipHorizontal}
              onTap={handleFlipHorizontal}
            />
            <Rect
              x={elementProps.x + 35}
              y={elementProps.y - 30}
              width={30}
              height={30}
              fill="white"
              stroke="black"
              strokeWidth={1}
            />
            <Text
              text="↕"
              x={elementProps.x + 40}
              y={elementProps.y - 25}
              fontSize={20}
              onClick={handleFlipVertical}
              onTap={handleFlipVertical}
            />
          </Group>
        </>
      )}
    </>
  );
};

const TemplateCreator = () => {
  const [canvasWidth, setCanvasWidth] = useState(CANVAS_WIDTH);
  const [selectedId, selectShape] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const stageRef = useRef(null);
  const [mainGridColor, setMainGridColor] = useState("#ddd");
  const [thirdsGridColor, setThirdsGridColor] = useState("#3498db");
  const [gridSize, setGridSize] = useState(60);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [pastedImages, setPastedImages] = useState([]);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [layers, setLayers] = useState([]);
  const [shapes, setShapes] = useState([]);

  const handleExtendCanvas = () => {
    setCanvasWidth(canvasWidth + CANVAS_WIDTH);
  };

  const handleAddFrame = () => {
    const newFrame = {
      x: 0,
      y: 0,
      width: gridSize * 2,
      height: gridSize * 2,
      rotation: 0,
      backgroundColor: randomColorFromPalette(),
      id: `frame-${shapes.length + 1}`,
      type: 'frame',
    };
    setShapes([...shapes, newFrame]);
  };

  const handleSelectShape = (id) => {
    selectShape(id);
    // Scroll the layer panel to the selected shape
    const layerElement = document.getElementById(`layer-${id}`);
    if (layerElement) {
      layerElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleAddElement = (imageUrl) => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      const newElement = {
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
        rotation: 0,
        image: img,
        id: `${imageUrl}-${shapes.length + 1}`,
        type: 'element',
        imageUrl: imageUrl,
      };
      setShapes([...shapes, newElement]);
    };
  };

  const handleAddElementXY = ({imageUrl, x,y,height,width,rotation}) => {
    const img = new window.Image();
    if(imageUrl.includes('svg')){
      img.style.backgroundImage = `url(${"http://localhost:5000/api/images/"+imageUrl}), none`
      const newElement = {
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: rotation,
        image: img,
        id: `${imageUrl}${shapes.length + 1}`,
        type: 'element',
        imageUrl: imageUrl,
      };
      shapes.push(newElement)
      return;
    }
    img.src = "http://localhost:5000/api/images/"+imageUrl;
    img.onload = () => {
      const newElement = {
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: rotation,
        image: img,
        id: `${imageUrl}${shapes.length + 1}`,
        type: 'element',
        imageUrl: imageUrl,
      };
      shapes.push(newElement)
      // setShapes([...shapes, newElement]);
    };
  };

  const handleShapeChange = (newAttrs) => {
    const updatedShapes = shapes.map((shape) => {
      if (shape.id === newAttrs.id) {
        return { ...shape, ...newAttrs };
      }
      return shape;
    });
    setShapes(updatedShapes);
  };

  const handleDeleteShape = (id) => {
    setShapes(shapes.filter(shape => shape.id !== id));
    if (selectedId === id) {
      selectShape(null);
    }
  };

  const generateJSON = () => {
    const template = {
      id: 1,
      name: "Custom Template",
      panels: Math.ceil(canvasWidth / CANVAS_WIDTH),
      frames: shapes.map((shape) => 
        {
        return(
        {
        x: shape.x ,
        y: shape.y,
        width: Math.ceil(shape.width),
        height: Math.ceil(shape.height),
        rotation: shape.rotation,
        type: shape.type,
        ...(shape.type === 'element' && { imageUrl: shape.imageUrl }),
      })}),
    };
    return JSON.stringify([template], null, 2);
  };

  const handleZoom = (e) => {
    if (!isZoomEnabled) return;
    
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();

    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setScale(newScale);
    setPosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  const handleDragEnd = (e) => {
    if (!isZoomEnabled) return;
    setPosition(e.target.position());
  };

  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    loadImageFromFile(file);
  };

  const loadImageFromFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const loadImageFromUrl = () => {
    loadImage(imageUrl);
  };

  const loadImage = (src) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const newHeight = canvasWidth / aspectRatio;

      setBackgroundImage({
        image: img,
        width: canvasWidth,
        height: newHeight,
        x: 0,
        y: 0
      });
    };
    img.onerror = () => {
      console.error('Error loading image');
      // You might want to show an error message to the user here
    };
  };

  const toggleZoom = () => {
    setIsZoomEnabled(!isZoomEnabled);
    if (!isZoomEnabled) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const snapToGrid = (pos) => {
    const snapX = Math.round(pos.x / gridSize) * gridSize;
    const snapY = Math.round(pos.y / gridSize) * gridSize;

    return {
      x: Math.abs(pos.x - snapX) < SNAP_THRESHOLD ? snapX : pos.x,
      y: Math.abs(pos.y - snapY) < SNAP_THRESHOLD ? snapY : pos.y,
    };
  };

  const handleDragMove = (e, snappedPos) => {
    // console.log("Dragging to:", snappedPos);
  };

  const handleImageDragStart = () => {
    setIsDraggingImage(true);
  };

  const handleImageDragEnd = (e) => {
    setIsDraggingImage(false);
    setBackgroundImage({
      ...backgroundImage,
      x: e.target.x(),
      y: e.target.y()
    });
  };

  const handlePasteImages = (event) => {
    // Check if the paste event target is an input or textarea
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return; // Allow default paste behavior for input fields
    }

    event.preventDefault();
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    const imageItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        imageItems.push(item.getAsFile());
      } else if (item.type === "text/html") {
        item.getAsString((htmlString) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlString, 'text/html');
          const images = doc.getElementsByTagName('img');
          for (let j = 0; j < images.length; j++) {
            const imgSrc = images[j].src;
            imageItems.push(imgSrc);
          }
          processImageItems(imageItems);
        });
        return; // Exit early as we're handling HTML asynchronously
      }
    }

    processImageItems(imageItems);
  };

  const processImageItems = (items) => {
    const newPastedImages = [];

    items.forEach((item) => {
      if (typeof item === 'string') {
        // It's already a URL
        newPastedImages.push(item);
      } else {
        // It's a File object
        const reader = new FileReader();
        reader.onload = (e) => {
          newPastedImages.push(e.target.result);
          if (newPastedImages.length === items.length) {
            setPastedImages(prevImages => [...prevImages, ...newPastedImages]);
          }
        };
        reader.readAsDataURL(item);
      }
    });

    // If all items were strings (URLs), update state immediately
    if (newPastedImages.length === items.length) {
      setPastedImages(prevImages => [...prevImages, ...newPastedImages]);
    }
  };

  const addPastedImage = (imageUrl) => {
    handleAddElement(imageUrl);
    setPastedImages(prevImages => prevImages.filter(img => img !== imageUrl));
  };

  const addAllPastedImages = () => {
    pastedImages.forEach(imageUrl => handleAddElement(imageUrl));
    setPastedImages([]);
  };

  useEffect(() => {
    const pasteHandler = (e) => {
      // Only handle paste events on the document body
      if (e.target === document.body) {
        handlePasteImages(e);
      }
    };

    document.body.addEventListener('paste', pasteHandler);
    return () => {
      document.body.removeEventListener('paste', pasteHandler);
    };
  }, []);

  const toggleLayerPanel = () => {
    setShowLayerPanel(!showLayerPanel);
  };

  const moveLayer = (index, direction) => {
    const newLayers = [...layers];
    const [removed] = newLayers.splice(index, 1);
    newLayers.splice(index + direction, 0, removed);
    setLayers(newLayers);
    updateCanvasOrder(newLayers);
  };

  const toggleLayerVisibility = (index) => {
    const newLayers = [...layers];
    newLayers[index].visible = !newLayers[index].visible;
    setLayers(newLayers);
    updateCanvasVisibility(newLayers);
  };

  const updateCanvasOrder = (newLayers) => {
    const updatedShapes = newLayers.filter(layer => layer.type === 'frame' || layer.type === 'element').map(layer => layer.data);
    setShapes(updatedShapes);
  };

  const updateCanvasVisibility = (newLayers) => {
    setShapes(prevShapes => prevShapes.map(shape => {
      const layer = newLayers.find(l => l.type === shape.type && l.data.id === shape.id);
      return { ...shape, visible: layer ? layer.visible : true };
    }));
  };

  useEffect(() => {
    const combinedLayers = shapes.map(shape => ({
      type: shape.type,
      data: shape,
      visible: shape.visible !== false
    }));
    setLayers(combinedLayers);
  }, [shapes]);

  const handleLayerReorder = (result) => {
    if (!result.destination) return;

    const newLayers = Array.from(layers);
    const [reorderedItem] = newLayers.splice(result.source.index, 1);
    newLayers.splice(result.destination.index, 0, reorderedItem);

    setLayers(newLayers);
    updateCanvasOrder(newLayers);
  };

  return (
    <div className="flex flex-row h-screen">
      {showLayerPanel && (
        <DragDropContext onDragEnd={handleLayerReorder}>
          <Droppable  type="group" droppableId="layers">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="w-64 bg-gray-800 text-white p-4 overflow-y-auto"
              >
                <h3 className="text-xl font-bold mb-4">Layers</h3>
                {layers.map((layer, index) => (
                  <Draggable key={layer.data.id} draggableId={layer.data.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        id={`layer-${layer.data.id}`}
                        className={`flex items-center justify-between mb-2 p-2 ${
                          layer.data.id === selectedId ? 'bg-blue-500' : ''
                        }`}
                        onClick={() => handleSelectShape(layer.data.id)}
                      >
                        <div className="flex items-center">
                          <button onClick={() => toggleLayerVisibility(index)}>
                            {layer.visible ? <FaEye /> : <FaEyeSlash />}
                          </button>
                          <span className="ml-2">{layer.type} {layer.data.id}</span>
                        </div>
                        <FaExchangeAlt className="cursor-move" />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <button
        className="absolute top-4 left-4 z-10 bg-gray-800 text-white p-2 rounded"
        onClick={toggleLayerPanel}
      >
        <FaBars />
      </button>
      <div className="flex-grow overflow-hidden bg-slate-800 relative">
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          ref={stageRef}
          draggable={!isDraggingImage}
          onWheel={handleZoom}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          onDragEnd={handleDragEnd}
        >
          <Layer>
            <Rect width={canvasWidth} height={CANVAS_HEIGHT} fill="gray" />
           
            {backgroundImage && (
              <KonvaImage
                image={backgroundImage.image}
                width={backgroundImage.width}
                height={backgroundImage.height}
                x={backgroundImage.x}
                y={backgroundImage.y}
                draggable
                onDragStart={handleImageDragStart}
                onDragEnd={handleImageDragEnd}
                opacity={0.3}
              />
            )}
            {layers.map(layer => {
              if (!layer.visible) return null;
              if (layer.data.type === 'frame') {
                return (
                  <FrameComponent
                    key={layer.data.id}
                    shapeProps={layer.data}
                    isSelected={layer.data.id === selectedId}
                    onSelect={() => handleSelectShape(layer.data.id)}
                    onChange={handleShapeChange}
                    onDragMove={handleDragMove}
                    snapToGrid={snapToGrid}
                    gridSize={gridSize}
                    onDelete={handleDeleteShape}
                  />
                );
              } else if (layer.data.type === 'element') {
                return (
                  <ElementComponent
                    key={layer.data.id}
                    elementProps={layer.data}
                    isSelected={layer.data.id === selectedId}
                    onSelect={() => handleSelectShape(layer.data.id)}
                    onChange={handleShapeChange}
                    onDragMove={handleDragMove}
                    snapToGrid={snapToGrid}
                    gridSize={gridSize}
                    onDelete={handleDeleteShape}
                  />
                );
              }
              return null;
            })}
             <Grid 
              width={canvasWidth} 
              height={CANVAS_HEIGHT} 
              mainGridColor={mainGridColor} 
              thirdsGridColor={thirdsGridColor}
              gridSize={gridSize}
            />
          </Layer>
        </Stage>
      </div>
      <div className="p-4 bg-gray-200 overflow-y-auto" style={{ width: '300px' }}>
        <div className="flex justify-between flex-col mb-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleExtendCanvas}>
            Extend Canvas
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleAddFrame}>
            Add Frame
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageUpload}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="zoomToggle"
              checked={isZoomEnabled}
              onChange={toggleZoom}
              className="mr-2"
            />
            <label htmlFor="zoomToggle">Enable Zoom & Pan</label>
          </div>
          <div className="flex items-center">
            <input
              id="elementArray"
              type='text'
              defaultValue={JSON.stringify(shapes)}
            onChange={(e) => {try{JSON.parse(e.target.value).forEach(handleAddElementXY)}catch{setShapes([])}}}
              className="mr-2"
            />
            <label htmlFor="elementArray">ELEMENTS {JSON.stringify(shapes)}</label>
          </div>
        </div>
        <div className="mb-4">
          <span>Zoom: {Math.round(scale * 100)}%</span>
          {isZoomEnabled && (
            <span className="ml-4">
              Position: ({Math.round(position.x)}, {Math.round(position.y)})
            </span>
          )}
        </div>
        <div>
          {"x:"+position.x + "-y:"+ position.y}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Grid Size</label>
          <input
            type="number"
            value={gridSize}
            onChange={(e) => setGridSize(Math.max(10, parseInt(e.target.value)))}
            className="mt-1 block w-full"
            min="10"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Main Grid Color</label>
          <input
            type="color"
            value={mainGridColor}
            onChange={(e) => setMainGridColor(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Thirds Grid Color</label>
          <input
            type="color"
            value={thirdsGridColor}
            onChange={(e) => setThirdsGridColor(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageUpload}
            className="mt-1 block w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 block w-full border rounded-md shadow-sm"
            placeholder="Enter image URL"
          />
          <button
            onClick={loadImageFromUrl}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Load Image from URL
          </button>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Add Elements</h3>
          <div className="grid grid-cols-2 gap-2">
            {elementImages.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.name}
                className="w-full h-auto cursor-pointer border border-gray-300 hover:border-blue-500"
                onClick={() => handleAddElement(image.url)}
              />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Pasted Images</h3>
          <p className="text-sm text-gray-600 mb-2">
            Copy images or HTML elements with images from any website and paste them here (Ctrl+V or Cmd+V)
          </p>
          {pastedImages.length > 0 && (
            <div className="mb-2">
              {pastedImages.map((imageUrl, index) => (
                <div key={index} className="mb-2">
                  <img src={imageUrl} alt={`Pasted ${index}`} className="w-full h-auto" />
                  <button
                    onClick={() => addPastedImage(imageUrl)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full"
                  >
                    Add This Image
                  </button>
                </div>
              ))}
              <button
                onClick={addAllPastedImages}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded w-full"
              >
                Add All Images
              </button>
            </div>
          )}
          {pastedImages.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 p-4 text-center">
              <Text text="Paste your images here" />
            </div>
          )}
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



