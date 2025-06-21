import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Header from "@/components/common/Header";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import { Dropdown } from "react-native-element-dropdown";

import { useEffect, useRef, useState } from "react";
import {
  useCreateReceiveTrackingMutation,
  useGetReceiveOrderListQuery,
  usePostReceiveItemMutation,
} from "@/services/receiveSlice";
import {
  useCreateOutputTrackingMutation,
  useGetOutputOrderListQuery,
  useOutputItemMutation,
} from "@/services/outputSlice";
import {
  useCreateConsumptionTrackingMutation,
  useGetConsumptionLotValidationQuery,
  useGetConsumptionOrderListQuery,
  useGetExpireDateQuery,
  usePostConsumptionItemMutation,
} from "@/services/consumptionSlice";
import {
  useCreateShipTrackingMutation,
  useGetShipOrderListQuery,
  usePostShipItemMutation,
} from "@/services/shipSlice";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { setOfflineData } from "@/features/offlineSlice";
import { setKeyboardVisible as setKeyboardVisibleAction } from "@/features/metaSlice";

import * as Yup from "yup";
import OnlineStatus from "@/components/common/onlineStatus";
import Toast from "react-native-toast-message";
import { useDeviceCheck } from "@/hooks/useDeviceCheck";
import { setRecodeData } from "@/features/recodeSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setConsumptionData,
  setOutputData,
  setProductionPickData,
  setReceiveData,
  setShipData,
} from "@/features/metaSlice";
import DoneIcon from "./../../../../../../assets/images/Done.png";

import SearchName from "@/components/common/SearchName";
import { StyleSheet } from "react-native";
import {
  useCreateProductionPickTrackingMutation,
  useGetProductionPickListQuery,
  usePostProductionPickMutation,
} from "@/services/productionPickSlice";
const window = Dimensions.get("window");

