import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './tasksSlice';
import buildingsReducer from './buildingsSlice';
import usersReducer from './usersSlice';
import timeEntriesReducer from './timeEntriesSlice';

const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    buildings: buildingsReducer,
    users: usersReducer,
    timeEntries: timeEntriesReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export default store;


