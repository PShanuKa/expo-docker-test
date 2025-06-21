import { apiSlice } from "./apiSlice";

export const referenceSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReference: builder.query({
      query: ({environment,companyId, tenantId}) => {
        return {
          url: `${tenantId}/${environment}/api/MC360/data/v2.0/companies(${companyId})/ItemReferenceList`,
        };
      },
    }),
  }),
});


export const {
  useGetReferenceQuery,
} = referenceSlice;
