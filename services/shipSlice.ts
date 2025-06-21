import { apiSlice } from "./apiSlice";


export const shipSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      getShipOrderList: builder.query({
        query: ({ searchQuery, top, skip, environment,companyId, tenantId }) => {
            let queryString = `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/SalesPickList`;
    
            // Define the $expand clause
            const expandClause = '$expand=SalesPickLineList($expand=ItemReferenceList)';
    
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
        providesTags: ["Ship"],
    }),
          getShipLineList: builder.query({
            query: ({searchQuery, top, skip, documentNo, environment, companyId, tenantId}) => {
                let queryString = `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/SaleLineList`;
                let filters = [];
        
                if (documentNo) {
                    filters.push(`DocumentNo eq '${encodeURIComponent(documentNo)}'`);
                }
        
                if (searchQuery) {
                    filters.push(`contains(ItemNo, '${encodeURIComponent(searchQuery)}')`);
                }
        
                if (filters.length > 0) {
                    queryString += `?$filter=${filters.join(' and ')}`;
                }
        
                return queryString;
            },
            providesTags: ["Ship"]
        }),
        createShipTracking: builder.mutation({
            query: (data) => {
                const { environment,companyId, tenantId, ...other } = data;
                return {
                    url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/SalesdPickItemTrackingAPI`,
                    method: 'POST',
                    body: other
                };
            },
            invalidatesTags: ['Ship']
        }),
        postShipItem: builder.mutation({
            query: (data) => {
                const { environment,companyId, tenantId, ...other } = data;
                return {
                    url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/RegisterSalesPick`,
                    method: 'POST',
                    body: other
                };
            },
            invalidatesTags: ['Ship']
        }),
    }),
})

export const { useGetShipOrderListQuery, useGetShipLineListQuery, useCreateShipTrackingMutation, usePostShipItemMutation } = shipSlice;
