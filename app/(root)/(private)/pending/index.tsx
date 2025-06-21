import {
  ScrollView,
  Text,

  TouchableOpacity,
  View,
} from "react-native";
import {  router } from "expo-router";
import Header from "@/components/common/Header";
import Ionicons from "@expo/vector-icons/Ionicons";



import { useSelector } from "react-redux";
import { RootState } from "@/store";
import OnlineStatus from "@/components/common/onlineStatus";
import { useApiLoop } from "@/hooks/useApiLoop";
import Toast from "react-native-toast-message";


const Pending = () => {
  const offlineData = useSelector(
    (state: RootState) => state.offline.offlineData
  );
  const isConnected = useSelector((state: RootState) => state.meta.isConnected);
  const { isLoading, triggerSync } = useApiLoop(isConnected);
  return (
    <View className="flex-1">
      <Header>
        <View className="flex flex-row justify-between items-center">
          <TouchableOpacity
            className="bg-white rounded-[15px] p-2"
            onPress={() => router.navigate("/(root)")}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-white text-[20px] font-poppins font-bold capitalize">
            Pending
          </Text>
          <View className="flex flex-row gap-2">
            <TouchableOpacity className="p-2" onPress={
              () => {
                if(!isConnected){
                  Toast.show({
                    text1: "No internet connection",
                    type: "error",
                  });
                  return;
                }
                if(offlineData.length > 0){
                  triggerSync();
                }else{
                  Toast.show({
                    text1: "No data to sync",
                    type: "info",
                  });
                }
              }
            }>
              <Ionicons name="reload-circle" size={37} color="white" className={`${isLoading ? "animate-spin" : ""}`} />
            </TouchableOpacity>
          </View>
        </View>
      </Header>
      <OnlineStatus />

      <ScrollView scrollEventThrottle={16}>
        <View className="flex-1 px-[30px] py-[20px] gap-6">
          {offlineData?.length > 0 ? (
            offlineData?.map((item: any, index: number) => (
              <TouchableOpacity activeOpacity={0.5} key={index}>
                <View className="flex bg-white flex-row gap-4  items-center p-4 rounded-[6px] overflow-hidden border border-primary shadow-lg w-full ">
                  <View className="flex-1">
                    <Text className="text-[14px] font-poppins font-medium capitalize">
                      {item.category}
                    </Text>
                    {item.ItemNo && (
                      <Text className="text-[10px] font-poppins font-normal mt-1 text-[#4F4F4F]">
                        Item No : {item.ItemNo || "-"}
                      </Text>
                    )}
                    {item.lineNo && (
                      <Text className="text-[10px] font-poppins font-normal mt-1 text-[#4F4F4F]">
                        Line No : {item.lineNo || "-"}
                      </Text>
                    )}
                    <Text className="text-[10px] font-poppins font-normal mt-1 text-[#4F4F4F]">
                      Quantity : {item.Quantity || "-"}
                    </Text>
                   
                    <Text className="text-[10px] font-poppins font-normal mt-1 text-[#4F4F4F]">
                      Created At : {item.createdAt.split("T")[0] || "-"}
                    </Text>
                    <Text className="text-[10px] font-poppins font-normal mt-1 text-[#4F4F4F]">
                      Id : {item.id || "-"}
                    </Text>
                    {item.error && (
                      <Text className="text-[10px] font-poppins font-normal mt-1 text-red-500">
                        Error : {item.error || "-"}
                      </Text>
                    )}
                  </View>
                  <View>
                    {/* <AntDesign name="right" size={21} color="#3674AD" /> */}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-center text-gray-500">No items found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Pending;
