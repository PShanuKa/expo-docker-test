import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const isTokenValid = async () => {
  try {
    const token = await AsyncStorage.getItem("organization_token");
    if (!token) return false;

    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (!decodedToken.exp) return false;
    return decodedToken.exp > currentTime + 300;
  } catch {
    return false;
  }
};

const refreshToken = async () => {
  try {
    const response = await fetch(
      "https://bar-code.duckdns.org/token",
      {
        method: "GET",
      }
    );

    const data = await response.json();
    if (data.access_token) {
      await AsyncStorage.setItem("organization_token", data.access_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl:
    "https://api.businesscentral.dynamics.com/v2.0/fa51c2d9-b92c-4ee0-8186-a8733f338c47/DemoMV/api/MC360/data/v2.0/companies(f65aecdd-ef6e-ef11-a677-6045bdc893a7)",
  prepareHeaders: async (headers) => {
    const isValid = await isTokenValid();
    if (!isValid) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        throw new Error("Unable to refresh token");
      }
    }

    const token = await AsyncStorage.getItem("organization_token");
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});



const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  try {
    const result = await baseQueryWithAuth(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return await baseQueryWithAuth(args, api, extraOptions);
      } else {
        await AsyncStorage.removeItem("organization_token");
        throw new Error("Authentication failed");
      }
    }

    return result;
  } catch (error) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        error: error.message,
      },
    };
  }
};


export const organizationApiSlice = createApi({
  reducerPath: "organizationApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    postOrganization: builder.mutation({
      query: (data) => ({
        url: "InitCompanyActivityAPI",
        method: "POST",
        body: data,
      }),
    }),
  }),
  
});

export const { usePostOrganizationMutation } = organizationApiSlice;
