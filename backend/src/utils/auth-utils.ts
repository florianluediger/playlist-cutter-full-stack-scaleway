import {ApiGatewayEvent} from "./api-gateway-event";

export interface User {
  userId: string;
  spotifyUserId: string;
  accessToken: string;
  createdAt: number;
}

export const getUserIdFromRecordCookie = (
    event: ApiGatewayEvent
): string | null => {
  const cookies = event.headers.Cookie || event.headers.cookie || "";
  const userIdCookie = cookies
      .split(";")
      .find((cookie: string) => cookie.trim().startsWith("userId="));
  return userIdCookie ? userIdCookie.split("=")[1] : null;
};

export const getUnauthorizedResponse = (frontendUrl: string) => ({
  statusCode: 401,
  headers: getResponseHeaders(frontendUrl),
  body: JSON.stringify({
    error: "Unauthorized: User ID not found in cookie",
  }),
});

export const getResponseHeaders = (frontendUrl: string) => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": frontendUrl,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Cookie",
  "Access-Control-Expose-Headers": "Set-Cookie",
});
