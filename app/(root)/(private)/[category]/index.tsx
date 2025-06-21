import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, Link, useRouter } from "expo-router";
import Header from "@/components/common/Header";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import SubCategoryCard from "@/components/common/SubCategoryCard";
import { useGetReceiveOrderListQuery } from "@/services/receiveSlice";
import { useGetShipOrderListQuery } from "@/services/shipSlice";
import { useGetConsumptionOrderListQuery } from "@/services/consumptionSlice";
import { useGetOutputOrderListQuery } from "@/services/outputSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import OnlineStatus from "@/components/common/onlineStatus";
import {
  setConsumptionData,
  setItemBarcode,
  setKeyboardVisible,
  setLotNumber,
  setOutputData,
  setParams,
  setProductionPickData,
  setReceiveData,
  setShipData,
} from "@/features/metaSlice";

import { useDeviceCheck } from "@/hooks/useDeviceCheck";
import SearchName from "@/components/common/SearchName";
import { useGetProductionPickListQuery } from "@/services/productionPickSlice";

const window = Dimensions.get("window");



const Category = () => {
  const { category } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const barcode = useSelector((state: RootState) => state.meta.barcode);
  const [searchQuery, setSearchQuery] = useState("");
  const [size, setSize] = useState(50);

  const isHoneywellDevice = useDeviceCheck();

  useEffect(() => {
    if (barcode) {
      setSearchQuery(barcode);
    }
  }, [barcode]);

  useEffect(() => {
    dispatch(setKeyboardVisible(false));
  }, []);

  useEffect(() => {
    if (searchQuery) {
      if (searchQuery.includes("%")) {
        setSearchQuery(searchQuery.split("%")[0]);
        dispatch(setItemBarcode(searchQuery.split("%")[1]));
      }
    }
  }, [searchQuery]);

  const dispatch = useDispatch();

  const environment = useSelector((state: RootState) => state.meta.environment);
  const companyId = useSelector((state: RootState) => state.meta.companyApiKey);
  const tenantId = useSelector((state: RootState) => state.meta.tenantId);

  useEffect(() => {
    dispatch(setLotNumber(""));
  }, []);

  //  Set params ---------------------

  const params = {
    searchQuery: searchQuery,
    top: size,
    environment: environment,
    companyId: companyId,
    tenantId: tenantId,
  };

  useEffect(() => {
    dispatch(setParams(params));
  }, [params]);

  //  Set ship data ---------------------
  const {
    data: shipData,
    isLoading: shipLoading,
    isFetching: shipFetching,
  } = useGetShipOrderListQuery(params, {
    skip: category !== "ship",
  });

  useEffect(() => {
    dispatch(setShipData(shipData?.value || []));
  }, [shipData]);

  //  Set production pick data ---------------------
  const {
    data: productionPickData,
    isLoading: productionPickLoading,
    isFetching: productionPickFetching,
  } = useGetProductionPickListQuery(params, {
    skip: category !== "production-pick",
  });

  useEffect(() => {
    dispatch(setProductionPickData(productionPickData?.value || []));
  }, [productionPickData]);

  //  Set receive data ---------------------
  const {
    data: receiveData,
    isLoading: receiveLoading,
    isFetching: receiveFetching,
  } = useGetReceiveOrderListQuery(params, {
    skip: category !== "receive",
  });

  useEffect(() => {
    dispatch(setReceiveData(receiveData?.value || []));
  }, [receiveData]);

  //  Set consumption data ---------------------
  const {
    data: consumptionData,
    isLoading: consumptionLoading,
    isFetching: consumptionFetching,
  } = useGetConsumptionOrderListQuery(params, {
    skip: category !== "consumption",
  });

  useEffect(() => {
    dispatch(setConsumptionData(consumptionData?.value || []));
  }, [consumptionData]);

  //  Set output data ---------------------
  const {
    data: outputData,
    isLoading: outputLoading,
    isFetching: outputFetching,
  } = useGetOutputOrderListQuery(params, {
    skip: category !== "output",
  });

  useEffect(() => {
    dispatch(setOutputData(outputData?.value || []));
  }, [outputData]);

  //  Get data from API
  const getData = () => {
    switch (category) {
      case "ship":
        return shipData?.value || [];
      case "receive":
        return receiveData?.value || [];
      case "consumption":
        return consumptionData?.value || [];
      case "output":
        return outputData?.value || [];
      case "production-pick":
        return productionPickData?.value || [];
      default:
        return [];
    }
  };

  //  Check if data is loading
  const isLoading =
    shipLoading ||
    receiveLoading ||
    consumptionLoading ||
    outputLoading ||
    productionPickLoading;
  const isFetching =
    shipFetching ||
    receiveFetching ||
    consumptionFetching ||
    outputFetching ||
    productionPickFetching;

  //  Get data from API
  const listData = getData();

  //  Filter data based on search query
  const filteredData = listData?.filter((item: any) => {
    const query = searchQuery?.toLowerCase();
    return (
      item?.No?.toLowerCase()?.includes(query) ||
      item?.SourceNo?.toLowerCase()?.includes(query)
    );
  });

  //  Handle scroll to load more data
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    if (isNearBottom && !isLoading && listData?.length >= size) {
      setSize((prevSize) => prevSize + 30);
    }
  };

  //  Auto navigate to line page when there is only one item in the list
  useEffect(() => {
    if (
      filteredData?.length === 1 &&
      filteredData[0]?.No &&
      searchQuery !== "" &&
      !isFetching
    ) {
      setTimeout(() => {
        router.navigate({
          pathname:
            category === "production-pick"
              ? `/(root)/${category}/line/id`
              : category === "ship"
              ? `/(root)/${category}/line/id`
              : `/(root)/${category}/line`,
          params: {
            title:
              category === "receive"
                ? "Purchase Lines"
                : category === "ship"
                ? "Sales Order Lines"
                : category === "consumption"
                ? "Prod. Order Lines"
                : category === "output"
                ? "Output Lines"
                : "",
            no: filteredData[0]?.No,
            category: category,
            otherType: category === "consumption" ? "consumptionLine" : "",
          },
        });
      }, 100);
    }
  }, [filteredData]);

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
            {category === "receive"
              ? "Receipt List"
              : category === "production-pick"
              ? "Pick List"
              : category === "consumption"
              ? "Production Order List"
              : category === "output"
              ? "Production Order List"
              : category === "ship"
              ? "Pick List"
              : ""}
          </Text>
          <View className="flex flex-row gap-2">
            <TouchableOpacity className="p-2 opacity-0">
              <MaterialIcons name="qr-code-scanner" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex flex-row items-center bg-white mt-2 px-4 py-1 rounded-[15px] gap-3 justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            <FontAwesome5 name="search" size={24} color="#476480" />
            <TextInput
              autoFocus={true}
              placeholder={
                category === "consumption" || category === "output"
                  ? "Search Doc.No"
                  : category === "ship"
                  ? "Search Doc.No"
                  : "Search Doc.No"
              }
              className=" h-[50px] w-full outline-none bg-transparent"
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
      {/* <OnlineStatus /> */}

      <SearchName value={"Doc. No"} />
      <ScrollView
        scrollEventThrottle={16}
        onScroll={handleScroll}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="flex-1 px-[30px] py-[15px] "
          style={{ gap: window.height * 0.02 }}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#476480" />
          ) : filteredData?.length > 0 ? (
            filteredData?.map((item: any, index: number) => (
              <SubCategoryCard key={index} item={item} category={category} />
            ))
          ) : (
            <Text className="text-center text-gray-500">No items found</Text>
          )}
          {isFetching && !isLoading && (
            <ActivityIndicator size="large" color="#476480" />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Category;
