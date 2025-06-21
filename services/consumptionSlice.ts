import { store } from "@/store";
import { apiSlice } from "./apiSlice";

export const consumptionSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConsumptionOrderList: builder.query({
      query: ({ searchQuery, top, skip, environment,companyId, tenantId}) => {
        // Start with the base endpoint
        let queryString = `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/ProdOrderList`;

        const expandClause =
          "$expand=ProdOrderLineList($expand=ProdOrderComponent($expand=ItemReferenceList))";

        queryString += `?${expandClause}`;

        if (searchQuery) {
          const filter = `contains(No, '${encodeURIComponent(searchQuery)}')`;
          queryString += `&$filter=${filter}`;
        }

        if (top !== undefined) {
          queryString += `&$top=${top}`;
        }

        if (skip !== undefined) {
          queryString += `&$skip=${skip}`;
        }

        return queryString;
      },
      providesTags: ["Consumption"],
    }),
    getConsumptionLineList: builder.query({
      query: ({ searchQuery, top, skip, documentNo, environment,companyId, tenantId }) => {
        let queryString = `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/ProdOrderComponent`;
        let filters = [];

        if (documentNo) {
          filters.push(`ProdOrderNo eq '${encodeURIComponent(documentNo)}'`);
        }

        if (searchQuery) {
          filters.push(
            `contains(ItemNo, '${encodeURIComponent(searchQuery)}')`
          );
        }

        if (filters.length > 0) {
          queryString += `?$filter=${filters.join(" and ")}`;
        }

        if (top !== undefined) {
          queryString += `${searchQuery || documentNo ? "&" : "?"}$top=${top}`;
        }

        return queryString;
      },

      providesTags: ["Consumption"],
    }),
    createConsumptionTracking: builder.mutation({
      query: (data) => {
        const { environment,companyId, tenantId, ...other } = data;
        return {
          url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/ConsumptionItemTrackingAPI`,
          method: "POST",
          body: other,
        };
      },
      invalidatesTags: ["Consumption"],
    }),
    
    consumptionItem: builder.mutation({
      query: (data) => {
        const { environment,companyId, tenantId, ...other } = data;
        return {
          url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/PostConsumptionJournal`,
          method: "POST",
          body: other,
        };
      },
      invalidatesTags: ["Consumption"],
    }),
    postConsumptionItem: builder.mutation({
      query: (data) => {
        const { environment, companyId, tenantId, ...other } = data;
        return {
          url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/PostConsumptionJournal`,
          method: "POST",
          body: other,
        };
      },
      invalidatesTags: ["Consumption"],
    }),
    getExpireDate: builder.query({
      query: (data) => {
        const { environment, companyId, tenantId, ...other } = data;
        return {
          url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/ItemLedgerEntries`,
          method: "POST",
          body: other,
        };
      },
    }),
    getConsumptionLotValidation: builder.query({
      query: ({ no, lineNo, prodOrderLineNo, environment, companyId, tenantId }) => {
        const baseUrl = `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/ReservationEntry`;

        const filterClause = `$filter=ProdOrderNo eq '${encodeURIComponent(no)}' and ProdOrderLineNo eq ${prodOrderLineNo} and LineNo eq ${lineNo}`;

        const queryString = `${baseUrl}?${filterClause}`;
    
        return queryString;
      },
      providesTags: ["Consumption"],
    }),
  }),
});

export const {
  useGetConsumptionOrderListQuery,
  useGetConsumptionLineListQuery,
  useCreateConsumptionTrackingMutation,
  useConsumptionItemMutation,
  usePostConsumptionItemMutation,
  useGetExpireDateQuery,
  useGetConsumptionLotValidationQuery,
} = consumptionSlice;
