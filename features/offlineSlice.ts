import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  offlineData: [],
  
};

export const offlineSlice = createSlice({
  name: "meta",
  initialState,
  reducers: {
    setOfflineData: (state, action) => {
      state.offlineData = action.payload;
      saveToStorage(action.payload);
    },
  },
});

const saveToStorage = async (data: any) => {
  try {
    await AsyncStorage.setItem("offlineData", JSON.stringify(data));
  } catch (error) {
    console.log(error);
  }
};




export const { setOfflineData } = offlineSlice.actions;

export default offlineSlice.reducer;

