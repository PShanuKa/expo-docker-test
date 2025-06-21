import { View, Text, TouchableOpacity } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";

export default function ItemsCard({
  item,
  AppStatus,
  no,
  componentId,
  lineId,
}: any) {
  const { category, poNumber, Data, otherType } = useLocalSearchParams<{
    category: string;
    poNumber: string;
    Data: string;
    otherType: string;
  }>();

  return (
    <Link
      href={{
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
          lineId: componentId,
          lineNo: category === "consumption" ?  item?.ProdOrderLineNo :  item?.LineNo,
          componentLineNo: item?.LineNo 
        },
      }}
      asChild
      className=""
    >
      <TouchableOpacity activeOpacity={0.5} >
        <View className="flex bg-white flex-row gap-4  items-center py-[0.125rem] px-2 rounded-[6px] overflow-hidden border border-primary shadow-none w-full">
          <View className="flex-1">
            <Text className="text-[14px] font-poppins font-bold mt-0 text-primary">
              # {item?.ItemNo}
            </Text>
            <Text className="text-[11px] font-poppins font-medium">
              {item?.Description}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <View className="text-[13px] font-poppins font-bold mt-0 txt-black ">
              {category === "receive" && (
                <View className="flex   items-end">
                  
                  <Text className="text-[11px] font-poppins mt-0 txt-black ">
                    {item?.QtytoReceive ?
                      ` Qt.T.Rec: ${item?.QtytoReceive}`
                    : ""}
                   
                    {(item?.QtytoReceive &&
                      item?.QtyOutstanding) ?
                      ` / ` : ""}

                    {item?.QtyOutstanding ? `Out.Q: ${item?.QtyOutstanding}`: ""}
                  </Text>

                  <Text className="text-[11px] font-poppins mt-0 txt-black ">
           {/* ({item?.UnitofMeasure || "pcs"}) */}
                    Qty. Recevd: {item?.QtyReceived || 0}
                    
                  </Text>

                  {/* {item?.QtytoReceive} / {item?.Quantity || 0}{" "}
                  {item?.UnitofMeasure || "pcs"} */}
                </View>
              )}

              {category === "consumption" && (
                <>
                  {otherType === "consumptionLine"
                    ? item?.Quantity
                    : item?.RemainingQuantity}{" "}
                  {item?.UnitofMeasureCode || "pcs"}
                </>
              )}
              {category === "output" && (
                <>
                  {item?.RemainingQty || 0} {item?.UnitofMeasureCode || "pcs"}
                </>
              )}
              {category === "ship" && (
                <>
                  {item?.OutstandingQuantity} / {item?.Quantity || 0}{" "}
                  {item?.UnitofMeasureCode || "pcs"}
                </>
              )}
            </View>
            {/* {item?.updatedQty > 0 && (
              <Text className="text-[13px] font-poppins  mt-0 text-red-400 items-center justify-center text-end ">
                {item?.updatedQty} pending
              </Text>
            )}

            {AppStatus == "InProcess" && item?.QtytoReceive > 0 && (
              <Text className="text-[13px] font-poppins  mt-0 text-red-400 items-center justify-center text-end ">
                Qty To Receive {item?.QtytoReceive}
              </Text>
            )}

            {AppStatus == "InProcess" && item?.QtytoShip > 0 && (
              <Text className="text-[13px] font-poppins  mt-0 text-red-400 items-center justify-center text-end ">
                Qty To Ship {item?.QtytoShip}
              </Text>
            )}

            {item?.RecordedQuantity > 0 && (
              <Text className="text-[13px] font-poppins  mt-0 text-red-400 items-center justify-center text-end ">
                Recorded Qty {item?.RecordedQuantity}{" "}
                {item?.UnitofMeasureCode || "pcs"}
              </Text>
            )} */}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
