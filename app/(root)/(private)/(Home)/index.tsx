import CategoryCard from "@/components/common/CategoryCard";
import Header from "@/components/common/Header";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";


import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useEffect } from "react";
import { setBarcode, setKeyboardVisible } from "@/features/metaSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import OnlineStatus from "@/components/common/onlineStatus";
import Feather from '@expo/vector-icons/Feather';
import { Dimensions } from "react-native";
import { router } from "expo-router";

const window = Dimensions.get("window");


const categories = [
  {
    title: "Receive",
    icon: <MaterialIcons name="add-shopping-cart" size={40} color="white" />,
    link: {
      pathname: "/receive",
      params: {
        type: "receive",
      },
    },
  },
  {
    title: "Production Pick",
    icon: <Feather name="package" size={40} color="white" />,
    link: {
      pathname: "/production-pick",
      params: {
        type: "production-pick",
      },
    },
  },
  {
    title: "Consumption",
    icon: <Entypo name="cycle" size={40} color="white" />,
    link: {
      pathname: "/consumption",
      params: {
        type: "consumption",
      },
    },
  },
  {
    title: "Output",
    icon: <MaterialIcons name="logout" size={40} color="white" />,
    link: {
      pathname: "/output",
      params: {
        type: "output",
      },
    },
  },
  {
    title: "Ship",
    icon: (
      <MaterialCommunityIcons
        name="truck-fast-outline"
        size={40}
        color="white"
      />
    ),
    link: {
      pathname: "/ship",
      params: {
        type: "ship",
      },
    },
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isConnected = useSelector((state: RootState) => state.meta.isConnected);

  const companyId = useSelector((state: RootState) => state.meta.companyApiKey);
  const environment = useSelector((state: RootState) => state.meta.environment);

  useEffect(() => {
    dispatch(setBarcode(""));
    dispatch(setKeyboardVisible(false));
  }, []);

  
  useEffect(() => {
    if (!companyId ||  !environment) {
      router.replace("/enverment");
    }
  }, [companyId, environment]);

  return (
    <View className="flex-1 ">
      <Header>
        <View className=" flex-row justify-between items-center">
          <View className={`flex-row items-center gap-3`}>
            {/* <Image
              source={require("@/assets/images/profile.jpg")}
              style={{
                width: 61,
                height: 61,
                borderRadius: 50,
         
              }}
              resizeMode="cover"

            /> */}
            <View>
              <Text className="text-white font-semibold text-base">
                {user?.UserName || ""}
              </Text>
              <Text className="text-white font-normal text-[13px]">
                {user?.UserRole || "Employee"}
              </Text>
            </View>
          </View>

          <View className="flex-1 relative flex-row justify-end items-center hidden">
            <TouchableOpacity className="">
              <Ionicons name="notifications-outline" size={26} color="white" />
            </TouchableOpacity>
            <View className="absolute top-0 right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full">
              <Text className="text-white text-[10px]"></Text>
            </View>
          </View>
        </View>
      </Header>
      <OnlineStatus />

      <ScrollView>
        <View style={{gap: window.height * 0.02}} className={`flex-1 px-[30px] py-[20px]`}>
          {categories.map((category) => (
            <CategoryCard
              key={category.title}
              title={category.title}
              icon={category.icon}
              link={category.link}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;
