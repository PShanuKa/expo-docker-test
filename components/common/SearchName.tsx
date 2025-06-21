import { RootState } from "@/store";
import { Text, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";

const SearchName = ({ value }: { value: any }) => {
  // const isConnected = useSelector((state: RootState) => state.meta.isConnected);
  // const subscriptionAvailableDays = useSelector(
  //   (state: RootState) => state.meta.availableDays
  // );
  // const loading = useSelector(
  //   (state: RootState) => state.meta.offlineDataUpdated
  // );

  const [isVisible, setIsVisible] = useState(true);

  // useEffect(() => {
  //   let timeoutId: NodeJS.Timeout;

  //   if (isConnected && !loading) {
  //     setIsVisible(true);

  //     timeoutId = setTimeout(() => {
  //       setIsVisible(false);
  //     }, 3000);
  //   } else {
  //     setIsVisible(true);
  //   }

  //   return () => clearTimeout(timeoutId);
  // }, [isConnected, loading]);

  return (
    <View className="w-full">
      <View
        className={`bg-[#E6C713] items-center w-full  justify-center p-[3px]  transition-all duration-300 `}
      >
        <Text className="text-black text-[10px] mt-0.5 font-poppins font-medium">
          {value}
        </Text>
      </View>
    </View>
  );
};

export default SearchName;