const Item = () => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions(); // <- moved here
  const isWebLayout = width >= 768;

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    dispatch(setKeyboardVisibleAction(keyboardVisible));
  }, [keyboardVisible]);

  const { category, id, no, lineNo, length, salesSearch, componentLineNo } =
    useLocalSearchParams();

  const [formData, setFormData] = useState<any>({
    Quantity: 0,
    ExpiryDate: "",
    ItemNo: "",
    PalletNo: "",
    LotNo: "",
  });

  const [formError, setFormError] = useState("");

  const [error, setError] = useState({
    ExpiryDate: "",
    LotNo: "",
    PalletNo: "",
    Quantity: "",
  });
  const textInputRef = useRef<TextInput>(null);
  const [formIndex, setFormIndex] = useState(0);
  const [qtyValidation, setQtyValidation] = useState(false);
  const [anyTracking, setAnyTracking] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [lineResponse, setLineResponse] = useState("");
  const [items, setItems] = useState([
    { label: "Canceled", value: "Canceled" },
    { label: "Hold", value: "Hold" },
    { label: "Completed", value: "Post" },
  ]);
  const [drowdownLoading, setDrowdownLoading] = useState(false);

  useEffect(() => {
    if (value) {
      setDrowdownLoading(true);
      setTimeout(() => {
        setValue("");
        setDrowdownLoading(false);
      }, 1500);
    }
  }, [value]);

  const [lineIndex, setLineIndex] = useState(0);

  const [formArray, setFormArray] = useState([]);

  const lotNumber = useSelector((state: RootState) => state.meta.lotNumber);
  const environment = useSelector((state: RootState) => state.meta.environment);
  const companyId = useSelector((state: RootState) => state.meta.companyApiKey);
  const tenantId = useSelector((state: RootState) => state.meta.tenantId);

  // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  const receiveData = useSelector((state: RootState) => state.meta.receiveData);
  const consumptionData = useSelector(
    (state: RootState) => state.meta.consumptionData
  );
  const shipData = useSelector((state: RootState) => state.meta.shipData);
  const outputData = useSelector((state: RootState) => state.meta.outputData);
  const productionPickData = useSelector(
    (state: RootState) => state.meta.productionPickData
  );
  const params = useSelector((state: RootState) => state.meta.params);

  const receiveLineData = receiveData?.find((info: any) => {
    return info?.No == no;
  });

  const receiveLineDataItem =
    receiveLineData?.warehouseReceiptlineList?.[lineIndex || 0];

  useEffect(() => {
    if (lineNo && category == "receive") {
      const index = receiveLineData?.warehouseReceiptlineList.findIndex(
        (info: any) => {
          return info?.LineNo == lineNo;
        }
      );
      setLineIndex(index);
    }
  }, [lineNo]);

  const { data: receiveRefetch, refetch: receiveRef } =
    useGetReceiveOrderListQuery(params, {
      skip: category !== "receive",
    });

  const { data: consumeRefetch, refetch: consumeRef } =
    useGetConsumptionOrderListQuery(params, {
      skip: category !== "consumption",
    });

  const { data: productionPickRefetch, refetch: productionPickRef } =
    useGetProductionPickListQuery(params, {
      skip: category !== "production-pick",
    });

  const { data: outputRefetch, refetch: outputRef } =
    useGetOutputOrderListQuery(params, {
      skip: category !== "output",
    });

  useEffect(() => {
    dispatch(setOutputData(outputRefetch?.value || []));
  }, [outputRefetch]);

  const { data: shipRefetch, refetch: shipRef } = useGetShipOrderListQuery(
    params,
    {
      skip: category !== "ship",
    }
  );

  useEffect(() => {
    dispatch(setShipData(shipRefetch?.value || []));
  }, [shipRefetch]);

  useEffect(() => {
    dispatch(setConsumptionData(consumeRefetch?.value || []));
  }, [consumeRefetch]);

  useEffect(() => {
    dispatch(setReceiveData(receiveRefetch?.value || []));
  }, [receiveRefetch]);

  useEffect(() => {
    dispatch(setProductionPickData(productionPickRefetch?.value || []));
  }, [productionPickRefetch]);

  const consumptionOrderData = consumptionData?.find((info: any) => {
    return info?.No == no;
  });

  const consumptionOrderLineData =
    consumptionOrderData?.prodOrderLineList?.find((info: any) => {
      return info?.LineNo == lineNo;
    });

  const consumptionOrderLineDataComponent =
    consumptionOrderLineData?.prodOrderComponent || [];

  const consumptionOrderLineDataComponentItem =
    consumptionOrderLineDataComponent[lineIndex || 0] || {};

  useEffect(() => {
    if (componentLineNo && category == "consumption") {
      const index = consumptionOrderLineDataComponent.findIndex((info: any) => {
        return info?.LineNo == componentLineNo;
      });
      setLineIndex(index);
    }
  }, [componentLineNo]);

  const outputOrderData = outputData?.find((info: any) => {
    return info?.No == no;
  });

  const outputLineData = outputOrderData?.prodOrderLineListOutput || [];

  const outputLineDataItem = outputLineData[lineIndex || 0];

  const productionPickLineData = productionPickData?.find((info: any) => {
    return info?.No == no;
  });

  const productionPickLineDataItem =
    productionPickLineData?.productionPickLineList?.[lineIndex || 0];

  const shipOrderData = shipData?.find((info: any) => {
    return info?.No == no;
  });

  const shipLineDataItem = shipOrderData?.salesPickLineList?.[lineIndex || 0];

  const listLength =
    consumptionOrderLineDataComponent?.length ||
    outputLineData?.length ||
    receiveLineData?.warehouseReceiptlineList?.length ||
    productionPickLineData?.productionPickLineList?.length ||
    shipOrderData?.salesPickLineList?.length ||
    0;

  const { data: consumptionLotValidation } =
    useGetConsumptionLotValidationQuery(
      {
        no: consumptionOrderLineDataComponentItem.ProdOrderNo,
        lineNo: consumptionOrderLineDataComponentItem.LineNo,
        prodOrderLineNo: consumptionOrderLineDataComponentItem.ProdOrderLineNo,
        environment: environment,
        companyId: companyId,
        tenantId: tenantId,
      },
      {
        skip:
          category !== "consumption" &&
          !consumptionOrderLineDataComponentItem?.ProdOrderNo &&
          !consumptionOrderLineDataComponentItem?.ProdOrderLineNo &&
          !consumptionOrderLineDataComponentItem?.LineNo,
      }
    );

  const { data: expireDate } = useGetExpireDateQuery(
    {
      environment,
      companyId: companyId,
      tenantId: tenantId,

      ItemNo:
        category === "production-pick"
          ? productionPickLineDataItem?.ItemNo || undefined
          : category === "consumption"
          ? consumptionOrderLineDataComponentItem?.ItemNo || undefined
          : String(id),
      LotNo: formData.LotNo || undefined,
    },
    {
      skip:
        !["production-pick", "consumption"].includes(category as string) ||
        !formData.LotNo,
      // || !changeLotNo,
    }
  );

  useEffect(() => {
    if (category === "receive") {
      if (receiveLineDataItem?.LotSpecificTracking === true) {
        if (receiveLineData?.BinEnable) {
          setFormArray(["Bin", "LotNo", "ExpiryDate", "Quantity"]);
        } else {
          setFormArray(["LotNo", "ExpiryDate", "Quantity"]);
        }
      } else {
        if (receiveLineData?.BinEnable) {
          setFormArray(["Bin", "Quantity"]);
        } else {
          setFormArray(["Quantity"]);
        }
      }
    }

    if (category === "production-pick") {
      if (productionPickLineDataItem?.LotSpecificTracking === true) {
        setFormArray(["Bin", "ItemNo", "LotNo", "Quantity"]);
      } else {
        setFormArray(["Bin", "Quantity"]);
      }
    }

    if (category === "consumption") {
      if (consumptionOrderLineDataComponentItem?.LotSpecificTracking === true) {
        setFormArray(["LotNo", "Quantity"]);
      } else {
        setFormArray(["Quantity"]);
      }
    }

    if (category === "output") {
      if (outputLineDataItem?.LotSpecificTracking === true) {
        setFormArray(["Bin", "PalletNo", "LotNo", "ExpiryDate", "Quantity"]);
      } else {
        setFormArray(["Bin", "Quantity"]);
      }
    }

    if (category === "ship") {
      if (shipLineDataItem?.LotSpecificTracking === true) {
        setFormArray([
          "Bin",
          "PalletNo",
          "ItemNo",
          "LotNo",
          "ExpiryDate",
          "Quantity",
        ]);
      } else {
        setFormArray(["Bin", "Quantity"]);
      }
    }
  }, [category, lineIndex]);

  useEffect(() => {
    if (expireDate?.ExpiryDate) {
      setFormData({
        ...formData,
        ExpiryDate: expireDate?.ExpiryDate,
        // Quantity: expireDate?.RemainingQty || 0,
      });
    }
  }, [expireDate]);

  const handleClear = () => {
    setFormData({
      ...formData,
      ExpiryDate: "",
      LotNo: "",
      Bin: "",
      Quantity: 0,
      ItemNo: "",
      PalletNo: "",
    });
    setFormIndex(0);
  };

  // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (lotNumber) {
      setFormData({ ...formData, LotNo: lotNumber });
    }
  }, [lotNumber]);

  const [createReceiveTracking, { isLoading: isLoadingReceive }] =
    useCreateReceiveTrackingMutation();
  const [createOutputTracking, { isLoading: isLoadingOutput }] =
    useCreateOutputTrackingMutation();
  const [createConsumptionTracking, { isLoading: isLoadingConsumption }] =
    useCreateConsumptionTrackingMutation();
  const [createShipTracking, { isLoading: isLoadingShip }] =
    useCreateShipTrackingMutation();

  const [outputPost] = useOutputItemMutation();
  const [receivePost] = usePostReceiveItemMutation();
  const [consumptionPost] = usePostConsumptionItemMutation();
  const [shipPost] = usePostShipItemMutation();
  const [productionPickPost] = usePostProductionPickMutation();

  const [createProductionPickTracking, { isLoading: isLoadingProductionPick }] =
    useCreateProductionPickTrackingMutation();

  const isLoading =
    isLoadingReceive ||
    isLoadingOutput ||
    isLoadingConsumption ||
    isLoadingShip ||
    isLoadingProductionPick;

  const outStandingQuantity =
    receiveLineDataItem?.QtyOutstanding ||
    productionPickLineDataItem?.QtyOutstanding ||
    shipLineDataItem?.QtyOutstanding ||
    consumptionOrderLineDataComponentItem?.RemainingQuantity ||
    outputLineDataItem?.RemainingQty ||
    0;

  const handleSubmit = async (type: string) => {
    setQtyValidation(false);

    if (type !== "split") {
      setLineResponse("");
    }

    if (error.Quantity) {
      return;
    }

    try {
      if (category === "receive") {
        const {
          ItemNo,
          PalletNo,
          LotNo,
          QuantityReceived,
          documentType,
          IId,
          Quantity,
          ExpiryDate,
          Bin,
          ...rest
        } = formData;
        await createReceiveTracking({
          DocumentNo: (receiveLineData?.No as string) || no,
          LineNo: (receiveLineDataItem?.LineNo as string) || lineNo,
          documentType: String(3),
          Quantity: Number(Quantity) || undefined,
          LotNo: LotNo || undefined,
          BinCode: Bin || undefined,
          ExpiryDate: ExpiryDate || undefined,
          environment: environment,
          companyId: companyId,
          DocumentStatus: value || undefined,
          tenantId: tenantId,
        })
          .unwrap()
          .then(async (res) => {
            setAnyTracking(true);
            receiveRef();
            setFormIndex(0);
            if (value === "complate") {
              await receivePost({
                OrderNumber: no,
                AppStatus: "Post",
                environment: environment,
                companyId: companyId,
                tenantId: tenantId,
              })
                .then(async (res) => {
                  Toast.show({
                    type: "success",
                    text1: res?.data?.AppStatus || "Posted",
                  });
                })
                .catch((error) => {
                  Toast.show({
                    type: "error",
                    text1: error.data.message || "Error in Receive Post",
                  });
                  return;
                });
            }
          })
          .catch((error) => {
            console.error("Error in createReceiveTracking:", error);
            throw error;
            // return;
          });
      }

      if (category === "production-pick") {
        const {
          Quantity,
          IId,
          ExpiryDate,
          LotNo,
          lineNo,
          Bin,
          ItemNo,
          ...rest
        } = formData;

        await createProductionPickTracking({
          // ...rest,
          DocumentNo: (productionPickLineData?.No as string) || no,
          LineNo:
            lineResponse ||
            (productionPickLineDataItem?.LineNo as string) ||
            lineNo,
          documentType: String(4),

          Quantity: Number(Quantity) || undefined,
          Bin: Bin || undefined,
          // lineNo: lineResponse || lineNo || undefined,
          ItemNo: ItemNo || undefined,
          ExpiryDate: ExpiryDate || undefined,
          LotNo: LotNo || undefined,
          WhsePickLinMethod: type === "split" ? "1" : "0",

          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
          DocumentStatus: value || undefined,
        })
          .then(async (res) => {
            setAnyTracking(true);

            if (type === "split") {
              setFormIndex(0);
              // setLineResponse(String(res?.SplitLineNo || ""));
            }

            if (value === "complate") {
              await productionPickPost({
                OrderNumber: no,
                AppStatus: "Post",
                environment: environment,
                companyId: companyId,
                tenantId: tenantId,
              })
                .then(async (res) => {
                  Toast.show({
                    type: "success",
                    text1: res?.data?.AppStatus || "Posted",
                  });
                })
                .catch((error) => {
                  Toast.show({
                    type: "error",
                    text1: error.data.message || "Error in productionPickPost",
                  });
                });
            }
            productionPickRef();
          })
          .catch((error) => {
            console.error("Error in createProductionPickTracking:", error);
            throw error;
          });
      }

      if (category === "consumption") {
        const {
          QuantityReceived,
          documentType,
          Quantity,
          ProdOrderNo,
          ProdOrderLineNo,
          ItemNo,
          PalletNo,
          CompLineNo,
          lineNo,
          IId,
          ExpiryDate,
          LotNo,
          ...rest
        } = formData;
        await createConsumptionTracking({
          // ...rest,
          CompLineNo:
            consumptionOrderLineDataComponentItem?.LineNo || undefined,
          DocumentStatus: value || undefined,
          OrderNo: no,
          BinCode: consumptionOrderLineDataComponentItem.BinCode || undefined,
          LotNo: LotNo || undefined,
          lineNo: consumptionOrderLineData?.LineNo,
          ExpiryDate: ExpiryDate || undefined,
          Quantity: Number(Quantity) || undefined,
          // WhsePickLinMethod: type === "split" ? "1" : "0",

          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
        })
          .unwrap()
          .then(async () => {
            consumeRef();
            setAnyTracking(true);
            if (value === "complate") {
              console.log(value);
              await consumptionPost({
                OrderNumber: no,
                AppStatus: "Post",
                environment: environment,
                companyId: companyId,
                tenantId: tenantId,
              })
                .then(async (res) => {
                  Toast.show({
                    type: "success",
                    text1: res?.data?.AppStatus || "Posted",
                  });
                })
                .catch((error) => {
                  Toast.show({
                    type: "error",
                    text1: error.data.message || "Error in consumptionPost",
                  });
                });
            }
          })
          .catch((error) => {
            console.error("Error in createConsumptionTracking:", error);
            throw error;
          });
      }

      if (category === "output") {
        const {
          QuantityReceived,
          documentType,
          Quantity,
          IId,
          ExpiryDate,
          LotNo,
          lineNo,
          PalletNo,
          ...rest
        } = formData;

        await createOutputTracking({
          // ...rest,
          OrderNo: no,
          LineNo: outputLineDataItem?.LineNo || undefined,
          BinCode: formData.Bin || undefined,
          Quantity: Number(Quantity) || undefined,
          ExpiryDate: ExpiryDate || undefined,
          LotNo: LotNo || undefined,
          // PalletNo: PalletNo || undefined,

          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
          DocumentStatus: value || undefined,
        })
          .unwrap()
          .then(async (res) => {
            // setAnyTracking(true);
            await outputPost({
              OrderNumber: no,
              AppStatus: "Post",
              environment: environment,
              companyId: companyId,
              tenantId: tenantId,
            })
              .then(async (res) => {
                Toast.show({
                  type: "success",
                  text1: res?.data?.AppStatus || "Posted",
                });
              })
              .catch((error) => {
                Toast.show({
                  type: "error",
                  text1: error.data.message || "Error in outputPost",
                });
              });
            outputRef();
          })
          .catch((error) => {
            console.error("Error in createOutputTracking:", error);
            throw error;
          });
      }

      if (category === "ship") {
        const {
          Quantity,
          documentType,
          QuantityReceived,
          ItemNo,
          PalletNo,
          IId,
          LineNo,
          ...rest
        } = formData;
        await createShipTracking({
          Bin: formData.Bin || undefined,
          LotNo: formData.LotNo || undefined,
          ItemNo: formData.ItemNo || undefined,
          ExpiryDate: formData.ExpiryDate || undefined,
          // PalletNo: formData.PalletNo || undefined,
          Quantity: Number(formData.Quantity) || undefined,
          WhsePickLinMethod: type === "split" ? "1" : "0",

          DocumentNo: (shipLineDataItem?.no as string) || no,
          DocumentType: String(5),
          environment: environment,
          LineNo:
            lineResponse || (shipLineDataItem?.LineNo as string) || lineNo,
          companyId: companyId,
          tenantId: tenantId,
          DocumentStatus: value || undefined,
        })
          .unwrap()
          .then(async (res) => {
            setAnyTracking(true);
            if (type === "split") {
              setFormIndex(0);
              setLineResponse(String(res?.data?.SplitLineNo || ""));
            }
            shipRef();
            if (value === "complate") {
              await shipPost({
                OrderNumber: no,
                AppStatus: "Post",
                environment: environment,
                companyId: companyId,
                tenantId: tenantId,
              })
                .then(async (res) => {
                  Toast.show({
                    type: "success",
                    text1: res?.data?.AppStatus || "Posted",
                  });
                })
                .catch((error) => {
                  Toast.show({
                    type: "error",
                    text1: error.data.message || "Error in shipPost",
                  });
                });
            }
          })
          .catch((error) => {
            console.error("Error in createShipTracking:", error);
            throw error;
          });
      }

      if (type !== "output") {
        Toast.show({
          type: "success",
          text1: "Saved",
        });
      }

      if (type !== "split") {
        if (lineIndex < listLength - 1) {
          skipLine(true, false);
        } else {
          skipLine(true, true);
        }
      } else {
        if (category === "production-pick" || category === "ship") {
          skipLine(true, false);
        }
      }

      if (type === "split") {
        if (category !== "receive" && category !== "production-pick") {
          setFormIndex(0);
        }
      } else {
        setFormIndex(0);
      }

      if (type == "split" && category === "receive") {
        setFormData({
          ...formData,
          Quantity: 0,
          ExpiryDate: "",
          LotNo: "",
          PalletNo: "",
          ItemNo: "",
          // Bin: "",
        });
      } else {
        if (category !== "production-pick") {
          setFormData({
            ...formData,
            Quantity: 0,
            ExpiryDate: "",
            LotNo: "",
            PalletNo: "",
            ItemNo: "",
            Bin: "",
          });
        }
      }

      if (lineIndex == listLength - 1) {
        await handlePostSubmit("Post");
      }
    } catch (error) {
      console.error("Global error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.data?.error?.message ||
          error?.data?.message ||
          "Something went wrong",
      });
    }
  };

  const handlePostSubmit = async (status?: string) => {
    try {
      if (category === "receive") {
        await receivePost({
          OrderNumber: no,
          AppStatus: value || status || undefined,
          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
        }).then(async (res) => {
          console.log(res);
          Toast.show({
            type: "success",
            text1: res?.data?.AppStatus || "Posted",
          });
          router.replace("/receive?type=receive");
        });
      }
      if (category === "production-pick") {
        await productionPickPost({
          OrderNumber: no,
          AppStatus: value || status || undefined,
          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
        })
          .then(async (res) => {
            console.log(res);
            Toast.show({
              type: "success",
              text1: res?.data?.AppStatus || "Posted",
            });
            router.replace("/production-pick?type=production-pick");
          })
          .catch((error) => {
            Toast.show({
              type: "error",
              text1: error.data.message || "Error in productionPickPost",
            });
          });
      }
      if (category === "output") {
        await outputPost({
          OrderNumber: no,
          AppStatus: value || status || undefined,
          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
        })
          .then(async (res) => {
            Toast.show({
              type: "success",
              text1: res?.data?.AppStatus || "Posted",
            });
            router.replace("/output?type=output");
          })
          .catch((error) => {
            Toast.show({
              type: "error",
              text1: error.data.message || "Error in outputPost",
            });
          });
      }
      if (category === "consumption") {
        await consumptionPost({
          OrderNumber: no,
          AppStatus: value || status || undefined,
          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
        })
          .then(async (res) => {
            Toast.show({
              type: "success",
              text1: res?.data?.AppStatus || "Posted",
            });
            router.replace("/consumption?type=consumption");
          })
          .catch((error) => {
            Toast.show({
              type: "error",
              text1: error.data.message || "Error in consumptionPost",
            });
          });
      }
      if (category === "ship") {
        await shipPost({
          OrderNumber: no,
          AppStatus: value || status || undefined,
          environment: environment,
          companyId: companyId,
          tenantId: tenantId,
        })
          .then(async (res) => {
            Toast.show({
              type: "success",
              text1: res?.data?.AppStatus || "Posted",
            });
            router.replace("/ship?type=ship");
          })
          .catch((error) => {
            Toast.show({
              type: "error",
              text1: error.data.message || "Error in shipPost",
            });
          });
      }
    } catch (error) {
      console.error("Error in handlePostSubmit:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (value) {
      handlePostSubmit();
    }
  }, [value]);

  const HandleOk = async (formIndex: number) => {
    textInputRef.current?.focus();

    if (!formData[formArray[formIndex]]) {
      setFormError("Please enter all required fields.");
      return;
    }

    if (category === "consumption") {
      if (
        consumptionLotValidation?.value[0]?.lotNo &&
        formData.LotNo !== consumptionLotValidation?.value[0]?.lotNo
      ) {
        setFormError("Lot No is not valid");
        return;
      }
    }

    if(formData.ExpiryDate){
      if(formData.ExpiryDate.length < 8){
        setFormError("Expiry Date is not valid");
        return;
      }
      const month = formData.ExpiryDate.slice(5, 7);
      const day = formData.ExpiryDate.slice(8, 10);
      if(month < 1 || month > 12){
        setFormError("Expiry Date is not valid ");
        return;
      }
      if(day < 1 || day > 31){
        setFormError("Expiry Date is not valid ");
        return;
      }
      
    }

    if (category === "consumption") {
      const validationQuantity = consumptionLotValidation?.value?.[0]?.Quantity;

      if (
        formData.LotNo &&
        formData.Quantity &&
        validationQuantity &&
        Math.abs(formData.Quantity) > Math.abs(validationQuantity)
      ) {
        setFormError("Quantity is not valid");
        return;
      }

      if (
        formData.Quantity &&
        consumptionOrderLineDataComponentItem?.RemainingQuantity -
          consumptionOrderLineDataComponentItem?.RecordedQuantity <
          formData.Quantity
      ) {
        setFormError("Quantity is not valid");
        return;
      }
    }

    if (category === "ship" && formData?.ItemNo) {
      if (formData?.ItemNo !== shipLineDataItem?.ItemNo) {
        setFormError("Item No is not valid");
        return;
      }
    }

    if (category === "production-pick" && formData?.ItemNo) {
      if (formData?.ItemNo !== productionPickLineDataItem?.ItemNo) {
        setFormError("Item No is not valid");
        return;
      }
    }

    if (formIndex === formArray.length - 1) {
      if (formData.Quantity) {
        if (Number(formData.Quantity) < Number(outStandingQuantity)) {
          if (
            category === "consumption" &&
            (Number(
              consumptionOrderLineDataComponentItem?.RemainingQuantity
            ) -
              Number(
                consumptionOrderLineDataComponentItem?.RecordedQuantity
              ) ===
              Number(formData.Quantity))
          ) {
            await handleSubmit("add");
            setFormIndex(0);
            return;
          }
          setQtyValidation(true);
          return;
        } else {
          await handleSubmit("add");
          setFormIndex(0);
        }
      }

      // if (lineIndex == listLength - 1) {
      //   await handlePostSubmit("Post");
      // }
    } else {
      setFormIndex(formIndex + 1);
    }
  };

  const handleDateChange = (value: string) => {
    setError({ ...error, ExpiryDate: "" });
    let numericValue = value.replace(/[^0-9]/g, "");

    numericValue = numericValue.slice(0, 8);

    let formattedDate = numericValue;

    if (
      formData?.ExpiryDate?.toString().length > value.length &&
      (formData?.ExpiryDate?.toString().length == 9 ||
        formData?.ExpiryDate?.toString().length == 5)
    ) {
      setFormData({ ...formData, ExpiryDate: value.slice(0, -1) });
      return;
    }

    if (numericValue.length >= 4) {
      formattedDate = numericValue.slice(0, 4) + "-" + numericValue.slice(4);
      if (numericValue.length >= 6) {
        formattedDate = formattedDate.slice(0, 7) + "-" + numericValue.slice(6);
      }
    }

    if (formattedDate.length === 10) {
      const [year, month, day] = formattedDate.split("-").map(Number);

      if (month < 1 || month > 12) {
        setError({ ...error, ExpiryDate: "Please enter a valid month" });
        return;
      }

      const lastDay = new Date(year, month, 0).getDate();

      if (day < 1 || day > lastDay) {
        setError({ ...error, ExpiryDate: "Please enter a valid day" });
        return;
      }

      setError({ ...error, ExpiryDate: "" });
    }

    if (formattedDate.length === 0) {
      setFormData({ ...formData, ExpiryDate: undefined });
    } else {
      setFormData({ ...formData, ExpiryDate: formattedDate });
    }
  };

  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: formData.ExpiryDate ? new Date(formData.ExpiryDate) : new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === "dismissed") {
          return;
        }

        if (selectedDate) {
          setFormData({
            ...formData,
            ExpiryDate: selectedDate.toISOString().split("T")[0],
          });
        }
      },
      mode: "date",
      is24Hour: true,
    });
  };

  useEffect(() => {
    if (category === "ship" || category === "output") {
      const qrPattern = /^[^%]+%[^%]+%[^%]+%[^%]+%[^%]+$/;
      const qrField = Object.keys(formData).find((field) =>
        qrPattern.test(formData[field])
      );

      if (qrField) {
        const qrString = formData[qrField];

        const [itemNo, palletNo, lotNo, expiryDate, quantity] =
          qrString.split("%");

        if (
          shipLineDataItem?.ItemNo != itemNo &&
          outputLineDataItem?.ItemNo != itemNo
        ) {
          Toast.show({
            type: "error",
            text1: "Not matching Item no",
          });

          setFormData({
            ...formData,
            Quantity: 0,
            PalletNo: "",
            LotNo: "",
            ExpiryDate: "",
            // ItemNo: "",
          });
        } else {
          if (shipLineDataItem?.LotSpecificTracking === false) {
            setFormData({
              ...formData,
              Quantity: quantity,
              PalletNo: palletNo,
              // LotNo: lotNo,
              // ExpiryDate: "20" + expiryDate,
              ItemNo: itemNo || "",
            });
          } else {
            setFormData({
              ...formData,
              Quantity: quantity,
              PalletNo: palletNo,
              LotNo: lotNo,
              ExpiryDate: "20" + expiryDate,
              ItemNo: itemNo || "",
            });
          }
          setFormIndex(formArray.length - 1);
        }
      }
    }
  }, [formData.PalletNo]);

  // useEffect(() => {
  //   if (category === "ship") {
  //     const qrPattern = /^[^%]+%[^%]+%[^%]+%[^%]+%[^%]+$/;

  //     if (qrPattern.test(salesSearch as string)) {
  //       const [itemNo, palletNo, lotNo, expiryDate, quantity] =
  //         salesSearch.split("%");

  //       setFormData({
  //         ...formData,
  //         Quantity: quantity,
  //         LotNo: lotNo,
  //         ExpiryDate: "20" + expiryDate,
  //       });
  //     }
  //   }
  // }, []);

  const skipLine = (disableBack: boolean = false, post: boolean = true) => {
    setLineResponse("");
    if (lineIndex < listLength - 1) {
      setLineIndex(lineIndex + 1);
      setFormIndex(0);
    } else {
      if (anyTracking && post) {
        // console.log("skip line post function called");
        handlePostSubmit("Post");
      }
      if (!disableBack) {
        switch (category) {
          case "receive":
            router.replace("/receive?type=receive");
            break;
          case "output":
            router.replace("/output?type=output");
            break;
          case "consumption":
            router.replace("/consumption?type=consumption");
            break;
          case "ship":
            router.replace("/ship?type=ship");
            break;
          case "production-pick":
            router.replace("/production-pick?type=production-pick");
            break;
        }
      }
    }
    setFormData({});
  };

  const styles = StyleSheet.create({
    headerDetail: {
      color: "white",
      fontWeight: "bold",
      fontSize: keyboardVisible ? 11 : 14,
    },
    dropdownContainer: {
      paddingHorizontal: 20,
      backgroundColor: "red",
      marginTop: 10,
      zIndex: 1000, // ensure dropdown overlaps other content
    },
    dropdown: {
      height: 38,
      borderColor: "gray",
      borderWidth: 1,
      backgroundColor: "white",
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    dropdownText: {
      color: "black",
      fontWeight: "bold",
    },
    dropdownList: {
      backgroundColor: "white",
      borderColor: "#ccc",
      width: "45%",
      zIndex: 1000, // ensure dropdown overlaps other content
      position: "static",
    },
  });

  return (
    <View className="flex-1">
      <Header>
        <View className="flex flex-row justify-between items-center ">
          <TouchableOpacity
            className="bg-white rounded-[15px] p-2"
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-white  text-[20px] font-poppins font-bold capitalize">
            {category === "receive"
              ? "Receipt Line "
              : category === "production-pick"
              ? "Pick Line"
              : category === "consumption"
              ? "Component Line"
              : category === "output"
              ? "Production Order Line"
              : "Pick Line"}
          </Text>
          <View className="flex flex-row gap-2">
            <TouchableOpacity className=" p-2 w-[30px]">
              {/* <MaterialIcons name="qr-code-scanner" size={30} color="white" /> */}
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex flex-row justify-between my-2">
          <View className="flex-1 ">
            {receiveLineDataItem?.no && (
              <Text style={styles.headerDetail}>
                Receipt No : {receiveLineDataItem?.no}
              </Text>
            )}
            {receiveLineDataItem?.SourceNo && (
              <Text style={styles.headerDetail}>
                Source No : {receiveLineDataItem?.SourceNo}
              </Text>
            )}
            {receiveLineDataItem?.Description && (
              <Text style={styles.headerDetail}>
                Item No : {receiveLineDataItem?.ItemNo}
              </Text>
            )}
            {receiveLineDataItem?.Description && (
              <Text style={styles.headerDetail}>
                Description : {receiveLineDataItem?.Description}
              </Text>
            )}
            {receiveLineDataItem?.UnitofMeasure && (
              <Text style={styles.headerDetail}>
                UOM : {receiveLineDataItem?.UnitofMeasure}
              </Text>
            )}
            {category === "receive" ? (
              <Text style={styles.headerDetail}>
                Qty. to Receive : {receiveLineDataItem?.QtytoReceive || 0}
              </Text>
            ) : null}
            {category === "receive" ? (
              <Text style={styles.headerDetail}>
                Qty. Received : {receiveLineDataItem?.QtyReceived || 0}
              </Text>
            ) : null}
            {category === "receive" ? (
              <Text style={styles.headerDetail}>
                Qty. Outstanding : {receiveLineDataItem?.QtyOutstanding || 0}
              </Text>
            ) : null}

            {consumptionOrderLineDataComponentItem?.ProdOrderNo && (
              <Text style={styles.headerDetail}>
                Order No : {consumptionOrderLineDataComponentItem?.ProdOrderNo}
              </Text>
            )}
            {consumptionOrderLineDataComponentItem?.ItemNo && (
              <Text style={styles.headerDetail}>
                Item No : {consumptionOrderLineDataComponentItem?.ItemNo}
              </Text>
            )}

            {consumptionOrderLineDataComponentItem?.Description && (
              <Text style={styles.headerDetail}>
                Description :{" "}
                {consumptionOrderLineDataComponentItem?.Description}
              </Text>
            )}
            {category === "consumption" ? (
              <Text style={styles.headerDetail}>
                Remaining Quantity :{" "}
                {consumptionOrderLineDataComponentItem?.RemainingQuantity || 0}
              </Text>
            ) : null}
            {consumptionOrderLineDataComponentItem?.UnitofMeasureCode && (
              <Text style={styles.headerDetail}>
                UOM : {consumptionOrderLineDataComponentItem?.UnitofMeasureCode}
              </Text>
            )}

            {outputLineDataItem?.ItemNo && (
              <Text style={styles.headerDetail}>
                Item No : {outputLineDataItem?.ItemNo}
              </Text>
            )}

            {outputLineDataItem?.LineNo && (
              <Text style={styles.headerDetail}>
                Line No : {outputLineDataItem?.LineNo}
              </Text>
            )}

            {outputLineDataItem?.Description && (
              <Text style={styles.headerDetail}>
                Description : {outputLineDataItem?.Description}
              </Text>
            )}
            {category === "output" ? (
              <Text style={styles.headerDetail}>
                Remaining Quantity : {outputLineDataItem?.RemainingQty || 0}
              </Text>
            ) : null}

            {outputLineDataItem?.UnitofMeasureCode && (
              <Text style={styles.headerDetail}>
                UOM : {outputLineDataItem?.UnitofMeasureCode}
              </Text>
            )}

            {productionPickLineDataItem?.no && (
              <Text style={styles.headerDetail}>
                Pick No : {productionPickLineDataItem?.no}
              </Text>
            )}
            {productionPickLineDataItem?.ProdOrderNo && (
              <Text style={styles.headerDetail}>
                Prod.Order No : {productionPickLineDataItem?.ProdOrderNo}
              </Text>
            )}

            {productionPickLineDataItem?.Description && (
              <Text style={styles.headerDetail}>
                Description : {productionPickLineDataItem?.Description}
              </Text>
            )}

            {productionPickLineDataItem?.UnitofMeasure && (
              <Text style={styles.headerDetail}>
                UOM : {productionPickLineDataItem?.UnitofMeasure}
              </Text>
            )}

            {category === "production-pick" ? (
              <Text style={styles.headerDetail}>
                Qty. to Handle : {productionPickLineDataItem?.QtytoHandle || 0}
              </Text>
            ) : null}

            {category === "production-pick" ? (
              <Text style={styles.headerDetail}>
                Qty. Handled : {productionPickLineDataItem?.QtyHandled || 0}
              </Text>
            ) : null}
            {category === "production-pick" ? (
              <Text style={styles.headerDetail}>
                Qty. Outstanding :{" "}
                {productionPickLineDataItem?.QtyOutstanding || 0}
              </Text>
            ) : null}

            {shipLineDataItem?.no && (
              <Text style={styles.headerDetail}>
                Pick No : {shipLineDataItem?.no}
              </Text>
            )}

            {shipLineDataItem?.ItemNo && (
              <Text style={styles.headerDetail}>
                Item No : {shipLineDataItem?.ItemNo}
              </Text>
            )}

            {shipLineDataItem?.Description && (
              <Text style={styles.headerDetail}>
                Description : {shipLineDataItem?.Description}
              </Text>
            )}

            {shipLineDataItem?.UnitofMeasure && (
              <Text style={styles.headerDetail}>
                UOM : {shipLineDataItem?.UnitofMeasure}
              </Text>
            )}
            {category === "ship" ? (
              <Text style={styles.headerDetail}>
                Qty. to Handle : {shipLineDataItem?.QtytoHandle || 0}
              </Text>
            ) : null}

            {category === "ship" ? (
              <Text style={styles.headerDetail}>
                Qty. Handled : {shipLineDataItem?.QtyHandled || 0}
              </Text>
            ) : null}
            {category === "ship" ? (
              <Text style={styles.headerDetail}>
                Qty. Outstanding : {shipLineDataItem?.QtyOutstanding || 0}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              flex: 0.3,

              alignItems: "flex-end",
              // justifyContent: 'space-between'
            }}
          >
            <Text style={styles.headerDetail}>
              Line {lineIndex + 1} of {listLength}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                borderRadius: 5,
                borderColor: "#81A8CC",
                borderWidth: 1,
                marginTop: 7,
                height: 31,
                width: 67,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => skipLine()}
            >
              <Text style={{ fontWeight: "bold" }}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex  gap-2">
          {/* <DropDownPicker
            open={open}
            value={value || ""}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            placeholder="Document"
            setItems={setItems}
            style={styles.dropdown}
            containerStyle={{}}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownList}
            // arrowIconStyle={{ tintColor: 'black' }}
          /> */}

          {category !== "output" && !keyboardVisible && (
            <Dropdown
              style={[styles.dropdown, { width: isWebLayout ? "20%" : "40%" }]}
              data={items}
              mode="auto"
              labelField="label"
              valueField="value"
              placeholder="Activity"
              value={value}
              onChange={(item) => {
                setValue(item.value);
              }}
            />
          )}
          <View className="flex flex-row gap-2">
            {drowdownLoading && (
              <ActivityIndicator size="small" color="white" className="" />
            )}
          </View>
        </View>
      </Header>
      <OnlineStatus />
      {/* <SearchName value={"Item No"} /> */}

      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-[30px] py-[10px] gap-5">
          {formIndex !== -1 ? (
            <View
              className="flex "
              style={{
                backgroundColor: "#E6C713",

                marginTop: 5,
                padding: 8,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "#B29700",
              }}
            >
              <View className="flex flex-row">
                <Text style={{ fontSize: 13 }} className="font-bold">
                  {formArray[formIndex] === "ExpiryDate"
                    ? "Expire Date"
                    : formArray[formIndex] === "LineNo"
                    ? "Line No"
                    : formArray[formIndex] === "Quantity"
                    ? "Quantity"
                    : formArray[formIndex] === "ItemNo"
                    ? "Item No"
                    : formArray[formIndex] === "LotNo"
                    ? "Lot No"
                    : formArray[formIndex]}
                </Text>
                
                {category === "production-pick" && (
                  <Text
                    style={{ fontSize: 13 }}
                    className="font-semibold text-gray-500"
                  >
                    {" "}
                    (
                    {formArray[formIndex] === "Bin"
                      ? productionPickLineDataItem?.BinCode
                      : formArray[formIndex] === "ItemNo"
                      ? productionPickLineDataItem?.ItemNo
                      : formArray[formIndex] === "LotNo"
                      ? productionPickLineDataItem?.LotNo
                      : formArray[formIndex] === "ExpiryDate"
                      ? productionPickLineDataItem?.ExpirationDate
                      : formArray[formIndex] === "Quantity"
                      ? Number(
                          productionPickLineDataItem?.QtyOutstanding || 0
                        ) - Number(productionPickLineDataItem?.QtytoHandle || 0)
                      : ""}
                    )
                    

                  </Text>
                )}
                {category === "ship" && (
                  <Text
                    style={{ fontSize: 13 }}
                    className="font-semibold text-gray-500"
                  >
                    {" "}
                    (
                    {formArray[formIndex] === "Bin"
                      ? shipLineDataItem?.BinCode
                      : formArray[formIndex] === "ItemNo"
                      ? shipLineDataItem?.ItemNo
                      : formArray[formIndex] === "LotNo"
                      ? shipLineDataItem?.LotNo
                      : formArray[formIndex] === "ExpiryDate"
                      ? shipLineDataItem?.ExpirationDate
                      : formArray[formIndex] === "Quantity"
                      ? shipLineDataItem?.Quantity
                      : ""}
                    )
                  </Text>
                )}
                {formArray[formIndex] === "ExpiryDate" && (
                      <Text className="font-semibold text-gray-600">
                         {" "} (yyyy-mm-dd)
                      </Text>
                    )}
              </View>
              <View
                className="flex flex-row items-center justify-between px-2 mt-1"
                style={{
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "#6897C2",
                  borderRadius: 7,
                  paddingVertical: 5,
                  paddingLeft: 10,
                  paddingRight: 5,
                  // height: window.height * 0.05,
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <View className="w-[60%]">
                  <TextInput
                    ref={textInputRef}
                    className="w-full  outline-none"
                    placeholder={
                      "Enter " +
                      (formArray[formIndex] === "ExpiryDate"
                        ? "Expire Date"
                        : formArray[formIndex] === "LineNo"
                        ? "Line No"
                        : formArray[formIndex] === "Quantity"
                        ? "Quantity"
                        : formArray[formIndex] === "ItemNo"
                        ? "Item No"
                        : formArray[formIndex] === "LotNo"
                        ? "Lot No"
                        : formArray[formIndex] === "PalletNo"
                        ? "Pallet No"
                        : formArray[formIndex] === "Bin"
                        ? "Bin"
                        : "")
                    }
                    value={formData[formArray[formIndex]] || ""}
                    placeholderTextColor="black"
                    autoFocus={true}
                    onChangeText={(value) => {
                      setFormError("");
                      setQtyValidation(false);
                      if (formArray[formIndex] === "ExpiryDate") {
                        handleDateChange(value);
                      } else {
                        setFormData({
                          ...formData,
                          [formArray[formIndex]]: value,
                        });
                      }
                    }}
                  />
                </View>
                {!qtyValidation && (
                  <TouchableOpacity
                    className="bg-primary rounded-[5px] w-[93px] items-center justify-center h-[37px] "
                    onPress={() => HandleOk(formIndex)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        className="mt-1"
                      />
                    ) : (
                      <MaterialIcons name="done" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
              {formError && (
                <Text style={{ color: "red", marginTop: 5 }}>{formError}</Text>
              )}
            </View>
          ) : null}

          {qtyValidation && (
            <View>
              <Text className="text-red-500 text-[12px] font-poppins font-bold ">
                Entered quantity is less than the Outstanding quantity. Do you
                want to split the line or complete?
              </Text>

              <View className="flex flex-row justify-end  gap-3 mt-5">
                <TouchableOpacity
                  disabled={isLoading}
                  onPress={() => handleSubmit("split")}
                  className="bg-primary rounded-[5px] w-[93px] items-center justify-center h-[37px] "
                >
                  <Text className="text-white text-[12px] font-poppins font-bold ">
                    {isLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        className="mt-1"
                      />
                    ) : (
                      "Split"
                    )}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isLoading}
                  onPress={() => handleSubmit("complate")}
                  className="bg-primary rounded-[5px] w-[93px] items-center justify-center h-[37px] "
                >
                  <Text className="text-white text-[12px] font-poppins font-bold ">
                    {isLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="white"
                        className="mt-1"
                      />
                    ) : (
                      "Complete"
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View>
            {/* {category === "production-pick" && (
              <View className={`flex flex-row gap-2     p-2`}>
                <Text className="font-bold">
                  Expire Date : {formData.ExpiryDate || ""}
                </Text>
              </View>
            )} */}
            {category === "consumption" && (
              <View className={`flex flex-row gap-2     p-2`}>
                <Text className="font-bold">
                  Bin : {consumptionOrderLineDataComponentItem?.BinCode || ""}
                  {/* <Text className="font-semibold text-gray-500"></Text> */}
                </Text>
              </View>
            )}

            {formArray.map((item, index) => (
              <View key={index}>
                <View
                  key={index}
                  className={`flex flex-row gap-2   ${
                    index === formIndex
                      ? "border-[#E6C713] border-2 rounded"
                      : ""
                  }  p-2`}
                >
                  <Text className="font-bold">
                    {item === "LotNo"
                      ? "Lot No"
                      : item === "ExpiryDate"
                      ? "Expire Date"
                      : item === "PalletNo"
                      ? "Pallet No"
                      : item === "ItemNo"
                      ? "Item No"
                      : item}{" "}
                    : {formData[item] || ""}
                    {category === "production-pick" && !formData[item] && (
                      <Text className="font-semibold text-gray-500">
                        {item === "Bin"
                          ? productionPickLineDataItem?.BinCode
                          : item === "ItemNo"
                          ? productionPickLineDataItem?.productionPickLineList
                          : item === "LotNo"
                          ? productionPickLineDataItem?.LotNo
                          : item === "ExpiryDate"
                          ? productionPickLineDataItem?.ExpirationDate
                          : item === "Quantity"
                          ? productionPickLineDataItem?.QtyOutstanding
                          : ""}
                      </Text>
                    )}
                    {category === "ship" && !formData[item] && (
                      <Text className="font-semibold text-gray-500">
                        {item === "Bin"
                          ? shipLineDataItem?.BinCode
                          : item === "ItemNo"
                          ? shipLineDataItem?.ItemNo
                          : item === "LotNo"
                          ? shipLineDataItem?.LotNo
                          : item === "ExpiryDate"
                          ? shipLineDataItem?.ExpirationDate
                          : item === "Quantity"
                          ? shipLineDataItem?.QtyHandled
                          : ""}
                      </Text>
                    )}
                  </Text>
                </View>

                {category === "production-pick" && item === "LotNo" && (
                  <View className={`flex flex-row gap-2     p-2`}>
                    <Text className="font-bold">
                      Expire Date : {formData.ExpiryDate || ""}
                      {/* <Text className="font-semibold text-gray-500"></Text> */}
                    </Text>
                  </View>
                )}
                {category === "consumption" && item === "LotNo" && (
                  <View className={`flex flex-row gap-2     p-2`}>
                    <Text className="font-bold">
                      Expire Date : {formData.ExpiryDate || ""}
                      {/* <Text className="font-semibold text-gray-500"></Text> */}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {error.Quantity ? (
            <Text style={{ color: "red", marginTop: 5 }}>{error.Quantity}</Text>
          ) : null}
        </View>

        <View className="flex flex-row justify-end px-[30px] gap-3 mt-5">
          <TouchableOpacity
            onPress={handleClear}
            className="bg-white border border-primary rounded-[5px] w-[93px] items-center justify-center h-[37px]"
          >
            <Text className="text-black text-[12px] font-poppins font-bold">
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Item;
