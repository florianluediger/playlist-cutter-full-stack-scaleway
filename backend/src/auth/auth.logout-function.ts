import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { getUserIdFromCookie } from "../utils/auth-utils";

const dynamoClient = new DynamoDBClient({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const userId = getUserIdFromCookie(event);

    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": frontendUrl,
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify({ error: "User ID not found" }),
      };
    }

    // Delete the user's information from DynamoDB
    const deleteUserCommand = new DeleteItemCommand({
      TableName: process.env.USERS_TABLE_NAME || "playlist-cutter-users",
      Key: marshall({
        userId,
      }),
    });

    await dynamoClient.send(deleteUserCommand);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": frontendUrl,
        "Access-Control-Allow-Credentials": "true",
        "Set-Cookie":
          "userId=; Domain=luediger.link; Path=/; SameSite=None; Secure; Max-Age=0",
      },
      body: JSON.stringify({ message: "Logged out successfully" }),
    };
  } catch (error) {
    console.error("Error during logout:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Logout failed" }),
    };
  }
};
