import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    barcode: "",
    itemBarcode: "",
    lotNumber: "",
    isConnected: true,
    offlineDataUpdated: false,
    keyboardVisible: false,
    availableDays: 0,
    environment: "",
    companyApiKey: "",
    tenantId: "",
    expire: false,
    receiveData: [],
    consumptionData: [],
    shipData: [],
    outputData: [],
    params: {},
    productionPickData: [],
};

export const metaSlice = createSlice({
  name: "meta",
  initialState,
  reducers: {
    setBarcode: (state, action) => {
      state.barcode = action.payload;
    },
    setKeyboardVisible: (state, action) => {
      state.keyboardVisible = action.payload;
    },
    setItemBarcode: (state, action) => {
      state.itemBarcode = action.payload;
    },
    setIsConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setOfflineDataUpdated: (state, action) => {
      state.offlineDataUpdated = action.payload;
    },
  
    setAvailableDays: (state, action) => {
      state.availableDays = action.payload;
    },
    setLotNumber: (state, action) => {
      state.lotNumber = action.payload;
    },
    setEnvironment: (state, action) => {
      state.environment = action.payload;
      AsyncStorage.setItem("environment", action.payload);
    },
    setCompanyApiKey: (state, action) => {
      state.companyApiKey = action.payload;
      AsyncStorage.setItem("companyApiKey", action.payload);
    },
    setTenantId: (state, action) => {
      state.tenantId = action.payload;
      AsyncStorage.setItem("tenantId", action.payload);
    },
    organizationLogout: (state) => {
      state.tenantId = "";
      state.companyApiKey = "";
      state.environment = "";
      AsyncStorage.removeItem("tenantId");
      AsyncStorage.removeItem("companyApiKey");
      AsyncStorage.removeItem("environment");
      // AsyncStorage.removeItem("persist:root");
      AsyncStorage.removeItem("ExpiryDate");
      AsyncStorage.removeItem("organization_token");
      AsyncStorage.removeItem("access_token");
      AsyncStorage.removeItem("user");
      AsyncStorage.removeItem("expire");
    },
    setExpire: (state, action) => {
      state.expire = action.payload;
      AsyncStorage.setItem("expire", action.payload);
    },
    setReceiveData: (state, action) => {
      state.receiveData = action.payload;
    },
    setConsumptionData: (state, action) => {
      state.consumptionData = action.payload;
    },
    setShipData: (state, action) => {
      state.shipData = action.payload;
    },
    setOutputData: (state, action) => {
      state.outputData = action.payload;
    },
    setParams: (state, action) => {
      state.params = action.payload;
    },
    setProductionPickData: (state, action) => {
      state.productionPickData = action.payload;
    },
  },
});

export const { setBarcode, setItemBarcode, setIsConnected, setOfflineDataUpdated, setAvailableDays, setLotNumber, setEnvironment, setCompanyApiKey, setTenantId, organizationLogout, setExpire , setReceiveData, setConsumptionData, setShipData, setOutputData, setParams, setProductionPickData, setKeyboardVisible } = metaSlice.actions;

export default metaSlice.reducer;

