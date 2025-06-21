import {
  View,
  Text,
  TouchableOpacity,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  useGetReceiveLineListQuery,
  usePostReceiveItemMutation,
} from "@/services/receiveSlice";
import {
  useGetConsumptionLineListQuery,
  usePostConsumptionItemMutation,
} from "@/services/consumptionSlice";
import {
  useGetShipLineListQuery,
  usePostShipItemMutation,
} from "@/services/shipSlice";
import { useFetchLineList } from "@/hooks/useFetchLineList";
import { useDispatch, useSelector } from "react-redux";
import { setCompanyApiKey } from "@/features/metaSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { setRecodeData } from "@/features/recodeSlice";

export default function CompanyCard({ item }: any) {
  const dispatch = useDispatch();
  const handleCompany = () => {
    dispatch(setCompanyApiKey(item.id));
    AsyncStorage.setItem("companyApiKey", item.id);
    router.push("/");
  };

  return (
    <Link href="/" asChild>
      <TouchableOpacity activeOpacity={0.5} onPress={handleCompany}>
        <View className="flex bg-white flex-row gap-4 h-14  items-center py-2 px-3 rounded-[6px] overflow-hidden border border-primary shadow-lg w-full ">
          <View className="flex-1">
            <Text className="text-[14px] font-poppins font-medium">
              {item.name}
            </Text>
            {/* <Text className="text-[10px] font-poppins font-normal mt-1 text-[#4F4F4F]">
                123
              </Text> */}
          </View>
          <View className="flex flex-row gap-2 items-center">
            <AntDesign name="right" size={21} color="#3674AD" />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
