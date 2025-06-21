// utils/getEnvironment.ts
import { store } from "@/store";

export const getEnvironment = () => {
  return store.getState().meta.environment;
};