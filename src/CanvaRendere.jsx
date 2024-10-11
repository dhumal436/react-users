import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const FrameVisualization = ({ frames }) => {
  console.log(frames)
  const data = frames.map((frame, index) => ({
    name: `Frame ${index + 1}`,
    x: frame.x,
    y: frame.y,
    width: frame.width,
    height: frame.height,
    rotation: frame.rotation,
  }));

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Frame and Element Visualization</h2>
      <LineChart width={600} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="x" stroke="#8884d8" />
        <Line yAxisId="left" type="monotone" dataKey="y" stroke="#82ca9d" />
        <Line yAxisId="right" type="monotone" dataKey="width" stroke="#ffc658" />
        <Line yAxisId="right" type="monotone" dataKey="height" stroke="#ff7300" />
        <Line yAxisId="right" type="monotone" dataKey="rotation" stroke="#00C49F" />
      </LineChart>
    </div>
  );
};

export default FrameVisualization;