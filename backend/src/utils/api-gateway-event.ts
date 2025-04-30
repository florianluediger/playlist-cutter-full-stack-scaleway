export interface ApiGatewayEvent {
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
