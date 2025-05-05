export interface ApiGatewayEvent {
    httpMethod: string,
    path: string,
    body: string,
    queryStringParameters: {
        code?: string
    },
    headers: {
        cookie?: string,
        Cookie?: string
    }
}
