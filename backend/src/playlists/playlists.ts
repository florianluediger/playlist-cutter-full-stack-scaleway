import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export interface PlaylistsApiProps {
  env: {
    account: string;
    region: string;
  };
  api: RestApi;
  usersTable: dynamodb.Table;
  frontendDomainName: string;
}

export class PlaylistsApi extends Construct {
  constructor(scope: Construct, id: string, props: PlaylistsApiProps) {
    super(scope, id);
    const playlistApiFunction = new NodejsFunction(this, "function", {
      environment: {
        FRONTEND_URL: `https://${props.frontendDomainName}`,
        USERS_TABLE_NAME: props.usersTable.tableName,
      },
    });

    playlistApiFunction.addEnvironment(
      "USERS_TABLE_NAME",
      props.usersTable.tableName
    );

    const playlistGenerationFunction = new NodejsFunction(this, "generation", {
      environment: {
        FRONTEND_URL: `https://${props.frontendDomainName}`,
        USERS_TABLE_NAME: props.usersTable.tableName,
      },
    });

    playlistGenerationFunction.addEnvironment(
      "USERS_TABLE_NAME",
      props.usersTable.tableName
    );

    [playlistApiFunction, playlistGenerationFunction].forEach((fn) => {
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["kms:Decrypt", "kms:DescribeKey"],
          resources: [
            `arn:aws:kms:${props.env.region}:${props.env.account}:alias/aws/ssm`,
          ],
        })
      );
    });

    [playlistApiFunction, playlistGenerationFunction].forEach((fn) => {
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["dynamodb:GetItem"],
          resources: [props.usersTable.tableArn],
        })
      );
    });

    const integration = new apigateway.LambdaIntegration(playlistApiFunction);
    const generationIntegration = new apigateway.LambdaIntegration(
      playlistGenerationFunction
    );

    const apiResource = props.api.root.addResource("playlists");
    apiResource.addMethod("GET", integration);

    const generationResource = apiResource.addResource("generation");
    generationResource.addMethod("POST", generationIntegration);

    const corsConfig = {
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,Cookie'",
            "method.response.header.Access-Control-Allow-Methods":
              "'GET,POST,OPTIONS'",
            "method.response.header.Access-Control-Allow-Origin": `'https://${props.frontendDomainName}'`,
            "method.response.header.Access-Control-Allow-Credentials": "'true'",
            "method.response.header.Access-Control-Expose-Headers":
              "'Set-Cookie'",
          },
        },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
    };

    const corsMethodResponse = {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Expose-Headers": true,
          },
        },
      ],
    };

    // Add OPTIONS method for CORS preflight requests
    generationResource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration(corsConfig),
      corsMethodResponse
    );
    apiResource.addMethod(
      "OPTIONS",
      new apigateway.MockIntegration(corsConfig),
      corsMethodResponse
    );
  }
}
