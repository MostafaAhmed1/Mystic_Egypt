// Centralized API endpoint definitions.
// NEVER hardcode API route strings elsewhere in the codebase.
// All API calls must reference these constants.

export const API_ENDPOINTS = {
  AUTH: {
    // NextAuth.js built-in endpoints (sign in / out / session / csrf / callback).
    LOGIN: "/api/auth/signin",
    LOGOUT: "/api/auth/signout",
    ME: "/api/auth/me",
  },
  TOURS: {
    LIST: "/api/tours",
    BY_SLUG: (slug: string) => `/api/tours/${slug}`,
  },
  BOOKINGS: {
    CREATE: "/api/bookings",
    LIST: "/api/bookings",
    BY_ID: (id: string) => `/api/bookings/${id}`,
    UPLOAD_RECEIPT: (id: string) => `/api/bookings/${id}/receipt`,
    CANCEL: (id: string) => `/api/bookings/${id}/cancel`,
  },
  CUSTOMIZATION: {
    CREATE: "/api/customization-requests",
  },
  WISHLIST: {
    TOGGLE: "/api/wishlist",
    LIST: "/api/wishlist",
  },
  INVOICES: {
    LIST: "/api/invoices",
    BY_BOOKING: (bookingId: string) => `/api/invoices/${bookingId}`,
  },
  ADMIN: {
    TOURS: {
      LIST: "/api/admin/tours",
      CREATE: "/api/admin/tours",
      UPDATE: (id: string) => `/api/admin/tours/${id}`,
      DELETE: (id: string) => `/api/admin/tours/${id}`,
    },
    BOOKINGS: {
      LIST: "/api/admin/bookings",
      UPDATE_STATUS: (id: string) => `/api/admin/bookings/${id}/status`,
    },
    DASHBOARD: "/api/admin/dashboard",
    ADMINS: "/api/admin/admins",
  },
  CMS: {
    PAGES: "/api/cms/pages",
    PAGE_BY_SLUG: (slug: string) => `/api/cms/pages/${slug}`,
    BLOG: "/api/cms/blog",
  },
  WEBHOOKS: {
    STRIPE: "/api/webhooks/stripe",
  },
} as const;
