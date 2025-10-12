import React from 'react';
import TimeEntryTable from './TimeEntryTable';

export default function TimeTable({ entries, users, tasks, onExportCsv }) {
  return (
    <div className="keos-card">
      <div className="mb-2 text-slate-700 font-semibold">Alle Zeiterfassungen</div>
      <TimeEntryTable entries={entries} users={users} tasks={tasks} onExportCsv={onExportCsv} />
    </div>
  );
}


