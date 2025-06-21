
import { CameraView, useCameraPermissions } from "expo-camera";
import Header from "@/components/common/Header";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Vibration } from "react-native";



import {  Text,  TouchableOpacity, View } from "react-native";
import {  router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBarcode, setLotNumber } from "@/features/metaSlice";
import { RootState } from "@/store";

const Scanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const { type: typeParam } = useLocalSearchParams();
  const [test, setTest] = useState("");
  const [barcodeData, setBarcodeData] = useState({ type: "", data: "" });
  const [scanningState, setScanningState] = useState("idle");
  const [error, setError] = useState("");

  const barcode = useSelector((state: RootState) => state.meta.barcode);

  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(setBarcode(barcodeData.data));
  //   router.back();
  // }, [barcodeData]);

  const handleBarcodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    Vibration.vibrate(100);
    if (!data) {
      setError("Invalid barcode detected. Please try again.");
      setScanningState("error");
      return;
    }
    setBarcodeData({ type, data });
    setScanningState("success");
    if(typeParam === "lotqr"){
      dispatch(setLotNumber(data));
    }else{
      dispatch(setBarcode(data));
    }
    router.back();
    // setTimeout(() => {
    // }, 300);
  };

  const handleRequestPermission = async () => {
    const permissionResponse = await requestPermission();
    if (!permissionResponse.granted) {
      Alert.alert(
        "Camera Permission Required",
        "This app needs access to your camera to scan barcodes.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "OK", onPress: handleRequestPermission },
        ]
      );
    }
  };

  if (!permission?.granted) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-[16px] font-poppins font-bold capitalize text-center mb-4">
          Camera permission is required to scan barcodes.
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-[10px] py-4 px-8"
          onPress={handleRequestPermission}
        >
          <Text className="text-white text-[16px] font-poppins font-bold capitalize text-center">
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 ">
      <Header>
        <View className="flex flex-row justify-between items-center">
          <TouchableOpacity
            className="bg-white rounded-[15px] p-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-white text-[20px] font-poppins font-bold capitalize">
            Scanner
          </Text>
          <View className="flex flex-row gap-2 w-[30px]"></View>
        </View>
      </Header>

      <View className="flex-1 flex-col ">
        {!permission && <Text>Requesting for camera permission</Text>}

        <View className="flex-1 bg-black justify-center items-center">
          <CameraView
            onBarcodeScanned={handleBarcodeScanned}
            
            className="flex-1 "
            style={{ flex: 1, width: "100%" }}
          >
            <View className="w-full  justify-center items-center">
              {scanningState === "scanning" && (
                <Text className="text-white text-[14px] font-poppins font-normal capitalize text-center">
                  Scanning... Please wait.
                </Text>
              )}
              {scanningState === "success" && (
                <Text className="text-white text-[16px] font-poppins font-bold capitalize text-center">
                  Barcode scanned successfully!
                </Text>
              )}
              {scanningState === "error" && (
                <Text className="text-white text-[14px] font-poppins font-normal capitalize text-center">
                  Error scanning barcode. Please try again.
                </Text>
              )}
              {error && (
                <Text className="text-red-500 text-[14px] font-poppins font-normal capitalize text-center">
                  {error}
                </Text>
              )}
            </View>
            <View className="w-full p-10">
              <View className="w-full h-[300px]  relative mt-10">
                <View className="w-[50px] h-[50px]  border-t-4 border-l-4 border-white absolute top-0 left-0" />

                <View className="w-[50px] h-[50px]  border-t-4 border-l-4 border-white rotate-90 absolute top-0 right-0" />
                <View className="w-[50px] h-[50px]  border-t-4 border-l-4 border-white -rotate-90 absolute bottom-0 left-0" />
                <View className="w-[50px] h-[50px]  border-t-4 border-l-4 border-white rotate-180 absolute bottom-0 right-0" />
              </View>
            </View>
            <View className="w-full relative mb-20">
              <View className="w-full p-10">
                <TouchableOpacity className="bg-primary rounded-[10px] py-4  w-full " onPress={() => {
                  router.back();
                }}>
                  <Text className="text-white text-[16px] font-poppins font-bold capitalize text-center">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="w-full  relative mb-20">
                <Text className="text-white text-[24px] font-poppins font-bold capitalize text-center">
                  Scanning Barcode
                </Text>
                <Text className="text-white text-[14px] font-poppins font-normal capitalize text-center">
                  Ensure the barcode is fully visible, not {`\n`} obstructed,
                  and well-lit for accurate {`\n`} scanning.
                </Text>
              </View>
            </View>
          </CameraView>
        </View>
      </View>
    </View>
  );
};

export default Scanner;
