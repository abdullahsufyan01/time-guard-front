import React, { useMemo } from 'react';

export default function TimeSummary({ entries, users, tasks }) {
  const totals = useMemo(() => {
    const byEmployee = new Map();
    const byTask = new Map();
    for (const e of entries) {
      const minutes = e.duration || 0;
      const emp = e.mitarbeiter || e.userId || e.zugewiesen || 'unknown';
      const t = e.taskId || e.task || 'unknown';
      byEmployee.set(emp, (byEmployee.get(emp) || 0) + minutes);
      byTask.set(t, (byTask.get(t) || 0) + minutes);
    }
    return { byEmployee, byTask };
  }, [entries]);

  const totalMinutes = Array.from(totals.byEmployee.values()).reduce((a, b) => a + b, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const completedTasks = tasks.filter(t => t.status === 'erledigt').length;
  const activeEmployees = totals.byEmployee.size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="keos-card"><div className="text-slate-500">Gesamtarbeitszeit</div><div className="text-xl font-semibold">{hours} h {minutes} m</div></div>
      <div className="keos-card"><div className="text-slate-500">Completed tasks</div><div className="text-xl font-semibold">{completedTasks}</div></div>
      <div className="keos-card"><div className="text-slate-500">Aktive Mitarbeiter</div><div className="text-xl font-semibold">{activeEmployees}</div></div>
    </div>
  );
}


