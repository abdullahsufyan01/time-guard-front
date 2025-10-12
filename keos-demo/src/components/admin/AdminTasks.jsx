import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, createRecurringTasks, updateTaskStatus, selectTasks } from '../../store/tasksSlice';
import { fetchBuildings, selectBuildings } from '../../store/buildingsSlice';
import { fetchUsers, selectUsers } from '../../store/usersSlice';
import RecurringTaskForm from './RecurringTaskForm';
import TaskList from './TaskList';
import TaskFilters from './TaskFilters';

export default function AdminTasks() {
  const dispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const buildings = useSelector(selectBuildings);
  const users = useSelector(selectUsers);
  const [filters, setFilters] = useState({ buildingId: '', frequency: '', status: '', search: '' });

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchBuildings());
    dispatch(fetchUsers());
  }, [dispatch]);

  const serviceUsers = useMemo(() => users.filter(u => u.role === 'service'), [users]);

  return (
    <div className="space-y-6">
      <TaskFilters buildings={buildings} value={filters} onChange={setFilters} />
      <RecurringTaskForm
        buildings={buildings}
        employees={serviceUsers}
        onSubmit={(payload) => dispatch(createRecurringTasks(payload))}
      />

      <TaskList
        tasks={tasks}
        buildings={buildings}
        onChangeStatus={(id, status) => dispatch(updateTaskStatus({ id, status }))}
        filters={filters}
      />
    </div>
  );
}


