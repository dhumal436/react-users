import React from 'react';

const CanvasRenderer = ({ jsonData }) => {
  if (!jsonData || !jsonData.elements) {
    return <div>No canvas data available</div>;
  }

  return (
    <div className="relative w-full h-full bg-white">
      {jsonData.elements.map((element, index) => {
        const commonStyles = {
          position: 'absolute',
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          backgroundColor: element.backgroundColor,
          color: element.color,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          zIndex: element.zIndex,
          opacity: element.opacity,
          transform: element.transform,
          border: element.border,
          borderRadius: element.borderRadius,
        };

        switch (element.type) {
          case 'img':
            return (
              <img
                key={index}
                src={element.src}
                alt="Canvas element"
                style={commonStyles}
                className="object-cover"
              />
            );
          case 'text':
            return (
              <div
                key={index}
                style={commonStyles}
                className="overflow-hidden"
              >
                {element.text}
              </div>
            );
          case 'svg':
          case 'path':
            // Handle SVG elements if needed
            return (
              <div
                key={index}
                style={commonStyles}
                className="svg-container"
              />
            );
          default:
            return (
              <div
                key={index}
                style={commonStyles}
                className="overflow-hidden"
              >
                {element.text}
              </div>
            );
        }
      })}
    </div>
  );
};

export default CanvasRenderer;