import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";

const window = Dimensions.get("window");

export default function CategoryCard({
  title,
  icon,
  link,
}: {
  title: string;
  icon: React.ReactNode;
  link: any;
}) {
  return (
    <Link href={link} asChild>
      <TouchableOpacity activeOpacity={0.5}>
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          className="flex bg-white flex-row gap-4  rounded-[15px] overflow-hidden border border-primary "
        >
          <View style={{height: window.height * 0.12}} className="w-[100px] h-[100px]  border-[3px] border-[#c4c4c4] bg-secondary rounded-l-[15px]   justify-center items-center rounded-br-[30px]">
            {icon}
          </View>
          <View className="flex-1   justify-center">
            <Text className="text-black text-[20px] font-poppins font-bold">
              {title}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
