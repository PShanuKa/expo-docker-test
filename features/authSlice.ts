import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: undefined,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserRemember: (state, action) => {
      state.user = action.payload;
      AsyncStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = undefined;
      AsyncStorage.removeItem("user");
    },
    
  },
});



export const { setUser, logout, setUserRemember } = authSlice.actions;
export default authSlice.reducer;
