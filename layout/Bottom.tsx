import { Text, TouchableOpacity, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Octicons from "@expo/vector-icons/Octicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/features/authSlice";
import { RootState } from "@/store";

const Bottom = () => {
  const dispatch = useDispatch();
  const keyboardVisible = useSelector((state: RootState) => state.meta.keyboardVisible);
  return (
    <View className={`flex-1 flex-row  items-center bg-white shadow-md ${keyboardVisible ? "hidden" : ""}`}>
      <View className="flex-1  justify-center items-center">
        <TouchableOpacity
          className="items-center justify-center gap-1"
          onPress={() => {
            
            dispatch(logout())
            router.replace("/sign-in")
          }
          }
        >
          <AntDesign
            name="logout"
            size={15}
            className="text-text-grey rotate-180"
          />
          <Text className="font-poppins text-[10px] text-text-grey font-bold ">
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1  justify-center items-center">
        <Link href="/" asChild className=" ">
          <TouchableOpacity className="items-center justify-center gap-1">
            <Octicons name="home" size={15} className="text-text-grey" />
            <Text className="font-poppins text-[10px] text-text-grey font-bold">
              Home
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
      <View className="flex-1  justify-center items-center">
        <Link href="/pending" asChild className=" ">
          <TouchableOpacity className="items-center justify-center gap-1 ">
            <AntDesign name="reload1" size={15} className="text-text-grey" />
            <Text className="font-poppins text-[10px] text-text-grey font-bold">
              Pending
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default Bottom;
