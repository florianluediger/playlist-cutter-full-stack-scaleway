import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log("Event: ", event);
    const playlists = [
      "Hello",
      "World",
      "Playlist Cutter",
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // For CORS support
      },
      body: JSON.stringify(playlists),
    };
}; 