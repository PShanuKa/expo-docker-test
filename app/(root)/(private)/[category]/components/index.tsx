import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, router, Link } from "expo-router";
import Header from "@/components/common/Header";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import ItemsCard from "@/components/common/ItemCard";
import { useEffect, useRef, useState } from "react";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { useGetReferenceQuery } from "@/services/referenceSlice";
import OnlineStatus from "@/components/common/onlineStatus";
import { setConsumptionData, setKeyboardVisible, setLotNumber } from "@/features/metaSlice";
import { Dimensions } from "react-native";
import { useDeviceCheck } from "@/hooks/useDeviceCheck";
import { usePostReceiveItemMutation } from "@/services/receiveSlice";
import {
  useGetConsumptionOrderListQuery,
  usePostConsumptionItemMutation,
} from "@/services/consumptionSlice";
import { usePostShipItemMutation } from "@/services/shipSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { setRecodeData } from "@/features/recodeSlice";
import SearchName from "@/components/common/SearchName";

const window = Dimensions.get("window");

const ComponentsList = () => {
  const { no, id, poNumber, title, category, CustomerName } =
    useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [size, setSize] = useState(10);
  const barcode = useSelector((state: RootState) => state.meta.barcode);
  const offlineData = useSelector(
    (state: RootState) => state.offline.offlineData
  );

  // const list = JSON.parse((listDataString as string) || "[]");

  const [salesData, setSalesData] = useState({
    LotNo: "",
    ExpiryDate: "",
    Quantity: "",
  });

  const recode = useSelector((state: any) => state.recode.recodeData);
  const companyId = useSelector((state: RootState) => state.meta.companyApiKey);
  const environment = useSelector((state: RootState) => state.meta.environment);
  const tenantId = useSelector((state: RootState) => state.meta.tenantId);

  // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  const consumptionData = useSelector(
    (state: RootState) => state.meta.consumptionData
  );

  const consumptionLineData = consumptionData?.find((info: any) => {
    return info?.No == no;
  });

  const consumptionOrderData = consumptionData?.find((info: any) => {
    return info?.No == no;
  });

  const consumptionOrderLineData = consumptionOrderData?.prodOrderLineList.find(
    (info: any) => {
      return info?.ItemNo == id;
    }
  );

  const consumptionOrderLineDataComponent =
    consumptionOrderLineData?.prodOrderComponent || [];

  const listData = consumptionOrderLineDataComponent || [];

  // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  const recodeItem = recode?.find((info: any) => {
    return list?.find((line: any) => {
      if (category === "receive") {
        console.log(info);
        return line?.ItemNo === info?.ItemNo && info?.poNumber === poNumber;
      }
      if (category === "consumption") {
        return (
          info?.ProdOrderNo === line?.ProdOrderNo &&
          info?.ItemNo === line?.ItemNo
        );
      }
      return false;
    });
  });

  useEffect(() => {
    dispatch(setKeyboardVisible(false));
  }, []);


  const searchInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const paramsGetApi = useSelector((state: RootState) => state.meta.params);

  const { data: consumeRefetch, refetch: consumeRef } =
    useGetConsumptionOrderListQuery(paramsGetApi, {
      skip: category !== "consumption",
    });

  useEffect(() => {
    dispatch(setConsumptionData(consumeRefetch?.value || []));
  }, [consumeRefetch]);

  const { data: referenceData } = useGetReferenceQuery({
    environment,
    companyId,
    tenantId,
  });

  const referenceFilter =
    referenceData?.value?.filter(
      (item: any) => item.ReferenceNo === searchQuery
    ) || [];

  const isHoneywellDevice = useDeviceCheck();

  useEffect(() => {
    if (barcode) {
      setSearchQuery(barcode);
    }
  }, [barcode]);

  const params = {
    searchQuery: searchQuery,
    documentNo: poNumber,
  };

  const listDataFilter = listData?.filter((item: any) => {
    return item?.ItemNo?.toLowerCase().includes(searchQuery?.toLowerCase());
  });

  const referenceListFilter = listData?.filter((item: any) => {
    return item?.itemReferenceList?.some((reference: any) => {
      return reference?.ReferenceNo == searchQuery;
    });
  });

  const mergeListData = [
    ...(listDataFilter || []),
    ...(referenceListFilter || []),
  ];

  const length = mergeListData?.length;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLotNumber(""));
  }, []);

  useEffect(() => {
    if (length === 1 && searchQuery.length > 0) {
      const item = mergeListData[0];
      router.push({
        pathname: "(root)/[category]/line/[id]",
        params: {
          category: category,
          id: item?.ItemNo,
          root: category,
          title:
            category === "receive"
              ? "Purchase Lines"
              : category === "ship"
                ? "Sales Order Lines"
                : category === "consumption"
                  ? "Prod. Order Components"
                  : category === "output"
                    ? "Output Lines"
                    : "",
          no: no,
          AppStatus: item?.AppStatus,
          lineId: id,
          lineNo: item?.ProdOrderLineNo,
          componentLineNo: item?.LineNo
        },
      });
    }
  }, [length, searchQuery]);

  const documentNo = (mergeListData || []).map((item: any) => {
    if (category === "consumption") {
      const offlineItem = offlineData.find(
        (offline: any) => offline.ItemNo === item.ItemNo
      );
      if (offlineItem) {
        return { ...item, updatedQty: offlineItem?.Quantity };
      }
    } else {
      const offlineItem = offlineData.find(
        (offline: any) =>
          offline.ItemNo === item.ItemNo && offline.category === category
      );
      if (offlineItem) {
        return { ...item, updatedQty: offlineItem?.Quantity };
      }
    }
    return item;
  });

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    if (isNearBottom && listData?.length >= size) {
      setSize((prevSize) => prevSize + 10);
    }
  };

  const [postConsumptionItem, { isLoading: isLoadingConsumptionPost }] =
    usePostConsumptionItemMutation();

  const isLoading = isLoadingConsumptionPost;

  const postHandle = async () => {
    // const updateRecodeData = async (category: string) => {
    //   const storedRecodeData = await AsyncStorage.getItem("recodeData");
    //   const parsedRecodeData = storedRecodeData
    //     ? JSON.parse(storedRecodeData)
    //     : [];
    //   const updatedRecodeData = parsedRecodeData.filter(
    //     (item: any) =>
    //       !(item.poNumber === poNumber && item.category === category)
    //   );
    //   dispatch(setRecodeData(updatedRecodeData));
    //   Toast.show({
    //     type: "success",
    //     text1: "Success",
    //     text2: "Data posted successfully",
    //   });
    // };

    try {
      if (category === "consumption") {
        await postConsumptionItem({
          OrderNumber: no,
          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
        })
          .unwrap()
          .then(() => {
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Data posted successfully",
            });
            consumeRef();
          })
          // .then(() => updateRecodeData(category))
          .catch((error) => {
            console.error("Error in postConsumptionItem:", error);
            Toast.show({
              type: "error",
              text1: "Error",
              text2: error?.data?.error?.message || "Something went wrong",
            });
            throw error;
          });
      }
    } catch (error) {
      console.error("Unhandled error in postHandle:", error);
    }
  };

  return (
    <View className="flex-1">
      <Header>
        <View className="flex flex-row justify-between items-center">
          <TouchableOpacity
            className="bg-white rounded-[15px] p-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-white text-[20px] font-poppins font-bold capitalize">
            {title}
          </Text>
          <View className="flex flex-row gap-2">
            <TouchableOpacity className="p-2 opacity-0">
              <MaterialIcons name="qr-code-scanner" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        {/* <View></View> */}
        <View className="mt-1 py-1 flex flex-row ">
          <View className="flex-1">
            <View className="flex flex-row gap-3">
              <View className="flex flex-row gap-2 w-[90px] justify-between">
                <Text className="text-[14px] font-poppins font-bold text-white">
                  Order No
                </Text>
                <Text className="text-[14px] font-poppins font-bold text-white">
                  :
                </Text>
              </View>
              <Text className="text-[14px] font-poppins font-normal text-white">
                {no}
              </Text>
            </View>

            <View className="">
              <View className="flex flex-row gap-3">
                <View className="flex flex-row gap-2 w-[90px] justify-between">
                  <Text className="text-[14px] font-poppins font-bold text-white">
                    Item No
                  </Text>
                  <Text className="text-[14px] font-poppins font-bold text-white">
                    :
                  </Text>
                </View>
                <Text className="text-[14px] font-poppins font-normal text-white w-3/4">
                  {id}
                </Text>
              </View>

              {category === "ship" && (
                <View className="flex flex-row gap-3">
                  <View className="flex flex-row gap-2 w-[90px] justify-between">
                    <Text className="text-[14px] font-poppins font-bold text-white">
                      Customer
                    </Text>
                    <Text className="text-[14px] font-poppins font-bold text-white">
                      :
                    </Text>
                  </View>
                  <Text className="text-[14px] font-poppins font-normal text-white w-3/4">
                    {CustomerName}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {/* <View className="flex flex-row gap-3">
            <TouchableOpacity
              disabled={isLoading}
              onPress={postHandle}
              className="bg-white rounded-[5px] w-[60px] items-center justify-center h-[30px]"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#476480" />
              ) : (
                <Text className="text-black text-[9px] font-poppins font-bold ">
                  POST
                </Text>
              )}
            </TouchableOpacity>
          </View> */}
        </View>
        <View className="flex flex-row items-center bg-white mt-1 px-4 py-1 rounded-[15px] gap-3 justify-between w-full">
          <View className="flex-1 flex-row items-center gap-3 ">
            <FontAwesome5 name="search" size={24} color="#476480" />
            <TextInput
              ref={searchInputRef}
              placeholder={
                category === "receive" || category === "ship"
                  ? "Search item number"
                  : "Search Components Number"
              }
              className="bg-transparent h-[50px] w-full outline-none"
              style={{ borderWidth: 0 }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {!isHoneywellDevice && (
            <Link href="/scanner" asChild>
              <MaterialIcons name="qr-code-scanner" size={30} color="#476480" />
            </Link>
          )}
        </View>
      </Header>
      <OnlineStatus />
      <SearchName value={"Item No"} />
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="flex-1 px-[30px] py-[20px] gap-2"
          style={{ gap: window.height * 0.015 }}
        >
          {(documentNo || []).map((item: any, index: number) => (
            <ItemsCard
              key={index}
              item={item}
              category={category}
              componentId={id}
              no={no}
              lineNo={id}
            />
          ))}
          {mergeListData?.length === 0 && (
            <View className="flex-1 justify-center items-center">
              <Text className="text-center text-gray-500">No items found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ComponentsList;
