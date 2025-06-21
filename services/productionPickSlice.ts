import { apiSlice } from "./apiSlice";

export const productionPickSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductionPickList: builder.query({
      query: ({ searchQuery, top, skip , environment,companyId, tenantId }) => {
        // Start with the base endpoint
        let queryString = `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/ProductionPickList`;
    
        // Define the $expand clause
        const expandClause = "$expand=ProductionPickLineList($expand=ItemReferenceList)";
    
        // Add the $expand clause to the base query
        queryString += `?${expandClause}`;
    
        // Add $filter if searchQuery is provided
        if (searchQuery) {
          const filter = `contains(No, '${encodeURIComponent(searchQuery)}')`;
          queryString += `&$filter=${filter}`;
        }
    
        // Add $top if defined
        if (top !== undefined) {
          queryString += `&$top=${top}`;
        }
    
        // Add $skip if defined
        if (skip !== undefined) {
          queryString += `&$skip=${skip}`;
        }
    
        return queryString;
      },
      providesTags: ["Receive"],
    }),
    // getReceiveLineList: builder.query({
    //   query: ({searchQuery, top, skip, documentNo, environment, companyId, tenantId}) => {
    //       let queryString = `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/PurchLineList`;
    //     let filters = [];
    
    //     if (documentNo) {
    //       filters.push(`DocumentNo eq '${encodeURIComponent(documentNo)}'`);
    //     }
    
    //     if (searchQuery) {
    //       filters.push(`contains(ItemNo, '${encodeURIComponent(searchQuery)}')`);
    //     }
    
    //     if (filters.length > 0) {
    //       queryString += `?$filter=${filters.join(" and ")}`;
    //     }

    //     if (top !== undefined) {
    //       queryString += `${searchQuery || documentNo ? "&" : "?"}$top=${top}`;
    //     }
    
    //     return queryString;
    //   },
    //   providesTags: ["Receive"],
    // }),
    createProductionPickTracking: builder.mutation({
      query: (data) => {
        const { environment,companyId, tenantId, ...other } = data;
        return {
          url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/ProdPickItemTrackingAPI`,
          method: "POST",
          body: other,
        };
      },
      invalidatesTags: ["Receive"],
      
    }),
    // receiveItem: builder.mutation({
    //   query: (data) => {
    //     const { environment,companyId, tenantId, ...other } = data;
    //     return {
    //       url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/PostPurchaseOrder`,
    //       method: "POST",
    //       body: other,
    //     };
    //   },
    //   invalidatesTags: ["Receive"],
    // }),
    postProductionPick: builder.mutation({
      query: (data) => {
        const { environment,companyId, tenantId, ...other } = data;
        return {
          url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/RegisterProductionPick`,
          method: "POST",
          body: other,
        };
      },
      invalidatesTags: ["Receive"],
    }),
    
  }),
});

export const {
  useGetProductionPickListQuery,
  useCreateProductionPickTrackingMutation,
  usePostProductionPickMutation,
} = productionPickSlice;
