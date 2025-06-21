import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setOfflineData } from "@/features/offlineSlice";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useCreateReceiveTrackingMutation } from "@/services/receiveSlice";
import {
  useCreateOutputTrackingMutation,
  useOutputItemMutation,
} from "@/services/outputSlice";
import { useCreateConsumptionTrackingMutation } from "@/services/consumptionSlice";
import { useCreateShipTrackingMutation } from "@/services/shipSlice";

export const useApiLoop = (isConnected: boolean) => {
  const dispatch = useDispatch();
  const offlineData = useSelector(
    (state: RootState) => state.offline.offlineData
  );
  const [createReceiveTracking] = useCreateReceiveTrackingMutation();
  const [createOutputTracking] = useCreateOutputTrackingMutation();
  const [createConsumptionTracking] = useCreateConsumptionTrackingMutation();
  const [createShipTracking] = useCreateShipTrackingMutation();
  const [outputPost] = useOutputItemMutation();

  const [isLoading, setIsLoading] = useState(false);

  const companyId = useSelector((state: RootState) => state.meta.companyApiKey);
  const environment = useSelector((state: RootState) => state.meta.environment);
  const tenantId = useSelector((state: RootState) => state.meta.tenantId);

  const processOfflineData = async () => {
    if (!isConnected || offlineData.length === 0) return;

    setIsLoading(true);
    let updatedOfflineData: any[] = [...offlineData];

    for (const item of offlineData) {
      try {
        const { id, category, createdAt, ...otherData } = item;
        let response = null;

        switch (category) {
          case "receive": {
            const {
              ItemNo,
              QuantityReceived,
              documentType,
              Quantity,
              IId,
              LotNo,
              ExpiryDate,
              ...rest
            } = otherData;
            response = await createReceiveTracking({
              documentType: String(1),
              Quantity: Number(Quantity) || 0,
              environment: environment,
              companyId: companyId,
              tenantId: tenantId,
              LotNo: LotNo || undefined,
              ExpiryDate: ExpiryDate || undefined,
            });
            break;
          }
          case "consumption": {
            const {
              QuantityReceived,
              documentType,
              Quantity,
              ProdOrderNo,
              ProdOrderLineNo,
              lineNo,
              ItemNo,
              IId,
              CompLineNo,
              LotNo,
              ExpiryDate,
              documentNo,
              ...rest
            } = otherData;
            response = await createConsumptionTracking({
              // ...rest,
              LotNo: LotNo || undefined,
              ExpiryDate: ExpiryDate || undefined,
              CompLineNo: CompLineNo || undefined,
              Quantity: Number(Quantity) || 0,
              OrderNo: documentNo,
              lineNo: lineNo,
              companyId: companyId,
              environment: environment,
              tenantId: tenantId,
            });
            break;
          }
          case "output": {
            const {
              documentType,
              Quantity,
              IId,
              ExpiryDate,
              ItemNo,
              LotNo,
              PalletNo,
              documentNo,
              lineNo,

              ...rest
            } = otherData;
            response = await createOutputTracking({
              // ...rest,
              ItemNo: ItemNo || undefined,
              LotNo: LotNo || undefined,
              PalletNo: PalletNo || undefined,
              ExpiryDate: ExpiryDate || undefined,
              lineNo: lineNo,
              Quantity: Number(Quantity) || 0,

              OrderNo: documentNo,
              companyId: companyId,
              environment: environment,
              tenantId: tenantId,
            })
              .unwrap()
              .then(async () => {
                await outputPost({
                  OrderNumber: documentNo,
                  environment: environment,
                  companyId: companyId,
                  tenantId: tenantId,
                });
              });
            break;
          }
          case "ship": {
            const {
              Quantity,
              documentType,
              QuantityReceived,
              DocumentNo,
              ItemNo,
              PalletNo,
              documentNo,
              LineNo,
              IId,
              ...rest
            } = otherData;
            response = await createShipTracking({
              ...rest,
              LineNo: LineNo,
              DocumentNo: documentNo,
              Quantity: Number(Quantity) || 0,
              DocumentType: String(2),
              environment: environment,
              companyId: companyId,
              tenantId: tenantId,
            });
            break;
          }
        }

        if (response?.data) {
          updatedOfflineData = updatedOfflineData.filter(
            (offlineItem) => offlineItem.id !== id
          );
        } else {
          updatedOfflineData = updatedOfflineData.map((offlineItem: any) =>
            offlineItem.id === id
              ? {
                  ...offlineItem,
                  error: response?.error?.message || "Unknown error occurred",
                }
              : offlineItem
          );
        }
      } catch (error: any) {
        updatedOfflineData = updatedOfflineData.map((offlineItem: any) =>
          offlineItem.id === id
            ? {
                ...offlineItem,
                error: error.message || "Unknown error occurred",
              }
            : offlineItem
        );
        console.error(`Error processing ${item.category} item:`, error);
      }
    }

    const expiredFilter = updatedOfflineData.filter(
      (item: any) => item.createdAt < new Date(Date.now() - 60 * 60 * 1000)
    );

    dispatch(setOfflineData(expiredFilter));
    setIsLoading(false);
  };

  return { isLoading, triggerSync: processOfflineData };
};
