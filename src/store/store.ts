import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../hooks/useAuth';
import assetsReducer from '../hooks/useAssets';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
