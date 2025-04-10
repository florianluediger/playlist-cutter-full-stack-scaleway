import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as cm from "aws-cdk-lib/aws-certificatemanager";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { PlaylistsApi } from "../../backend/src/playlists/playlists";
import { AuthApi } from "../../backend/src/auth/auth";

export interface BackendStackProps extends cdk.StackProps {
  env: {
    region: string;
    account: string;
  };
  domainName: string;
  apiDomainName: string;
  frontendDomainName: string;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.domainName,
    });

    const certificate = new cm.Certificate(this, "Certificate", {
      domainName: props.apiDomainName,
      validation: cm.CertificateValidation.fromDns(hostedZone),
    });

    const api = new apigateway.RestApi(this, "PlaylistCutterApi", {
      restApiName: "Playlist Cutter API",
      description: "API for the Playlist Cutter application",
      domainName: {
        domainName: props.apiDomainName,
        certificate: certificate,
      },
    });

    // Create a DynamoDB table to store user tokens
    const usersTable = new dynamodb.Table(this, "UsersTable", {
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development, use RETAIN for production
    });

    // Create the authentication API
    new AuthApi(this, "AuthApi", {
      ...props,
      api: api,
      usersTable: usersTable,
    });

    // Create the playlists API with the users table
    new PlaylistsApi(this, "PlaylistsApi", {
      ...props,
      api: api,
      usersTable: usersTable,
    });

    new route53.ARecord(this, "ApiDnsRecord", {
      zone: hostedZone,
      recordName: "api",
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(api)),
    });
  }
}
