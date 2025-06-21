import {
  View,
  Text,
  TouchableOpacity,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  useGetReceiveLineListQuery,
  usePostReceiveItemMutation,
} from "@/services/receiveSlice";
import {
  useGetConsumptionLineListQuery,
  usePostConsumptionItemMutation,
} from "@/services/consumptionSlice";
import {
  useGetShipLineListQuery,
  usePostShipItemMutation,
} from "@/services/shipSlice";
import { useFetchLineList } from "@/hooks/useFetchLineList";
import { useDispatch, useSelector } from "react-redux";
import { setBarcode } from "@/features/metaSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { setRecodeData } from "@/features/recodeSlice";
import { RootState } from "@/store";

export default function SubCategoryCard({ item, category }: any) {
  const params = {
    documentNo: item.No,
  };
  const hasQtyToShip = item?.saleLineList?.some(
    (line: any) => line.QtytoShip > 0
  );

  const dispatch = useDispatch();

  const lineList =
    category === "ship"
      ? item?.saleLineList
      : category === "receive"
      ? item?.purchLineList
      : category === "consumption"
      ? item?.prodOrderLineList
      : category === "output"
      ? item?.prodOrderLineListOutput
      : item?.prodOrderLine;

  const recQtyList = lineList?.some((line: any) => line?.QtytoReceive > 0);

  const recode = useSelector((state: any) => state.recode.recodeData);

  const recodeItem = recode?.find((info: any) => {
    return lineList?.find((line: any) => {
      if (category === "receive") {
        return line?.ItemNo === info?.ItemNo && info?.poNumber === item?.No;
      }
      if (category === "consumption") {
        return (
          info?.ProdOrderNo === line?.ProdOrderNo &&
          line?.prodOrderComponent?.some(
            (component: any) => component?.ItemNo === info?.ItemNo
          )
        );
      }
      return false;
    });
  });

  const [postReceiveItem, { isLoading: isLoadingPostReceive }] =
    usePostReceiveItemMutation();
  const [postConsumptionItem, { isLoading: isLoadingConsumptionPost }] =
    usePostConsumptionItemMutation();
  const [postShipItem, { isLoading: isLoadingShipPost }] =
    usePostShipItemMutation();

  const isLoading =
    isLoadingPostReceive || isLoadingConsumptionPost || isLoadingShipPost;

  const companyId = useSelector((state: RootState) => state.meta.companyApiKey);
  const environment = useSelector((state: RootState) => state.meta.environment);
  const tenantId = useSelector((state: RootState) => state.meta.tenantId);

  const postHandle = async () => {
    if (category === "receive") {
      await postReceiveItem({
        OrderNumber: item.No,
        companyId: companyId,
        environment: environment,
        tenantId: tenantId,
      })
        .unwrap()
        .then(async () => {
          const storedRecodeData = await AsyncStorage.getItem("recodeData");
          const parsedRecodeData = storedRecodeData
            ? JSON.parse(storedRecodeData)
            : [];

          const updatedRecodeData = parsedRecodeData.filter((data: any) => {
            return !(data.poNumber == item.No && data.category == category);
          });

          dispatch(setRecodeData(updatedRecodeData));
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Data posted successfully",
          });
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
        OrderNumber: item.No,
        companyId: companyId,
        environment: environment,
        tenantId: tenantId,
      })
        .then(async () => {
          const storedRecodeData = await AsyncStorage.getItem("recodeData");
          const parsedRecodeData = storedRecodeData
            ? JSON.parse(storedRecodeData)
            : [];

          const updatedRecodeData = parsedRecodeData.filter((data: any) => {
            return !(data.poNumber == item.No && data.category == category);
          });

          dispatch(setRecodeData(updatedRecodeData));
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Data posted successfully",
          });
        })
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
    if (category === "consumption") {
      await postConsumptionItem({
        OrderNumber: item.No,
        companyId: companyId,
        environment: environment,
        tenantId: tenantId,
      })
        .unwrap()
        .then(async () => {
          const storedRecodeData = await AsyncStorage.getItem("recodeData");
          const parsedRecodeData = storedRecodeData
            ? JSON.parse(storedRecodeData)
            : [];

          const updatedRecodeData = parsedRecodeData.filter((data: any) => {
            return !(data.poNumber == item.No && data.category == category);
          });

          dispatch(setRecodeData(updatedRecodeData));
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Data posted successfully",
          });
        })
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
  };

  return (
    <Link
      href={{
        pathname:
          category == "production-pick"
            ? "/(root)/production-pick/line/id"
            : category == "ship"
            ? "/(root)/ship/line/id"
            : "/(root)/[category]/line",
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
          no: item?.No,
          category: category,
          otherType: category === "consumption" ? "consumptionLine" : "",
        },
      }}
      asChild
    >
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          dispatch(setBarcode(""));
        }}
      >
        <View
          style={{ marginVertical: -5 }}
          className="flex bg-white flex-row   items-center py-1 px-2 rounded-[6px] overflow-hidden border border-primary shadow-none w-full "
        >
          <View className="flex-1">
            <Text className="text-[14px] font-poppins font-medium">
              {category === "receive"
                ? `${item?.No} ${
                    item?.BuyFromVendoName && `(${item?.BuyFromVendoName})`
                  }`
                : category === "consumption"
                ? `${item?.No}`
                : category === "output"
                ? `${item?.No}`
                : category === "production-pick"
                ? `${item?.No}`
                : category === "ship"
                ? `${item?.No}`
                : ""}
              {category === "ship" && item?.SourceNo && (
                <Text className="text-[10px] font-poppins font-normal mt-0 text-[#4F4F4F]">
                  {" "}
                  {`(S.NO: ${item?.SourceNo})`}
                </Text>
              )}
              
            </Text>
            <Text className="text-[10px] font-poppins font-normal mt-0 text-[#4F4F4F]">
              {category === "receive"
                ? `Source No: ${item?.SourceNo || "-"}`
                : category === "consumption"
                ? `${item?.Description}`
                : category === "output"
                ? `${item?.Description}`
                : category === "production-pick"
                ? `Source No: ${item?.SourceNo || "-"} | ${item?.Description}`
                : category === "ship"
                ? `${item?.Description}`
                : ""}

              {/* {category === "ship"
                ? "Doc. No : WR-00001 / No : PO-0001 / Line : 01"
                : category === "receive"
                  ? "Doc. No : WR-00001 / No : PO-0001 / Line : 01"
                  : "Doc. No : WR-00001 / No : PO-0001 / Line : 01"}{" "}
              {item.No || "-"} */}
            </Text>
          </View>
          <View className="flex flex-row gap-1 items-center">
            {/* {item?.AppStatus == "InProcess" ? (
              <TouchableOpacity
                disabled={isLoading}
                onPress={(e) => {
                  e.preventDefault();
                  postHandle();
                  Alert.alert(
                    "Confirm Action",
                    "Are you sure you want to proceed?",
                    [
                      {
                        text: "Cancel",
                        onPress: () => console.log("Action canceled"),
                        style: "cancel",
                      },
                      {
                        text: "Yes",
                        onPress: async () => {
                          await postHandle();
                        },
                      },
                    ],
                    { cancelable: false }
                  );
                }}
                className="bg-primary rounded-[5px] w-[60px] items-center justify-center h-[30px] mr-5"
              >
                <Text className="text-white text-[9px] font-poppins font-bold ">
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    "POST"
                  )}
                </Text>
              </TouchableOpacity>
            ) : null} */}
            <View className="flex flex-row gap-1 items-center">
              <Text className="text-[11px] font-poppins font-medium">
                {category === "receive"
                  ? `No. of Lines :  ${item?.NoofLines || ""}`
                  : category === "production-pick"
                  ? `No. of Lines :  ${item?.NoofLines || ""}`
                  : category === "ship"
                  ? `No. of Lines :  ${item?.NoOfLines || ""}`
                  : ""}
              </Text>
            </View>

            <AntDesign name="right" size={15} color="#3674AD" />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
