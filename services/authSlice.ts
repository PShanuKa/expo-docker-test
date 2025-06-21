import { apiSlice } from "./apiSlice";

export const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => {
        const { environment,companyId, tenantId, ...other } = data
        return{
        url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/InsFromScanOperators`,
        method: "POST",
        body: other,
      }
    },
    }),
  }),
});

export const { useLoginMutation } = authSlice;
