import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoClient = new DynamoDBClient({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  try {
    // Extract userId from the cookie
    const cookies = event.headers.Cookie || event.headers.cookie || "";
    const userIdCookie = cookies
      .split(";")
      .find((cookie) => cookie.trim().startsWith("userId="));
    const userId = userIdCookie ? userIdCookie.split("=")[1] : null;

    if (!userId) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": frontendUrl,
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify({
          isAuthenticated: false,
          error: "No userId cookie found",
        }),
      };
    }

    // Get the user's information from DynamoDB
    const getUserCommand = new GetItemCommand({
      TableName: process.env.USERS_TABLE_NAME || "playlist-cutter-users",
      Key: {
        userId: { S: userId },
      },
    });

    const userResponse = await dynamoClient.send(getUserCommand);

    if (!userResponse.Item) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": frontendUrl,
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify({
          isAuthenticated: false,
          error: "User not found",
        }),
      };
    }

    const user = unmarshall(userResponse.Item);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
          "Access-Control-Allow-Origin": frontendUrl,
          "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({
        isAuthenticated: true,
      }),
    };
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
          "Access-Control-Allow-Origin": frontendUrl,
          "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({
        isAuthenticated: false,
        error: "Internal server error",
      }),
    };
  }
}; 