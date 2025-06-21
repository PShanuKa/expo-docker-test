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
import { useState } from "react";
import { router } from "expo-router";
import { logout, setUser, setUserRemember } from "@/features/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import Toast from "react-native-toast-message";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { organizationLogout, setTenantId } from "@/features/metaSlice";

export default function SignIn() {
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const environment = useSelector((state: RootState) => state.meta.environment);
  const companyId = useSelector((state: RootState) => state.meta.companyApiKey);
  const tenantId = useSelector((state: RootState) => state.meta.tenantId);

  const [formData, setFormData] = useState({
    UserName: "",
    Password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    await login({
      ...formData,
      environment: environment,
      companyId: companyId,
      tenantId: tenantId,
    })
      .unwrap()
      .then((res) => {
        if (rememberMe) {
          dispatch(setUserRemember(res));
        } else {
          dispatch(setUser(res));
        }
      })
      .catch((err) => {
        console.log(err);
        dispatch(logout());
        if (err.status === 400) {
          Toast.show({
            text1: "Invalid username or password",
            type: "error",
          });
        } else {
          Toast.show({
            text1: "Login failed",
            type: "error",
          });
        }
      });
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
            Welcome Back!
          </Text>
          {/* <Text className="text-[16px] text-center text-light-grey font-poppins font-medium">
            Effortless Management for Your Financial {"\n"} Goals.
          </Text> */}
        </View>
        <View className="flex flex-col justify-center items-center w-full py-4 px-6 gap-6">
          <TextInput
            placeholder="Username"
            value={formData.UserName}
            onChangeText={(text) =>
              setFormData({ ...formData, UserName: text })
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
              placeholder="Password"
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

        <View className="flex flex-row justify-between items-center w-full py-4 px-6">
          <View className="flex flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              className="w-5 h-5 p-0.5 border border-[#DCDCDC] bg-input-grey  rounded-sm justify-center items-center"
            >
              <View
                className={`w-full h-full  rounded-sm ${
                  rememberMe ? "bg-primary" : "bg-input-grey"
                }`}
              />
            </TouchableOpacity>
            <Text className="text-[14px] text-dark-grey font-poppins">
              Remember me
            </Text>
          </View>

          {/* <TouchableOpacity>
            <Text className="text-[14px] text-primary font-poppins">
              Forgot Password?
            </Text>
          </TouchableOpacity> */}
        </View>

        <View className="flex flex-col justify-center items-center w-full py-4 px-6 gap-6">
          <TouchableOpacity
            className="w-full h-[50px] bg-primary rounded-md justify-center items-center "
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white font-poppins font-bold uppercase text-[16px] ">
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                "Sign In"
              )}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex flex-row justify-center items-center w-full  px-6 ">
          <Text className="text-[12px] text-dark-grey font-poppins font-semibold">
            Version 1.0.0
          </Text>
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
