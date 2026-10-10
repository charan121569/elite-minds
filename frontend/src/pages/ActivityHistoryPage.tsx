import React, { useState, useEffect } from 'react';
import { History, Activity, Sparkles, Filter, Clock } from 'lucide-react';
import { api } from '../services/api';
import { ActivityItem } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

export const ActivityHistoryPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await api.getActivities(100);
      setActivities(data);
    } catch {
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = activities.filter((act) => {
    if (!filterType) return true;
    return act.entity_type === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Activity Audit History
            <History className="w-5 h-5 text-indigo-600" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable development activity log persisted in MySQL for compliance and auditability.
          </p>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer shadow-xs"
        >
          <option value="">All Entities</option>
          <option value="Project">Project</option>
          <option value="Requirement">Requirement</option>
          <option value="Task">Task</option>
          <option value="Guidance">Guidance</option>
          <option value="TestCase">TestCase</option>
          <option value="CodeReview">CodeReview</option>
        </select>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : filteredActivities.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8" />}
          title="No activity records found"
          description="Actions performed in your workspace (creating projects, analyzing specs, planning tasks) will be permanently logged here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredActivities.map((act) => (
                <div key={act.id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {act.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" size="sm">
                          {act.action_type}
                        </Badge>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{act.entity_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(act.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
