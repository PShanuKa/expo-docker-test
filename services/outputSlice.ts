import { apiSlice } from "./apiSlice";

export const outputSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOutputOrderList: builder.query({
      query: ({ searchQuery, top, skip , environment,companyId, tenantId }) => {
        // Start with the base endpoint (ensure it matches the actual API path)
        let queryString = `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/ProdOrderListOutput`;
  
        const expandClause = "$expand=ProdOrderLineListOutput($expand=ItemReferenceList)";
  
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
      providesTags: ["Output"],
    }),
    getOutputLineList: builder.query({
      query: ({environment,companyId, tenantId}) => `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/ProdOrderLineList`,
      providesTags: ["Output"],
    }),
    createOutputTracking: builder.mutation({
      query: (data) => {
        const { environment,companyId, tenantId, ...other } = data;
        return {
          url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/OutputItemTrackingAPI`,
          method: "POST",
          body: other,
        };
      },
      invalidatesTags: ["Output"],
    }),
    outputItem: builder.mutation({
      query: (data) => {
        const { environment,companyId, tenantId, ...other } = data;
        return {
          url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/PostOutputJournal`,
          method: "POST",
          body: other,
        };
      },
      invalidatesTags: ["Output"],
    }),
  }),
});

export const {
  useGetOutputOrderListQuery,
  useGetOutputLineListQuery,
  useCreateOutputTrackingMutation,
  useOutputItemMutation,
} = outputSlice;
