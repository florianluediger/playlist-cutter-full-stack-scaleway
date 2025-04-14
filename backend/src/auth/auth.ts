import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export interface AuthApiProps {
  env: {
    account: string;
    region: string;
  };
  api: RestApi;
  usersTable: dynamodb.Table;
  frontendDomainName: string;
  apiDomainName: string;
}

export class AuthApi extends Construct {
  constructor(scope: Construct, id: string, props: AuthApiProps) {
    super(scope, id);

    // Create the Spotify auth function
    const spotifyAuthFunction = new NodejsFunction(
      this,
      "authorization-code-function",
      {
        environment: {
          REDIRECT_URI: `https://${props.apiDomainName}/auth/spotify/callback`,
          FRONTEND_URL: `https://${props.frontendDomainName}`,
        },
      }
    );

    // Create the Spotify callback function
    const spotifyCallbackFunction = new NodejsFunction(this, "token-function", {
      environment: {
        REDIRECT_URI: `https://${props.apiDomainName}/auth/spotify/callback`,
        FRONTEND_URL: `https://${props.frontendDomainName}`,
        USERS_TABLE_NAME: props.usersTable.tableName,
      },
    });

    // Create the status check function
    const statusFunction = new NodejsFunction(this, "status-function", {
      environment: {
        FRONTEND_URL: `https://${props.frontendDomainName}`,
        USERS_TABLE_NAME: props.usersTable.tableName,
      },
    });

    // Create the logout function
    const logoutFunction = new NodejsFunction(this, "logout-function", {
      environment: {
        FRONTEND_URL: `https://${props.frontendDomainName}`,
        USERS_TABLE_NAME: props.usersTable.tableName,
      },
    });

    // Grant permissions to access SSM parameters
    [spotifyAuthFunction, spotifyCallbackFunction].forEach((fn) => {
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["ssm:GetParameter"],
          resources: [
            `arn:aws:ssm:${props.env.region}:${props.env.account}:parameter/playlist-cutter/spotify-credentials`,
          ],
        })
      );
    });

    // Grant permissions to access DynamoDB
    [spotifyCallbackFunction, statusFunction, logoutFunction].forEach((fn) => {
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
          ],
          resources: [props.usersTable.tableArn],
        })
      );
    });

    // Create API Gateway resources and methods
    const authResource = props.api.root.addResource("auth");
    const spotifyResource = authResource.addResource("spotify");
    const callbackResource = spotifyResource.addResource("callback");
    const statusResource = spotifyResource.addResource("status");
    const logoutResource = spotifyResource.addResource("logout");

    // Add methods to the resources
    spotifyResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(spotifyAuthFunction)
    );
    callbackResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(spotifyCallbackFunction)
    );
    statusResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(statusFunction)
    );
    logoutResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(logoutFunction)
    );
  }
}
