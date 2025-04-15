import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoClient = new DynamoDBClient({});

export interface User {
  userId: string;
  spotifyUserId: string;
  accessToken: string;
  createdAt: number;
}

export interface AuthResult {
  user?: User;
  errorResponse?: APIGatewayProxyResult;
}

export const getUserIdFromCookie = (
  event: APIGatewayProxyEvent
): string | null => {
  const cookies = event.headers.Cookie || event.headers.cookie || "";
  const userIdCookie = cookies
    .split(";")
    .find((cookie) => cookie.trim().startsWith("userId="));
  return userIdCookie ? userIdCookie.split("=")[1] : null;
};

export const getUnauthorizedResponse = (): APIGatewayProxyResult => ({
  statusCode: 401,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify({
    error: "Unauthorized: User ID not found in cookie",
  }),
});

export const getUserNotFoundResponse = (): APIGatewayProxyResult => ({
  statusCode: 404,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify({ error: "User not found" }),
});

export const authenticateUser = async (
  event: APIGatewayProxyEvent
): Promise<AuthResult> => {
  const userId = getUserIdFromCookie(event);

  if (!userId) {
    return { errorResponse: getUnauthorizedResponse() };
  }

  const getUserCommand = new GetItemCommand({
    TableName: process.env.USERS_TABLE_NAME || "playlist-cutter-users",
    Key: marshall({
      userId,
    }),
  });

  const userResponse = await dynamoClient.send(getUserCommand);

  if (!userResponse.Item) {
    return { errorResponse: getUserNotFoundResponse() };
  }

  const user = unmarshall(userResponse.Item) as User;
  return { user };
};
