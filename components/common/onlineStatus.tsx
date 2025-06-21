import { RootState } from "@/store";
import { Text, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";

const OnlineStatus = () => {
  const isConnected = useSelector((state: RootState) => state.meta.isConnected);
  const subscriptionAvailableDays = useSelector(
    (state: RootState) => state.meta.availableDays
  );
  const loading = useSelector(
    (state: RootState) => state.meta.offlineDataUpdated
  );

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isConnected && !loading) {
      setIsVisible(true);

      timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } else {
      setIsVisible(true);
    }

    return () => clearTimeout(timeoutId);
  }, [isConnected, loading]);

  

  return (
    <View className="w-full">
      <View
        className={`items-center w-full  justify-center p-[3px]  transition-all duration-300 ${
          isVisible ? "opacity-100" : "hidden"
        } ${
          loading ? "bg-gray-500" : isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      >
        <Text className="text-white text-[10px] mt-0.5 font-poppins font-medium">
          {loading ? "Syncing..." : isConnected ? "Online" : "Offline"}
        </Text>
      </View>
      {subscriptionAvailableDays <= 30 && (
        <View
          className={`items-center w-full gap-2 justify-center p-[3px] bg-slate-100`}
        >
          <Text className="text-black text-[10px] mt-0.5 font-poppins font-medium">
            Your Subscription will expire in {subscriptionAvailableDays} days
          </Text>
        </View>
      )}
    </View>
  );
};

export default OnlineStatus;
