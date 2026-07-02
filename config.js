const BASE_URL =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://akhyanfoundationback.onrender.com";

const API_PATHS = {
  REGISTER: `${BASE_URL}/api/admin/register`,
  LOGIN: `${BASE_URL}/api/admin/login`,
  PROFILE: `${BASE_URL}/api/admin/profile`,

  ACTIVITY_CALENDAR: `${BASE_URL}/api/activity-calendar`,
  ADMIN_GALLERY: `${BASE_URL}/api/admin-gallery`,
  ADMIN_BLOG: `${BASE_URL}/api/admin-blog`,
  PRESS_COVERAGE: `${BASE_URL}/api/press-coverage`,

  UPCOMING_EVENT: `${BASE_URL}/api/upcoming-events`,
  DOCUMENTS: `${BASE_URL}/api/documents`,
  AUDIT_DOCUMENTS: `${BASE_URL}/api/audit-documents`,
  POLICY_DOCUMENTS: `${BASE_URL}/api/policy-documents`,
  DONORS: `${BASE_URL}/api/donors`,
};