import { Slot, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { checkNetworkConnection } from "@/utils";
import {
  setAvailableDays,
  setIsConnected,
  setCompanyApiKey,
  setEnvironment,
  setTenantId,
} from "@/features/metaSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUser } from "@/features/authSlice";
import { setOfflineData } from "@/features/offlineSlice";
import SubscriptionExpiredScreen from "./(public)/block";
import { setRecodeData } from "@/features/recodeSlice";

export default function Layout() {
  const dispatch = useDispatch();
  const [access, setAccess] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const user = await AsyncStorage.getItem("user");
      const companyId = await AsyncStorage.getItem("companyApiKey");
      const environment = await AsyncStorage.getItem("environment");
      const tenantId = await AsyncStorage.getItem("tenantId");
      if (user) {
        dispatch(setUser(JSON.parse(user)));
      }
      if (companyId) {
        dispatch(setCompanyApiKey(companyId));
      }
      if (environment) {
        dispatch(setEnvironment(environment));
      }
      if (tenantId) {
        dispatch(setTenantId(tenantId));
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedRecodeData = await AsyncStorage.getItem("recodeData");
        if (storedRecodeData !== null) {
          const parsedRecodeData = JSON.parse(storedRecodeData);

          const fiveDaysAgo = new Date();
          fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

          const filteredRecodeData = parsedRecodeData.filter((item: any) => {
            const createdAtDate = new Date(item.createdAt);
            return createdAtDate >= fiveDaysAgo;
          });

          if (filteredRecodeData.length > 0) {
            dispatch(setRecodeData(filteredRecodeData));
          } else {
            console.log("No recodeData entries are within the last 5 days.");
          }
        }

        const storedData = await AsyncStorage.getItem("offlineData");
        if (storedData !== null) {
          dispatch(setOfflineData(JSON.parse(storedData)));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadStoredData();
  }, [dispatch]);

  // useEffect(() => {
  //   const getSubscriptionList = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://bar-code.duckdns.org/subscription/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  //       );
  //       const data = await response.json();

  //       setAccess(data.data.access);
  //       dispatch(setAvailableDays(data.data.availableDate));
  //     } catch (error) {
  //       console.error("Error fetching subscription status:", error);
  //     }
  //   };
  //   getSubscriptionList();
  // }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const isConnected = await checkNetworkConnection();
      dispatch(setIsConnected(isConnected));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return access ? <Slot />
   : <SubscriptionExpiredScreen />;
}

{
  /* <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    <Stack.Screen name="(private)" options={{ headerShown: false }} />
    <Stack.Screen name="(public)" options={{ headerShown: false }} />
    <Stack.Screen name="company" options={{ headerShown: false }} />
    <Stack.Screen name="enverment" options={{ headerShown: false }} />
    <Stack> */
}
