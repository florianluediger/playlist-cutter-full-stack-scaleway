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

export const getUnauthorizedResponse = () => ({
  statusCode: 401,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify({
    error: "Unauthorized: User ID not found in cookie",
  }),
});
