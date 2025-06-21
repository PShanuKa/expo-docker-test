import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  recodeData: [],
  
};

export const recodeSlice = createSlice({
  name: "recode",
  initialState,
  reducers: {
    setRecodeData: (state, action) => {
      state.recodeData = action.payload;
      saveToStorage(action.payload);
    },
  },
});

const saveToStorage = async (data: any) => {
  try {
    await AsyncStorage.setItem("recodeData", JSON.stringify(data));
  } catch (error) {
    console.log(error);
  }
};


export const { setRecodeData } = recodeSlice.actions;

export default recodeSlice.reducer;

