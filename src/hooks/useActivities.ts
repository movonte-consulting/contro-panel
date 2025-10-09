import { useState, useCallback } from 'react';

export interface Activity {
  id: string;
  text: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
}

interface UseActivitiesReturn {
  activities: Activity[];
  addActivity: (text: string, type: Activity['type']) => void;
  clearActivities: () => void;
}

export const useActivities = (): UseActivitiesReturn => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const addActivity = useCallback((text: string, type: Activity['type']) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date()
    };

    setActivities(prev => {
      const updated = [newActivity, ...prev];
      // Keep only last 6 activities
      return updated.slice(0, 6);
    });
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  return {
    activities,
    addActivity,
    clearActivities
  };
};

