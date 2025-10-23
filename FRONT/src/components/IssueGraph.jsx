import React from 'react';
import { Card } from 'primereact/card';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * IssueGraph Component
 * Displays interactive charts for frame-level analysis data
 * 
 * @param {string} issueType - Type of issue: "posture" or "overstride"
 * @param {Array} data - Array of frame data from backend
 * @param {string} title - Chart title
 * @param {number} fps - Frames per second for time conversion
 */
const IssueGraph = ({ issueType, data, title, fps = 30 }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Render line chart for posture (showing angles over frames)
  if (issueType === 'posture') {
    // Aggregate angles by second (average angle per second)
    const aggregatedData = {};
    
    data.forEach(item => {
      const second = Math.floor(item.frame_number / fps);
      
      if (!aggregatedData[second]) {
        aggregatedData[second] = {
          second: second,
          angles: [],
          count: 0
        };
      }
      
      aggregatedData[second].angles.push(item.angle);
      aggregatedData[second].count += 1;
    });
    
    // Calculate average angle for each second
    const chartData = Object.values(aggregatedData).map(item => ({
      second: item.second,
      angle: item.angles.reduce((sum, angle) => sum + angle, 0) / item.count
    })).sort((a, b) => a.second - b.second);
    return (
      <Card className="mt-3 p-3">
        <div className="text-center mb-3">
          <h4 className="text-sm font-semibold text-black m-0">
            {title || 'Ângulo Médio da Postura por Segundo'}
          </h4>
        </div>
        <div
        style={{
          width: '100%',
          overflowX: 'auto', 
          overflowY: 'hidden',
        }}
        >
        <div
          style={{
            width: '200%',   
            minWidth: '800px', 
          }}
        >
        <ResponsiveContainer width="200%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="second" 
              label={{ value: 'Tempo (segundos)', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Ângulo Médio (°)', angle: -90, position: 'insideLeft' }}
              domain={[0, 180]}
            />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)}°`, 'Ângulo Médio']}
              labelFormatter={(label) => `Segundo: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="angle" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Ângulo Médio da Postura"
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            {/* Reference line for threshold */}
            <Line 
              type="monotone" 
              dataKey={() => 110} 
              stroke="#ff0000" 
              strokeDasharray="5 5"
              strokeWidth={1}
              name="Limite (110°)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
        </div>
        <div className="text-center mt-2">
          <small className="text-black-alpha-70">
            Média de ângulos por segundo. Valores abaixo de 110° indicam postura incorreta
          </small>
        </div>
      </Card>
    );
  }

  // Render scatter chart for overstride (showing overstride detection over frames)
  if (issueType === 'overstride') {
    // Backend now only sends ground contact frames (analyzed frames)
    // Use data exactly as received - no filtering or averaging
    const scatterData = data.map(item => ({
        frame_number: item.frame_number,
        overstride: item.overstride ? 1 : 0,
      label: item.overstride ? 'Overstride Detectado' : 'Normal'
    }));

    // Count overstride detections
    const overstrideCount = scatterData.filter(item => item.overstride === 1).length;

    return (
      <Card className="mt-3 p-3">
        <div className="text-center mb-3">
          <h4 className="text-sm font-semibold text-black m-0">
            {title || 'Momentos de Contato com Solo (Overstride)'}
          </h4>
        </div>
        {scatterData.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-black-alpha-70">
              Nenhum momento de contato com solo analisado
            </p>
          </div>
        ) : overstrideCount === 0 ? (
          <div className="text-center p-4">
            <p className="text-black-alpha-70">
              ✓ Nenhum overstride detectado (boa técnica!)
            </p>
            <p className="text-xs text-black-alpha-60 mt-2">
              {scatterData.length} momentos de contato analisados
            </p>
          </div>
        ) : (
          <>
            <div
            style={{
              width: '100%',
              overflowX: 'auto', 
              overflowY: 'hidden',
            }}
            >
            <div
              style={{
                width: '200%',   
                minWidth: '800px', 
              }}
            >
            <ResponsiveContainer width="200%" height={300}>
              <ScatterChart
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="frame_number" 
                  name="Tempo"
                  label={{ value: 'Frame', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  
                  dataKey="overstride"
                  name="Status"
                  domain={[-0.2, 1.2]}
                  ticks={[0, 1]}
                  tickFormatter={(value) => value === 1 ? 'Overstride' : 'Normal'}                 
                  label={{ value: 'Detecção', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => {
                    if (name === 'overstride') {
                      return ['Detectado', 'Overstride'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Tempo: ${label}s`}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                          <p style={{ margin: 0 }}><strong>Tempo:</strong> {data.second}s</p>
                          <p style={{ margin: 0 }}><strong>Frame:</strong> {data.frame_number}</p>
                          <p style={{ margin: 0 }}><strong>Status:</strong> Overstride Detectado</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  payload={
                    overstrideCount > 0 && overstrideCount < scatterData.length
                      ? [
                          { value: 'Overstride Detectado', type: 'circle', color: '#ff4444' },
                          { value: 'Contato Normal', type: 'circle', color: '#00C49F' }
                        ]
                      : [
                          { value: 'Overstride Detectado (Contato com Solo)', type: 'circle', color: '#ff4444' }
                        ]
                  }
                />
                <Scatter name="Overstride" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.overstride === 1 ? '#ff4444' : '#00C49F'} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            </div>
            </div>
            <div className="text-center mt-2">
              <small className="text-black-alpha-70">
                Cada ponto representa um momento de contato com o solo analisado. 
                Vermelho = overstride detectado ({overstrideCount}/{scatterData.length} contatos)
              </small>
            </div>
          </>
        )}
      </Card>
    );
  }

  return null;
};

export default IssueGraph;

