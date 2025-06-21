import React from "react";
import { setUser } from "@/features/authSlice";
import Bottom from "@/layout/Bottom";
import { RootState } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Redirect,
  router,
  Slot,
  SplashScreen,
  Stack,
  Tabs,
  useSegments,
} from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { useCreateReceiveTrackingMutation } from "@/services/receiveSlice";
import { useCreateOutputTrackingMutation } from "@/services/outputSlice";
import { useCreateConsumptionTrackingMutation } from "@/services/consumptionSlice";
import { useCreateShipTrackingMutation } from "@/services/shipSlice";
import { setOfflineData } from "@/features/offlineSlice";
import { useApiLoop } from "@/hooks/useApiLoop";
import { setAvailableDays, setExpire, setOfflineDataUpdated } from "@/features/metaSlice";
import SubscriptionExpiredScreen from "../(public)/block";

export default function PrivateLayout() {
  const segments = useSegments();
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(false);

  const [createReceiveTracking] = useCreateReceiveTrackingMutation();
  const [createOutputTracking] = useCreateOutputTrackingMutation();
  const [createConsumptionTracking] = useCreateConsumptionTrackingMutation();
  const [createShipTracking] = useCreateShipTrackingMutation();

  const user = useSelector((state: RootState) => state.auth.user);
  const isConnected = useSelector((state: RootState) => state.meta.isConnected);
  const offlineData = useSelector(
    (state: RootState) => state.offline.offlineData
  );

  const expire = useSelector((state: RootState) => state.meta.expire);



  const { isLoading, triggerSync } = useApiLoop(isConnected);

  useEffect(() => {
    if (isConnected) {
      triggerSync();
    }
  }, [isConnected]);

  useEffect(() => {
    const checkExpiry = async () => {
      const expiryDate = (await AsyncStorage.getItem("ExpiryDate")) || "";
      const currentDate = new Date();
      const isExpired = currentDate > new Date(expiryDate);
      dispatch(setExpire(isExpired));
      const differenceInMs = new Date(expiryDate).getTime() - currentDate.getTime();
      const differenceInDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
      dispatch(setAvailableDays(differenceInDays));
    };
    checkExpiry();
  }, []);

  useEffect(() => {
    dispatch(setOfflineDataUpdated(isLoading));
  }, [isLoading]);




  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.replace("/sign-in");
    }
  }, [user, isMounted]);

  useEffect(() => {
    if (isConnected) {
      triggerSync;
    }
  }, [isConnected]);

  if (!isMounted) {
    return null;
  }

  if (!user) {
    SplashScreen.hideAsync();
    return null;
  }



  if (Boolean(expire)) {
    return <SubscriptionExpiredScreen />;
  }

  return (
    <View className="flex-1 " style={{ transform: [{ scale: 1 }] }}>
      {/* <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="[category]" options={{ headerShown: false }} />
        <Stack.Screen name="pending" options={{ headerShown: false }} />
        <Stack.Screen name="scanner" options={{ headerShown: false }} />
      </Stack> */}

      <Slot />
      {segments[1] !== "scanner" && (
        <View className="h-[50px] w-full ">
          <Bottom />
        </View>
      )}
    </View>
  );
}
