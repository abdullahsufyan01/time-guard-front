import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimeEntries, subscribeTimeEntries, selectTimeEntries } from '../../store/timeEntriesSlice';
import { fetchUsers, selectUsers } from '../../store/usersSlice';
import { fetchTasks, selectTasks, subscribeTasksSync } from '../../store/tasksSlice';
import { fetchBuildings, selectBuildings } from '../../store/buildingsSlice';
import Filters from './Filters';
import TimeSummary from './TimeSummary';
import TimeEntryTable from './TimeEntryTable';
import TimeTable from './TimeTable';

export default function Timesheet() {
  const dispatch = useDispatch();
  const timeEntries = useSelector(selectTimeEntries);
  const users = useSelector(selectUsers);
  const tasks = useSelector(selectTasks);
  const buildings = useSelector(selectBuildings);

  const defaultStart = new Date(Date.now() - 29*24*60*60*1000).toISOString().slice(0,10);
  const defaultEnd = new Date().toISOString().slice(0,10);
  const [filters, setFilters] = useState({ employeeId: '', buildingId: '', startDate: defaultStart, endDate: defaultEnd, search: '' });

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchTasks());
    dispatch(fetchBuildings());
    dispatch(fetchTimeEntries());
    dispatch(subscribeTimeEntries());
    dispatch(subscribeTasksSync());
  }, [dispatch]);

  const taskById = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);
  const filteredEntries = useMemo(() => {
    const start = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
    const end = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null;
    // De-duplicate by taskId + startTime + endTime to avoid duplicates
    const seen = new Set();
    return timeEntries.filter(e => {
      const key = `${e.taskId || ''}|${e.startTime || ''}|${e.endTime || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      if (filters.employeeId) {
        const emp = e.mitarbeiter || e.userId || e.zugewiesen || '';
        if (emp !== filters.employeeId) return false;
      }
      if (filters.buildingId) {
        const t = taskById.get(e.taskId);
        const b = t?.gebaeudeId || t?.gebaeude;
        if (b !== filters.buildingId) return false;
      }
      if (start || end) {
        // Prefer endTime for filtering if present, fallback to startTime; allow rows with one bound missing
        const dtStr = e.endTime || e.startTime;
        if (!dtStr) return false;
        const dt = new Date(dtStr);
        if (start && dt < start) return false;
        if (end && dt > end) return false;
      }
      if (filters.search) {
        const t = taskById.get(e.taskId);
        const searchHay = `${t?.titel || ''} ${t?.gebaeude || ''}`.toLowerCase();
        if (!searchHay.includes(filters.search.toLowerCase())) return false;
      }
      return true;
    });
  }, [timeEntries, filters, taskById]);

  const handleExportCsv = () => {
    const headers = ['employee','task','building','start time','end time','duration','comment'];
    const rows = filteredEntries.map(e => {
      const t = taskById.get(e.taskId) || {};
      const emp = e.mitarbeiter || e.userId || e.zugewiesen || '';
      const building = t.gebaeude || t.gebaeudeId || '';
      const start = e.startTime ? new Date(e.startTime).toISOString() : '';
      const end = e.endTime ? new Date(e.endTime).toISOString() : '';
      const dur = e.duration || '';
      const comment = e.comment || t.doneComment || '';
      return [emp, t.titel || e.taskId, building, start, end, dur, comment];
    });
    const csv = [headers.join(','), ...rows.map(r => r.map(v => typeof v === 'string' && v.includes(',') ? '"'+v.replaceAll('"','""')+'"' : v).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timeentries.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="keos-card">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900">Admin Zeiterfassung</h3>
        {/* <div className="text-slate-600">Service staff</div> */}
        </div>
      <div className="mb-4">
        <Filters employees={users} buildings={buildings} value={filters} onChange={setFilters} />
      </div>

      <div className="mb-4">
        <TimeSummary entries={filteredEntries} users={users} tasks={tasks} />
      </div>

      <div className="mb-2 text-slate-700 font-semibold">Employee overview</div>
      <TimeTable entries={filteredEntries} users={users} tasks={tasks} onExportCsv={handleExportCsv} />
    </div>
  );
}


