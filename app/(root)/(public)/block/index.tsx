import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { organizationLogout, setEnvironment } from "@/features/metaSlice";

const SubscriptionExpiredScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-6">
        <MaterialIcons name="error-outline" size={120} color="#EF4444" />
        
        <Text className="text-3xl font-bold text-gray-800 text-center mt-8">
          Subscription Expired
        </Text>
        
        <Text className="text-gray-600 text-center mt-4 text-lg">
          Your subscription has expired. Please renew to continue using all features.
        </Text>

        
        {/* <TouchableOpacity 
          className="bg-blue-600 py-4 px-8 rounded-full mt-8"
        >
          <Text className="text-white font-semibold text-lg">
            Renew Subscription
          </Text>
        </TouchableOpacity> */}

        <TouchableOpacity className="mt-4">
          <Text className="text-blue-600">Contact Support</Text>
        </TouchableOpacity>
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
};

export default SubscriptionExpiredScreen;
