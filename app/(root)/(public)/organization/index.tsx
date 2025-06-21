import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RootTagContext,
} from "react-native";

import icon from "@/assets/images/MC360.png";
import logo from "@/assets/images/Cloud Smart Logo Transparent.png";
import { useLoginMutation } from "@/services/authSlice";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { logout, setUser, setUserRemember } from "@/features/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import Toast from "react-native-toast-message";
import Feather from "@expo/vector-icons/Feather";
import { usePostOrganizationMutation } from "@/services/organizationApiSlice";
import { setTenantId } from "@/features/metaSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Organization() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    CustomerCode: "",
    Password: "",
  });

  const tenantId = useSelector((state: RootState) => state.meta.tenantId);

  useEffect(() => {
    if (tenantId) {
      router.push("/enverment");
    }
  }, [tenantId]);

  const dispatch = useDispatch();

  const [postOrganization, { isLoading }] = usePostOrganizationMutation();

  const submitOrganization = async () => {
    try {
      await postOrganization(formData)
        .unwrap()
        .then((res) => {
          if (res.TenantId) {
            dispatch(setTenantId(res.TenantId));
            AsyncStorage.setItem("ExpiryDate", res.ExpiryDate);
         
          } else {
            dispatch(setTenantId(""));
            AsyncStorage.removeItem("tenantId");
            // dispatch(setExpire(true));
            Toast.show({
              text1: "Invalid Organization ID or Password",
              type: "error",
            });
          }
        })
        .catch((err) => {
          dispatch(setTenantId(""));
          AsyncStorage.removeItem("tenantId");
          Toast.show({
            text1: "Invalid Organization ID or Password",
            type: "error",
          });
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className=" flex h-full bg-white">
      <View className="flex-1 justify-center ">
        <View className="flex flex-col  items-center w-full p-4 gap-6">
          <Image
            source={icon}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />

          <Text className="text-[25px] text-dark-grey font-poppins font-bold">
            Organization
          </Text>
          <Text className="text-[16px] text-center text-light-grey font-poppins font-medium">
            Join the Organization to make your life Successful {"\n"} and more
            productive.
          </Text>
        </View>
        <View className="flex flex-col justify-center items-center w-full py-4 px-6 gap-6">
          <TextInput
            placeholder="Organisation ID"
            value={formData.CustomerCode}
            onChangeText={(text) =>
              setFormData({ ...formData, CustomerCode: text })
            }
            className="w-full h-[50px] text-[16px] placeholder:text-light-grey border border-none rounded-md p-2 bg-input-grey focus:outline-none"
            style={{ borderWidth: 0 }}
          />
          <View className="w-full flex flex-row items-center justify-between relative">
            <TouchableOpacity
              className="absolute right-5 z-10"
              onPress={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? (
                <Feather name="eye" size={24} color="#476480" />
              ) : (
                <Feather name="eye-off" size={24} color="#476480" />
              )}
            </TouchableOpacity>
            <TextInput
              placeholder="Organisation Password"
              secureTextEntry={!showPassword}
              value={formData.Password}
              onChangeText={(text) =>
                setFormData({ ...formData, Password: text })
              }
              className="w-full h-[50px] text-[16px] placeholder:text-light-grey border border-none rounded-md p-2 bg-input-grey focus:outline-none"
              style={{ borderWidth: 0 }}
            />
          </View>
        </View>

        <View className="flex flex-col justify-center items-center w-full py-4 px-6 gap-6">
          <TouchableOpacity
            className="w-full h-[50px] bg-primary rounded-md justify-center items-center "
            onPress={submitOrganization}
            disabled={isLoading}
          >
            <Text className="text-white font-poppins font-bold uppercase text-[16px] ">
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                "NEXT"
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex flex-row gap-3 justify-center items-center w-full p-4">
        <Text className="text-[12px] font-poppins font-semibold ">
          Powered By
        </Text>
        <View className="">
          <Image
            source={logo}
            className="object-fit h-[20px]"
            style={{ width: 120, height: 25 }}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}
