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
import { organizationLogout, setEnvironment } from "@/features/metaSlice";
import {
  useGetCompanyQuery,
  useLazyGetCompanyQuery,
} from "@/services/metaSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Enverment() {
  const [formData, setFormData] = useState({
    envermentnId: "",
  });

  const dispatch = useDispatch();
  const [useGetCompanyQuery, { data: company, isLoading }] =
    useLazyGetCompanyQuery();

  const tenantId = useSelector((state: RootState) => state.meta.tenantId);

  const handleEnverment = async () => {
    dispatch(setEnvironment(formData.envermentnId));
    AsyncStorage.setItem("environment", formData.envermentnId);
    await useGetCompanyQuery(formData.envermentnId)
      .unwrap()
      .then((res) => {
        res.value.length > 0
          ? router.push("/company")
          : Toast.show({
              type: "error",
              text1: "No Company Found",
            });
      })
      .catch((err) => {
        Toast.show({
          type: "error",
          text1: "Invalid Enverment ID",
        });
      });
  };

  useEffect(() => {
    if (!tenantId) {
      setTimeout(() => {
        router.push("/organization");
      }, 500);
    }
  }, [tenantId]);

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
          Environment
          </Text>
          <Text className="text-[16px] text-center text-light-grey font-poppins font-medium">
            Conquer life by merging with your {"\n"} Environment.
          </Text>
        </View>
        <View className="flex flex-col justify-center items-center w-full py-4 px-6 gap-6">
          <TextInput
            placeholder="Enverment ID"
            value={formData.envermentnId}
            onChangeText={(text) =>
              setFormData({ ...formData, envermentnId: text })
            }
            className="w-full h-[50px] text-[16px] placeholder:text-light-grey border border-none rounded-md p-2 bg-input-grey focus:outline-none"
            style={{ borderWidth: 0 }}
          />
        </View>

        <View className="flex flex-col justify-center items-center w-full py-4 px-6 gap-6">
          <TouchableOpacity
            className="w-full h-[50px] bg-primary rounded-md justify-center items-center "
            onPress={handleEnverment}
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
      <View className="flex flex-row justify-between">
        <View>
          <TouchableOpacity
            onPress={() => {
              dispatch(organizationLogout());
              router.push("/organization");
            }}
          >
            <Text className="text-[8px] font-poppins font-semibold text-primary">
              logout organization
            </Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </View>
  );
}
