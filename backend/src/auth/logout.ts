import {getUserIdFromRecordCookie} from "../utils/auth-utils";
import {RedisClientType} from "redis";
import {ApiGatewayEvent} from "../utils/api-gateway-event";

export async function logoutUser(event: ApiGatewayEvent, redisClient: RedisClientType<any, any, any>, frontendUrl: string) {

    const userId = getUserIdFromRecordCookie(event);

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

    await redisClient.connect();
    await redisClient.del(userId);
    await redisClient.disconnect();

    return {
        statusCode: 302,
        headers: {
            Location: frontendUrl,
            "Access-Control-Allow-Origin": frontendUrl,
            "Access-Control-Allow-Credentials": "true",
            "Set-Cookie": `userId=${userId}; Domain=luediger.link; Path=/; SameSite=None; Secure`,
        },
        body: "",
    };
}
