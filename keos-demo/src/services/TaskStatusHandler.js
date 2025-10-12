import { upsertTimeEntryFromTask, deleteTimeEntryByTaskId } from './TimeEntryService';

export async function syncTaskToTimeEntries(task) {
  if (!task || !task.id) return;
  if (task.status === 'erledigt') {
    await upsertTimeEntryFromTask(task);
  } else {
    await deleteTimeEntryByTaskId(task.id);
  }
}


