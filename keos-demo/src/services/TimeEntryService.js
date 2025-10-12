import { db } from '../firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where, setDoc } from 'firebase/firestore';

function toMillis(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Date.parse(value) || 0;
  if (value?.toMillis) return value.toMillis();
  try { return Date.parse(String(value)); } catch { return 0; }
}

export function computeDurationMinutes(startTime, endTime) {
  const startMs = toMillis(startTime);
  const endMs = toMillis(endTime);
  if (!startMs || !endMs || endMs < startMs) return 0;
  return Math.round((endMs - startMs) / 60000);
}

export async function upsertTimeEntryFromTask(task) {
  const taskId = task.id || task.taskId;
  if (!taskId) return;
  const mitarbeiter = task.serviceUser || task.zugewiesen || task.userId || task.mitarbeiter || '';
  const startTime = task.startTime || task.gestartet || task.startDatum || task.erstellt || task.erstelltAm || null;
  const endTime = task.endTime || task.doneTime || task.beendet || task.erledigtZeitstempel || null;
  // Create entry even if one timestamp missing; compute duration when possible, else 0
  const duration = (startTime && endTime) ? computeDurationMinutes(startTime, endTime) : 0;

  const timeentriesRef = collection(db, 'timeentries');
  // Use deterministic document id = taskId to prevent duplicates
  const payload = {
    mitarbeiter,
    taskId,
    startTime,
    endTime,
    duration,
    erstellt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'timeentries', taskId), payload, { merge: true });

  // Cleanup any legacy duplicates with same taskId but different doc ids
  const q = query(timeentriesRef, where('taskId', '==', taskId));
  const snap = await getDocs(q);
  const deletions = [];
  snap.forEach((d) => {
    if (d.id !== taskId) deletions.push(deleteDoc(doc(db, 'timeentries', d.id)));
  });
  if (deletions.length) await Promise.allSettled(deletions);
}

export async function deleteTimeEntryByTaskId(taskId) {
  if (!taskId) return;
  const timeentriesRef = collection(db, 'timeentries');
  const q = query(timeentriesRef, where('taskId', '==', taskId));
  const snap = await getDocs(q);
  const deletions = [];
  snap.forEach((d) => deletions.push(deleteDoc(doc(db, 'timeentries', d.id))));
  if (deletions.length) await Promise.allSettled(deletions);
}


