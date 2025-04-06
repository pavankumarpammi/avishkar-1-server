import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { setUser, logout } from "@/features/slices/authSlice";

// Use relative URL to leverage the Vite proxy configuration
const USER_API = `${process.env.BACKEND_URL}/api/v1/user`

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:USER_API,
        credentials:'include'
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url:"register",
                method:"POST",
                body:inputData
            }),
            transformErrorResponse: (response) => {
                if (response?.status === 500 && response?.data?.message?.includes('OTP')) {
                    return {
                        status: response.status,
                        data: {
                            message: "Could not send OTP. Please try again or contact support.",
                            originalError: response.data
                        }
                    };
                }
                return response;
            }
        }),
        loginUser: builder.mutation({
            query: (inputData) => ({
                url:"login",
                method:"POST",
                body:inputData,
                credentials: 'include'
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    const { user, token } = result.data;

                    // Save token & user data in localStorage
                    localStorage.setItem("userToken", `Bearer ${token}`);
                    localStorage.setItem("userData", JSON.stringify(user));

                    dispatch(setUser({user:user}));
                } catch (error) {
                    console.log('Login error:', error);
                }
            },
            transformErrorResponse: (response) => {
                console.log('Login response error:', response);
                
                if (response?.status === 500) {
                    return {
                        status: response.status,
                        data: {
                            message: "Server error. Please try again later.",
                            originalError: response.data
                        }
                    };
                }
                if (response?.status === 401) {
                    return {
                        status: response.status,
                        data: {
                            message: "Invalid credentials. Please check your phone number and password.",
                            originalError: response.data
                        }
                    };
                }
                if (response?.status === 404) {
                    return {
                        status: response.status,
                        data: {
                            message: "No account found with these credentials.",
                            originalError: response.data
                        }
                    };
                }
                return response;
            }
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url:"logout",
                method:"GET"
            }),
            async onQueryStarted(_, {dispatch}) {
                try { 
                    // Remove token & user data from localStorage
                    localStorage.removeItem("userToken");
                    localStorage.removeItem("userData");

                    dispatch(logout());
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        loadUser: builder.query({
            queryFn: async () => {
              try {
                const token = localStorage.getItem("userToken");
                console.log("Retrieved token from localStorage:", token);
                
                if (!token) {
                  return { error: { status: 401, message: "Token missing" } };
                }

                const formattedToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
          
                console.log("Using token:", formattedToken);
                                                
                const response = await fetch(`${USER_API}/profile`, {
                  method: "GET",
                  headers: {
                    "Authorization": formattedToken,
                    "Content-Type": "application/json"
                  },
                  credentials: 'include'
                });
                
                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  console.error("Profile fetch error response:", response.status, errorData);
                  return { 
                    error: { 
                      status: response.status, 
                      message: errorData.message || "Failed to fetch profile" 
                    } 
                  };
                }
                
                const data = await response.json();
                localStorage.setItem("userData", JSON.stringify(data.user));
                return { data };
              } catch (error) {
                console.error("Error fetching user profile:", error);
                return { error: { status: 500, message: "Internal Server Error" } };
              }
            },
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
              try {
                const result = await queryFulfilled;
                dispatch(setUser({ user: result.data.user }));
              } catch (error) {
                console.error("Profile fetch error:", error);
                // If unauthorized, clear user data
                // if (error?.error?.status === 401) {
                //   dispatch(logout());
                //   localStorage.removeItem("userData");
                // }
              }
            }
        }),
        updateUser: builder.mutation({
            query: (userData) => {
              const token = localStorage.getItem("userToken");
          
              if (!token) {
                console.error("Token missing");
                return { error: { status: 401, message: "Token missing" } };
              }
          
              return {
                url: "profile/update",
                method: "PUT",
                body: userData,
                headers: {
                  Authorization: `${token}`, // Include token in headers
                },
              };
            },
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
              try {
                const result = await queryFulfilled;
                if (result.data?.user) {
                  dispatch(setUser({ user: result.data.user }));
                  localStorage.setItem("userData", JSON.stringify(result.data.user));
                }
              } catch (error) {
                console.log("Profile update error:", error);
              }
            },
        }),
        getAllUsers: builder.query({
            query: () => ({
                url: "users",
                method: "GET",
            }),
            providesTags: ["Users"],
        }),
        getDatabaseStats: builder.query({
            query: () => ({
                url: "database-stats",
                method: "GET",
            }),
            providesTags: ["DbStats"],
        }),
        verifyPhone: builder.mutation({
            query: (data) => ({
                url: "verify-phone",
                method: "POST",
                body: data
            }),
            transformErrorResponse: (response) => {
                if (response?.data?.message?.includes('expired')) {
                    return {
                        status: response.status,
                        data: {
                            message: "Your verification code has expired. Please request a new one.",
                            originalError: response.data
                        }
                    };
                }
                if (response?.data?.message?.includes('Invalid OTP')) {
                    return {
                        status: response.status,
                        data: {
                            message: "Invalid verification code. Please check and try again.",
                            originalError: response.data
                        }
                    };
                }
                return response;
            }
        }),
        resendOTP: builder.mutation({
            query: (data) => ({
                url: "resend-otp",
                method: "POST",
                body: data
            }),
            transformErrorResponse: (response) => {
                if (response?.status === 500) {
                    return {
                        status: response.status,
                        data: {
                            message: "Could not send verification code. Please try again later.",
                            originalError: response.data
                        }
                    };
                }
                return response;
            }
        }),
        updateUserRole: builder.mutation({
            query: (data) => ({
                url: "user/role",
                method: "PUT",
                body: data
            }),
            invalidatesTags: ["Users"],
            transformErrorResponse: (response) => {
                if (response?.status === 500) {
                    return {
                        status: response.status,
                        data: {
                            message: "Could not update user role. Please try again later.",
                            originalError: response.data
                        }
                    };
                }
                return response;
            }
        })
    })
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation,
    useGetAllUsersQuery,
    useGetDatabaseStatsQuery,
    useVerifyPhoneMutation,
    useResendOTPMutation,
    useUpdateUserRoleMutation
} = authApi;