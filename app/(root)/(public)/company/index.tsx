import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RootTagContext,
  ScrollView,
} from "react-native";

import icon from "@/assets/images/MC360.png";
import logo from "@/assets/images/Cloud Smart Logo Transparent.png";
import { useLoginMutation } from "@/services/authSlice";
import { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { logout, setUser, setUserRemember } from "@/features/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import Toast from "react-native-toast-message";
import Feather from "@expo/vector-icons/Feather";
import { AntDesign } from "@expo/vector-icons";
import CompanyCard from "@/components/common/CompanyCard";
import { useGetCompanyQuery } from "@/services/metaSlice";
import { organizationLogout } from "@/features/metaSlice";

export default function Organization() {
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    envermentnId: "",
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();

  const environment = useSelector((state: RootState) => state.meta.environment);

  useEffect(() => {
    
    if (!environment) {
      setTimeout(() => {
        router.push("/enverment");
      }, 500);
    }
  }, [environment]);

  const { data: company } = useGetCompanyQuery(environment);





  return (
    <View className=" flex h-full bg-white">
      <View className="flex-1 justify-center ">
        <View className="flex  flex-col  items-center w-full px-4 gap-6">
          <Image
            source={icon}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />

          <Text className="text-[25px] text-dark-grey font-poppins font-bold">
            Welcome to Environment
          </Text>
        </View>

        <View className="  flex-col  w-full p-4 gap-3">
          <Text className="text-[16px]  text-light-grey font-poppins font-medium">
            Select Your Company
          </Text>
          <ScrollView
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            className="max-h-[500px]"
          >
            <View className="flex flex-col gap-3">
              {company?.value?.map((item: any, index: number) => {
                return <CompanyCard key={index} item={item} />;
              })}
            </View>
          </ScrollView>
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
