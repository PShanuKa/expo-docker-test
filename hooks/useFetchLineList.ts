import { useGetReceiveLineListQuery } from "@/services/receiveSlice";
import { useGetConsumptionLineListQuery } from "@/services/consumptionSlice";
import { useGetShipLineListQuery } from "@/services/shipSlice";

export const useFetchLineList = (category: string, params: any ) => {

  const queryOptions = {
    refetchOnMountOrArgChange: false,
  };

  const receiveLineListQuery = useGetReceiveLineListQuery(params, {
    ...queryOptions,
    skip: category !== "receive",
  });

  const consumptionLineListQuery = useGetConsumptionLineListQuery(params, {
    ...queryOptions,
    skip: category !== "consumption",
  });

  const shipLineListQuery = useGetShipLineListQuery(params, {
    ...queryOptions,
    skip: category !== "ship",
  });

  // Return the appropriate data based on the category
  switch (category) {
    case "receive":
      return receiveLineListQuery;
    case "consumption":
      return consumptionLineListQuery;
    case "ship":
      return shipLineListQuery;
    default:
      return {
        data: null,
        isLoading: false,
        isFetching: false,
      };
  }
};