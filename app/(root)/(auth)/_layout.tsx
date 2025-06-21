import { router, Slot, Stack } from "expo-router";
import { useEffect } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store";


export default function AuthLayout() {
  const user = useSelector((state: RootState) => state.auth.user);
  const environment = useSelector((state: RootState) => state.meta.environment);
  const companyId = useSelector((state: RootState) => state.meta.companyApiKey);

  useEffect(() => {
    if (!environment || !companyId) {
      setTimeout(() => {
        router.replace("/enverment");
      }, 500);
    }
    if (user) {
      setTimeout(() => {
        router.replace("/");
      }, 500);
    }
  }, [user , environment , companyId]);

  return (
    <Slot />
      // <Stack>
      //   <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      // </Stack>
  );
}