import { apiSlice } from "@/services/apiSlice";
import { configureStore } from "@reduxjs/toolkit";
import metaReducer from "./features/metaSlice";
import authReducer from "./features/authSlice";
// import AsyncStorage from '@react-native-async-storage/async-storage'
// import { persistReducer, persistStore } from 'redux-persist'
// import storage from 'redux-persist/lib/storage';
import { setupListeners } from "@reduxjs/toolkit/query";
import offlineReducer from "./features/offlineSlice";
import recodeReducer from "./features/recodeSlice";
import { organizationApiSlice } from "./services/organizationApiSlice";



// const persistConfig = {
//   key: 'root',
//   storage: AsyncStorage,
// }

// const persistedReducer = persistReducer(persistConfig, apiSlice.reducer)


export const store = configureStore({
  reducer: {
    meta: metaReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [organizationApiSlice.reducerPath]: organizationApiSlice.reducer,
    auth: authReducer,
    offline: offlineReducer,
    recode: recodeReducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // serializableCheck: {
      //   ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      // },
    }).concat(apiSlice.middleware).concat(organizationApiSlice.middleware),
  devTools: true,
});


setupListeners(store.dispatch)


// export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

