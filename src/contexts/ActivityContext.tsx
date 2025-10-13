import React, { createContext, useContext, ReactNode } from 'react';
import { useActivities } from '../hooks/useActivities';
import type { Activity } from '../hooks/useActivities';

interface ActivityContextType {
  activities: Activity[];
  addActivity: (text: string, type: Activity['type']) => void;
  clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

interface ActivityProviderProps {
  children: ReactNode;
}

export const ActivityProvider: React.FC<ActivityProviderProps> = ({ children }) => {
  const activitiesHook = useActivities();

  return (
    <ActivityContext.Provider value={activitiesHook}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityContext = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivityContext must be used within an ActivityProvider');
  }
  return context;
};
