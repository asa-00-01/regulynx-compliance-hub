
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PerformanceDataPoint {
  time: string;
  response_time: number;
  throughput: number;
  error_rate: number;
  cpu_usage: number;
  memory_usage: number;
}

interface PerformanceMetricsProps {
  data: PerformanceDataPoint[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  data,
  selectedMetric,
  onMetricChange,
  timeRange,
  onTimeRangeChange
}) => {
  const metricConfig = {
    response_time: {
      label: 'Response Time',
      color: '#8884d8',
      unit: 'ms'
    },
    throughput: {
      label: 'Throughput',
      color: '#82ca9d',
      unit: 'req/min'
    },
    error_rate: {
      label: 'Error Rate',
      color: '#ffc658',
      unit: '%'
    },
    cpu_usage: {
      label: 'CPU Usage',
      color: '#ff7300',
      unit: '%'
    },
    memory_usage: {
      label: 'Memory Usage',
      color: '#00ff00',
      unit: '%'
    }
  };

  const currentMetric = metricConfig[selectedMetric as keyof typeof metricConfig];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Metrics</CardTitle>
          <div className="flex gap-2">
            <Select value={selectedMetric} onValueChange={onMetricChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="response_time">Response Time</SelectItem>
                <SelectItem value="throughput">Throughput</SelectItem>
                <SelectItem value="error_rate">Error Rate</SelectItem>
                <SelectItem value="cpu_usage">CPU Usage</SelectItem>
                <SelectItem value="memory_usage">Memory Usage</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="6h">6 hours</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (timeRange === '1h' || timeRange === '6h') {
                    return value.split(' ')[1] || value; // Show time only
                  }
                  return value.split(' ')[0] || value; // Show date only
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}${currentMetric?.unit || ''}`}
              />
              <Tooltip 
                formatter={(value: number) => [
                  `${value.toFixed(2)}${currentMetric?.unit || ''}`,
                  currentMetric?.label || selectedMetric
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey={selectedMetric}
                stroke={currentMetric?.color || '#8884d8'}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
