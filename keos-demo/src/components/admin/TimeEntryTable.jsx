import React, { useMemo, useState, useEffect } from 'react';

export default function TimeEntryTable({ entries, users, tasks, onExportCsv }) {
  const userName = (id) => users.find(u => u.id === id)?.name || id;
  const taskById = new Map(tasks.map(t => [t.id, t]));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((entries?.length || 0) / pageSize)), [entries, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const pageStartIdx = (page - 1) * pageSize;
  const pageEndIdx = pageStartIdx + pageSize;
  const pagedEntries = useMemo(() => entries.slice(pageStartIdx, pageEndIdx), [entries, pageStartIdx, pageEndIdx]);
  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-2">
        <button className="keos-btn" onClick={onExportCsv}>CSV Export</button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-medium text-slate-700">Mitarbeiter</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Aufgabe</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Gebäude</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Beginn</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Ende</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Arbeitszeit</th>
            <th className="text-left py-3 px-4 font-medium text-slate-700">Kommentar</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">No time entries found.</td>
            </tr>
          )}
          {pagedEntries.map(e => {
            const t = taskById.get(e.taskId) || {};
            const building = t.gebaeude || t.gebaeudeId || '';
            const start = e.startTime ? new Date(e.startTime) : null;
            const end = e.endTime ? new Date(e.endTime) : null;
            const durMin = e.duration || (start && end ? Math.round((end - start) / 60000) : 0);
            const durStr = `${Math.floor(durMin/60)} h ${durMin%60} m`;
            const comment = e.comment || t.doneComment || '';
            const emp = e.mitarbeiter || e.userId || e.zugewiesen || '';
            return (
              <tr key={e.id} className="border-b border-slate-100">
                <td className="py-3 px-4">{userName(emp)}</td>
                <td className="py-3 px-4">{t.titel || e.taskId}</td>
                <td className="py-3 px-4">{building}</td>
                <td className="py-3 px-4">{start ? start.toLocaleString() : ''}</td>
                <td className="py-3 px-4">{end ? end.toLocaleString() : ''}</td>
                <td className="py-3 px-4">{durStr}</td>
                <td className="py-3 px-4">{comment}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {entries.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Rows per page</span>
            <select className="keos-input w-24" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              {entries.length === 0 ? '0' : `${pageStartIdx + 1}-${Math.min(pageEndIdx, entries.length)}`} of {entries.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="keos-button keos-button-secondary" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
            <div className="text-sm text-slate-700">Page {page} of {totalPages}</div>
            <button className="keos-button keos-button-secondary" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}


