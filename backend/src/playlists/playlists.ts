import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";

export interface PlaylistsApiProps {
  env: {
    account: string;
    region: string;
  };
  api: RestApi;
}

export class PlaylistsApi extends Construct {
  constructor(scope: Construct, id: string, props: PlaylistsApiProps) {
    super(scope, id);
    const playlistApiFunction = new NodejsFunction(this, "function");

    playlistApiFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ssm:DescribeParameters"],
        resources: ["*"],
      })
    );

    playlistApiFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
          "ssm:GetParameterHistory",
        ],
        resources: [
          `arn:aws:ssm:${props.env.region}:${props.env.account}:parameter/playlist-cutter/spotify-credentials`,
        ],
      })
    );

    playlistApiFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["kms:Decrypt", "kms:DescribeKey"],
        resources: [
          `arn:aws:kms:${props.env.region}:${props.env.account}:alias/aws/ssm`,
        ],
      })
    );

    const integration = new apigateway.LambdaIntegration(playlistApiFunction);

    const apiResource = props.api.root.addResource("playlists");
    apiResource.addMethod("GET", integration);
  }
}
