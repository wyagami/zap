import React from 'react';
import { AnalysisResult } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { Trophy, Medal } from 'lucide-react';

interface AnalysisChartProps {
  result: AnalysisResult;
}

const COLORS = ['#00a884', '#128c7e', '#25d366', '#34b7f1', '#ece5dd', '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg z-50">
        <p className="font-bold text-gray-800">{label || payload[0].name}</p>
        <p className="text-whatsapp-primary">
          {payload[0].value.toLocaleString()} {unit}
        </p>
      </div>
    );
  }
  return null;
};

// Wrapper para gráficos que precisam de altura fixa
const ChartWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full h-[500px] mt-6">
    <ResponsiveContainer width="100%" height="100%">
      {children as React.ReactElement}
    </ResponsiveContainer>
  </div>
);

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ result }) => {
  if (result.data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
        <p>Sem dados suficientes para esta análise.</p>
      </div>
    );
  }

  switch (result.type) {
    case 'bar':
      return (
        <ChartWrapper>
          <BarChart
            data={result.data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={140} 
              tick={{ fontSize: 12, fill: '#4b5563' }} 
              interval={0}
            />
            <Tooltip content={<CustomTooltip unit={result.unit} />} cursor={{ fill: '#f3f4f6' }} />
            <Bar dataKey="value" fill="#00a884" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ChartWrapper>
      );

    case 'line':
      return (
        <ChartWrapper>
          <LineChart
            data={result.data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              tickMargin={10}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip unit={result.unit} />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#00a884" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#128c7e' }} 
            />
          </LineChart>
        </ChartWrapper>
      );

    case 'pie':
      return (
        <ChartWrapper>
          <PieChart>
            <Pie
              data={result.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={140}
              paddingAngle={2}
              dataKey="value"
            >
              {result.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ChartWrapper>
      );

    case 'metric':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
          {result.data.map((item, idx) => (
            <div key={idx} className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:-translate-y-1 group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-whatsapp-primary to-whatsapp-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">{item.name}</h3>
              <span className="text-4xl lg:text-5xl font-extrabold text-whatsapp-secondary mb-1">
                {item.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
              {result.unit && <span className="text-sm font-medium text-whatsapp-primary bg-whatsapp-chat px-2 py-0.5 rounded-full mt-2">{result.unit}</span>}
            </div>
          ))}
        </div>
      );

    default: // list
      const maxValue = Math.max(...result.data.map(d => d.value));
      return (
        <div className="flex flex-col space-y-3 py-4">
           {result.data.map((item, idx) => {
             const percent = (item.value / maxValue) * 100;
             let RankIcon = null;
             if (idx === 0) RankIcon = <Trophy className="w-5 h-5 text-yellow-500" />;
             else if (idx === 1) RankIcon = <Medal className="w-5 h-5 text-gray-400" />;
             else if (idx === 2) RankIcon = <Medal className="w-5 h-5 text-orange-400" />;

             return (
               <div key={idx} className="group relative flex items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-whatsapp-primary/30 hover:shadow-md transition-all">
                  {/* Background Progress Bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-whatsapp-chat/30 rounded-l-xl transition-all duration-500 ease-out" 
                    style={{ width: `${Math.max(percent, 0.5)}%` }}
                  />
                  
                  {/* Rank / Index */}
                  <div className="relative z-10 flex items-center justify-center w-10 shrink-0">
                    {RankIcon ? RankIcon : <span className="text-sm font-semibold text-gray-400">#{idx + 1}</span>}
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1 ml-4 min-w-0">
                      <div className="flex items-baseline justify-between">
                          <span className="font-bold text-gray-800 text-lg truncate mr-4">{item.name}</span>
                          <span className="font-bold text-whatsapp-primary shrink-0">
                              {item.value.toLocaleString()} 
                              <span className="text-xs font-normal text-gray-500 ml-1">{result.unit}</span>
                          </span>
                      </div>
                      
                      {/* Link detection */}
                      {item.name.startsWith('http') && (
                        <a href={item.name} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline block mt-1">
                          Abrir link externo
                        </a>
                      )}
                  </div>
               </div>
             );
           })}
        </div>
      );
  }
};