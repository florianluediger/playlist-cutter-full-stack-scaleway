import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
  
export interface PlaylistsApiProps {
    api: RestApi;
}

export class PlaylistsApi extends Construct {
  constructor(scope: Construct, id: string, props: PlaylistsApiProps) {
    super(scope, id);
    const playlistApiFunction = new NodejsFunction(this, 'function');
    const integration = new apigateway.LambdaIntegration(playlistApiFunction);

    const apiResource = props.api.root.addResource("playlists");
    apiResource.addMethod("GET", integration);
  }
}