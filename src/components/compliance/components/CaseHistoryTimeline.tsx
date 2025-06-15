
import React from 'react';

interface HistoryItem {
  date: string;
  action: string;
  by: string;
}

interface CaseHistoryTimelineProps {
  history: HistoryItem[];
}

const CaseHistoryTimeline: React.FC<CaseHistoryTimelineProps> = ({ history }) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Case History</h3>
      <div className="space-y-3">
        {history.map((item, index) => (
          <div key={index} className="flex">
            <div className="mr-4 flex items-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
              <div className="h-full w-0.5 bg-gray-200 ml-1"></div>
            </div>
            <div className="pb-4">
              <div className="text-sm">{item.action}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(item.date).toLocaleString()} by {item.by}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseHistoryTimeline;
