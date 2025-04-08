import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// Use relative URL to leverage the Vite proxy configuration
const COURSE_PURCHASE_API = `${import.meta.env.VITE_BACKEND_URL}/api/v1/purchase`;

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
    prepareHeaders: (headers) => {                     //prepareHeaders is to pass headers to all enpoints below
      const token = localStorage.getItem("userToken");
      if (token) {
        headers.set("Authorization",  `${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Purchase', 'CourseStatus', 'AccessRequests'],
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (courseId) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId },
      }),
    }),
    enrollFreeCourse: builder.mutation({
      query: (courseId) => ({
        url: "/enroll-free",
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ['CourseStatus', 'Purchase']
    }),
    requestAccess: builder.mutation({
      query: (courseId) => ({
        url: "/request-access",
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ['CourseStatus', 'AccessRequests']
    }),
    getPurchaseRequests: builder.query({
      query: () => {
        const token = localStorage.getItem("userToken"); // Retrieve token from localStorage
        return {
          url: "/access-requests",
          method: "GET",
          headers: {
            Authorization: `${token}`, // Attach token in Authorization header
          },
        };
      },
      providesTags: ['AccessRequests']
    }),
    getPendingRequestsCount: builder.query({
      query: () => ({
        url: "/access-requests/pending-count",
        method: "GET",
      }),
      providesTags: ['AccessRequests'],
      transformResponse: (response) => {
        return response.pendingCount || 0;
      }
    }),
    updatePurchaseStatus: builder.mutation({
      query: ({ requestId, status, reason }) => ({
        url: `/access-requests/${requestId}`,
        method: 'PATCH',
        body: { status, reason }
      }),
      invalidatesTags: () => [
        'AccessRequests',
        'CourseStatus'
      ]
    }),
    deletePurchaseRequest: builder.mutation({
      query: (requestId) => ({
        url: `/access-requests/${requestId}`,
        method: "DELETE"
      }),
      invalidatesTags: ['AccessRequests']
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
      providesTags: ['CourseStatus']
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
      providesTags: ['Purchase']
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useEnrollFreeCourseMutation,
  useRequestAccessMutation,
  useGetPurchaseRequestsQuery,
  useGetPendingRequestsCountQuery,
  useUpdatePurchaseStatusMutation,
  useDeletePurchaseRequestMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
} = purchaseApi;