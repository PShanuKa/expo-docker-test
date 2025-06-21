import {
  Slot,
  SplashScreen,
  Stack,
  useNavigationContainerRef,
} from "expo-router";
import "./global.css";
import { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { persistor, store } from "../store";
import Toast from "react-native-toast-message";
import { PersistGate } from "redux-persist/integration/react";
// import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCompanyApiKey, setEnvironment } from "@/features/metaSlice";

  // const navigationIntegration = Sentry.reactNavigationIntegration({
  //   enableTimeToInitialDisplay: !isRunningInExpoGo(),
  // });

function RootLayout() {
  const [fontsLoaded] = useFonts({
    "poppins-regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  const [localStorageLoaded, setLocalStorageLoaded] = useState(false);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const fetchLocalStorageData = async () => {
      try {
        const companyId = await AsyncStorage.getItem("companyApiKey");
        const environment = await AsyncStorage.getItem("environment");
      } catch (error) {
        console.error("Error fetching data from AsyncStorage:", error);
      } finally {
        setLocalStorageLoaded(true);
      }
    };

    fetchLocalStorageData();
  }, []);

  // useEffect(() => {
  //   if (navigationRef?.current) {
  //     navigationIntegration.registerNavigationContainer(navigationRef);
  //   }
  // }, [navigationRef]);

  useEffect(() => {
    if (fontsLoaded && localStorageLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, localStorageLoaded]);

  if (!fontsLoaded || !localStorageLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
        <Slot />
        {/* <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(root)" />
        </Stack> */}
        <Toast />
      {/* </PersistGate> */}
    </Provider>
  );
}

// export default Sentry.wrap(RootLayout);
export default RootLayout;
