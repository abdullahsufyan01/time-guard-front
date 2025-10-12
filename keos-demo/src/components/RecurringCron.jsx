import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { collection, doc, getDocs, query, updateDoc, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function shouldExecuteToday(recurringTask) {
  const { startDate, endDate, frequency, nextExecutionAt } = recurringTask || {};
  const now = dayjs();
  if (nextExecutionAt) {
    const next = dayjs(nextExecutionAt);
    if (next.isAfter(now.startOf('day'))) return false;
  }
  if (startDate && dayjs(startDate).isAfter(now, 'day')) return false;
  if (endDate && dayjs(endDate).isBefore(now, 'day')) return false;
  const anchor = dayjs(startDate || now.toISOString()).startOf('day');
  switch (frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return now.diff(anchor, 'day') % 7 === 0;
    case 'monthly':
      return now.date() === anchor.date();
    default:
      return false;
  }
}

function getNextExecutionAt(current, frequency) {
  const base = dayjs(current || dayjs().toISOString()).startOf('day');
  switch (frequency) {
    case 'daily':
      return base.add(1, 'day').toISOString();
    case 'weekly':
      return base.add(7, 'day').toISOString();
    case 'monthly':
      return base.add(1, 'month').toISOString();
    default:
      return null;
  }
}

export default function RecurringCron() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ created: 0, skipped: 0, processed: 0, errors: 0 });

  const log = useCallback((message) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()} ${message}`, ...prev]);
  }, []);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    setSummary({ created: 0, skipped: 0, processed: 0, errors: 0 });
    try {
      log('[Cron] Start recurring task assignment');
      const q = query(collection(db, 'tasks'), where('isRecurring', '==', true));
      const snapshot = await getDocs(q);
      const recurring = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      log(`[Cron] Found ${recurring.length} recurring tasks`);

      let created = 0, skipped = 0, processed = 0, errors = 0;
      for (const task of recurring) {
        try {
          processed += 1;
          if (!shouldExecuteToday(task)) {
            skipped += 1;
            continue;
          }
          const newTask = {
            ...task,
            isRecurring: false,
            status: 'offen',
            erstellt: new Date().toISOString(),
            lastExecutedAt: new Date().toISOString(),
          };
          delete newTask.id;
          delete newTask.nextExecutionAt;
          const createdRef = await addDoc(collection(db, 'tasks'), newTask);
          created += 1;
          log(`[Cron] Created ${createdRef.id} for "${task.titel}" (${task.frequency})`);
          const nextExecutionAt = getNextExecutionAt(task.nextExecutionAt || task.startDate, task.frequency);
          await updateDoc(doc(db, 'tasks', task.id), { lastExecutedAt: new Date().toISOString(), nextExecutionAt });
        } catch (e) {
          errors += 1;
          log(`[Cron] Error processing ${task?.id || 'unknown'}: ${e?.message || e}`);
        }
      }
      setSummary({ created, skipped, processed, errors });
      log('[Cron] Done');
    } catch (e) {
      setSummary((s) => ({ ...s, errors: s.errors + 1 }));
      log(`[Cron] Failed: ${e?.message || e}`);
    }
    setRunning(false);
  }, [running, log]);

  useEffect(() => {
    run();
  }, [run]);

  const badge = useMemo(() => {
    const { created, skipped, processed, errors } = summary;
    return `Processed: ${processed} | Created: ${created} | Skipped: ${skipped} | Errors: ${errors}`;
  }, [summary]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="keos-card mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recurring Tasks Runner</h2>
          <button disabled={running} onClick={run} className="keos-button keos-button-primary">
            {running ? 'Running…' : 'Run now'}
          </button>
        </div>
        <div className="mt-2 text-sm text-slate-600">{badge}</div>
      </div>
      <div className="keos-card">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Logs</h3>
        <div className="text-xs text-slate-700 space-y-1 max-h-[50vh] overflow-auto">
          {logs.length === 0 ? (
            <div className="text-slate-500">No logs yet.</div>
          ) : (
            logs.map((l, i) => (<div key={i}>{l}</div>))
          )}
        </div>
      </div>
    </div>
  );
}


