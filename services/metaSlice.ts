import { apiSlice } from "./apiSlice";

export const metaSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompany: builder.query({
      query: (environment) => {
        return {
          url: `/${environment}/api/v2.0/companies`,
        };
      },
    }),
   
  }),
});


export const {
  useGetCompanyQuery,
  useLazyGetCompanyQuery
} = metaSlice;
