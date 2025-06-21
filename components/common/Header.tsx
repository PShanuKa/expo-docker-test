import { View, Text } from "react-native";

export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <View className="w-full   px-[30px] pt-[10px] pb-[8px] bg-header-bg">
      {children}
    </View>
  );
}
