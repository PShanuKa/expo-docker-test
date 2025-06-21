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
import {
  setItemBarcode,
  setKeyboardVisible,
  setLotNumber,
  setReceiveData,
  setShipData,
} from "@/features/metaSlice";
import { Dimensions } from "react-native";
import { useDeviceCheck } from "@/hooks/useDeviceCheck";
import {
  useGetReceiveOrderListQuery,
  usePostReceiveItemMutation,
} from "@/services/receiveSlice";
import { usePostConsumptionItemMutation } from "@/services/consumptionSlice";
import {
  useGetShipOrderListQuery,
  usePostShipItemMutation,
} from "@/services/shipSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { setRecodeData } from "@/features/recodeSlice";
import SearchName from "@/components/common/SearchName";

const window = Dimensions.get("window");

const LineList = () => {
  const {
    no,
    vendor,
    poNumber,
    title,
    category,
    CustomerName,
    AppStatus,
    otherType,
    listData: listDataString,
  } = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [salesSearch, setSalesSearch] = useState("");
  const [size, setSize] = useState(10);
  const barcode = useSelector((state: RootState) => state.meta.barcode);
  const itemBarcode = useSelector((state: RootState) => state.meta.itemBarcode);
  const offlineData = useSelector(
    (state: RootState) => state.offline.offlineData
  );

  const list = JSON.parse((listDataString as string) || "[]");

  const [salesData, setSalesData] = useState({
    LotNo: "",
    ExpiryDate: "",
    Quantity: "",
  });

  const recode = useSelector((state: any) => state.recode.recodeData);
  const companyId = useSelector((state: RootState) => state.meta.companyApiKey);
  const environment = useSelector((state: RootState) => state.meta.environment);
  const tenantId = useSelector((state: RootState) => state.meta.tenantId);

  useEffect(() => {
    dispatch(setKeyboardVisible(false));
  }, []);


  // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const receiveData = useSelector((state: RootState) => state.meta.receiveData);
  const consumptionData = useSelector(
    (state: RootState) => state.meta.consumptionData
  );
  const shipData = useSelector((state: RootState) => state.meta.shipData);
  const outputData = useSelector((state: RootState) => state.meta.outputData);
  const params = useSelector((state: RootState) => state.meta.params);

  const { data: receiveDataApi, refetch: receiveRefetch } =
    useGetReceiveOrderListQuery(params, {
      skip: category !== "receive",
    });

  useEffect(() => {
    dispatch(setReceiveData(receiveDataApi?.value || []));
  }, [receiveDataApi]);

  const { data: shipDataApi, refetch: shipRefetch } = useGetShipOrderListQuery(
    params,
    {
      skip: category !== "ship",
    }
  );

  useEffect(() => {
    dispatch(setShipData(shipDataApi?.value || []));
  }, [shipDataApi]);

  const receiveLineData = receiveData?.find((info: any) => {
    return info?.No == no;
  });

  const consumptionLineData = consumptionData?.find((info: any) => {
    return info?.No == no;
  });
  const shipLineData = shipData?.find((info: any) => {
    return info?.No == no;
  });
  const outputLineData = outputData?.find((info: any) => {
    return info?.No == no;
  });

  const listData =
    category === "receive"
      ? receiveLineData?.warehouseReceiptlineList || []
      : category === "consumption"
        ? consumptionLineData?.prodOrderLineList || []
        : category === "ship"
          ? shipLineData?.saleLineList || []
          : category === "output"
            ? outputLineData?.prodOrderLineListOutput || []
            : [];




  // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // const QtyToShip = shipLineData?.saleLineList?.some(
  //   (line: any) => line.QtytoShip > 0
  // );

  // const recodeItem = recode?.find((info: any) => {
  //   return list?.find((line: any) => {
  //     if (category === "receive") {
  //       return line?.ItemNo === info?.ItemNo && info?.poNumber === poNumber;
  //     }
  //     if (category === "consumption") {
  //       return (
  //         info?.ProdOrderNo === line?.ProdOrderNo &&
  //         info?.ItemNo === line?.ItemNo
  //       );
  //     }
  //     return false;
  //   });
  // });

  const searchInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // const { data: referenceData } = useGetReferenceQuery({
  //   environment,
  //   companyId,
  //   tenantId,
  // });

  // const referenceFilter =
  //   referenceData?.value?.filter(
  //     (item: any) => item.ReferenceNo === searchQuery
  //   ) || [];




  const isHoneywellDevice = useDeviceCheck();

  useEffect(() => {
    if (barcode) {
      setSearchQuery(barcode);
    }
  }, [barcode]);

  useEffect(() => {
    if (itemBarcode) {
      setSearchQuery(itemBarcode);
    }
    dispatch(setItemBarcode(""));
  }, [itemBarcode]);

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
    if (category === "ship") {
      const qrPattern = /^[^%]+%[^%]+%[^%]+%[^%]+%[^%]+$/;

      if (qrPattern.test(searchQuery)) {
        const [itemNo, palletNo, lotNo, expiryDate, quantity] =
          searchQuery.split("%");

        const listDataFilter = listData?.filter((item: any) => {
          return item?.ItemNo?.toLowerCase() == itemNo?.toLowerCase();
        });

        console.log(listDataFilter);

        if (listDataFilter.length > 0) {
          setSalesSearch(searchQuery);
          setSearchQuery(itemNo);
        } else {
          Toast.show({
            type: "error",
            text1: "Item not found",
            // text2: "Item not found",
          });
          setSearchQuery("");
        }
      }
    }
  }, [searchQuery, category]);

  const documentNo = (mergeListData || []).map((item: any) => {
    if (category === "consumption") {
      const offlineItem = offlineData.find(
        (offline: any) => offline?.ItemNo === item?.ItemNo
      );
      if (offlineItem) {
        return { ...item, updatedQty: offlineItem?.Quantity };
      }
    } else {
      const offlineItem = offlineData.find(
        (offline: any) =>
          offline?.ItemNo === item?.ItemNo && offline?.category === category
      );
      if (offlineItem) {
        return { ...item, updatedQty: offlineItem?.Quantity };
      }
    }
    return item;
  });

  useEffect(() => {
    if (length === 1 && searchQuery.length > 0) {
      const item = mergeListData[0];
      router.push({
        pathname:
          otherType === "consumptionLine"
            ? "[category]/components"
            : "(root)/[category]/line/[id]",
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
          lineNo: item?.LineNo,
          salesSearch: salesSearch,
        },
      });
    }
  }, [length, searchQuery]);

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

  const [postReceiveItem, { isLoading: isLoadingPostReceive }] =
    usePostReceiveItemMutation();
  const [postConsumptionItem, { isLoading: isLoadingConsumptionPost }] =
    usePostConsumptionItemMutation();
  const [postShipItem, { isLoading: isLoadingShipPost }] =
    usePostShipItemMutation();

  const isLoading =
    isLoadingPostReceive || isLoadingConsumptionPost || isLoadingShipPost;

  const postHandle = async () => {
    const updateRecodeData = async (category: string) => {
      const storedRecodeData = await AsyncStorage.getItem("recodeData");
      const parsedRecodeData = storedRecodeData
        ? JSON.parse(storedRecodeData)
        : [];

      const updatedRecodeData = parsedRecodeData.filter(
        (item: any) =>
          !(item.poNumber === poNumber && item.category === category)
      );
      dispatch(setRecodeData(updatedRecodeData));

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Data posted successfully",
      });
    };
    try {
      if (category === "receive") {
        await postReceiveItem({
          OrderNumber: receiveLineData?.No || "",
          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
        })
          .unwrap()
          .then(() => {
            updateRecodeData(category);
            receiveRefetch();
          })
          .catch((error) => {
            console.error("Error in postReceiveItem:", error);
            Toast.show({
              type: "error",
              text1: "Error",
              text2: error?.data?.error?.message || "Something went wrong",
            });
            throw error;
          });
      }
      if (category === "ship") {
        await postShipItem({
          OrderNumber: shipLineData?.No || "",
          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
        })
          .then(() => {
            updateRecodeData(category);
            shipRefetch();
          })
          .catch((error) => {
            console.error("Error in postShipItem:", error);
            Toast.show({
              type: "error",
              text1: "Error",
              text2: error?.data?.error?.message || "Something went wrong",
            });
            throw error;
          });
      }
      if (category === "consumption") {
        await postConsumptionItem({
          OrderNumber: poNumber,
          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
        })
          .unwrap()
          .then(() => updateRecodeData(category))
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

  // const QtyReceivedTrue = list?.some((item: any) => {
  //   return item?.QtytoReceive > 0;
  // });

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
           {category==="receive" ? "Receipt" : category==="output" ? "Output Lines" : "Output Lines"}
          </Text>
          <View className="flex flex-row gap-2">
            <TouchableOpacity className="p-2 opacity-0">
              <MaterialIcons name="qr-code-scanner" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="mt-1 py-1 flex flex-row ">
          <View className="flex-1">
            <View className="flex flex-row gap-3">
              <View className="flex flex-row gap-2 justify-between">
                <Text className="text-[14px] font-poppins font-bold text-white">
                  {category === "receive" ? "Receipt No" : category === "consumption" ? "Prod. Order No" : "Order No"}
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
              {/* {category === "receive" && (
                <View className="flex flex-row gap-3">
                  <View className="flex flex-row gap-2 w-[100px] justify-between">
                  <Text className="text-[14px] font-poppins font-bold text-white">
                      Sender
                    </Text>
                    <Text className="text-[14px] font-poppins font-bold text-white">
                      :
                    </Text>
                  </View>
                  <Text className="text-[14px] font-poppins font-normal text-white w-3/4">
                    {receiveLineData?.BuyFromVendorName}
                  </Text>
                </View>
              )} */}
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
                    {shipLineData?.CustomerName}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View className="flex flex-row gap-3">
            {/* {(receiveLineData?.AppStatus === "InProcess" ||
              shipLineData?.AppStatus === "InProcess") && (
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
              )} */}
          </View>
        </View>
        <View className="flex flex-row items-center bg-white mt-1 px-4 py-1 rounded-[15px] gap-3 justify-between w-full">
          <View className="flex-1 flex-row items-center gap-3 ">
            <FontAwesome5 name="search" size={24} color="#476480" />
            <TextInput
              ref={searchInputRef}
              // placeholder="Search P.O Number Or Supplier"
              placeholder={
                category === "receive" || category === "ship"
                  ? "Search Item"
                  : category === "consumption"
                    ? "Search Item"
                    : "Search Item"
              }
              className="bg-transparent h-[50px] w-full outline-none"
              style={{ borderWidth: 0 }}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* {!isHoneywellDevice && (
            <Link href="/scanner" asChild>
              <MaterialIcons name="qr-code-scanner" size={30} color="#476480" />
            </Link>
          )} */}
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
          className="flex-1 px-[30px]  py-[20px] gap-1"
          // style={{ gap:  1 }}
        >
          {(documentNo || []).map((item: any, index: number) => (
            <ItemsCard
              key={index}
              item={item}
              no={no}
              category={category}
              AppStatus={
                receiveLineData?.AppStatus || shipLineData?.AppStatus || ""
              }
            />
          ))}
          {
            // isFetching ? (
            //   <View className="flex-1 justify-center items-center">
            //     <ActivityIndicator size="large" color="#476480" />
            //   </View>
            // ) : (
            mergeListData?.length === 0 && (
              <View className="flex-1 justify-center items-center">
                <Text className="text-center text-gray-500">
                  No items found
                </Text>
              </View>
            )
            // )
          }
        </View>
      </ScrollView>
    </View>
  );
};

export default LineList;
