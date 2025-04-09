import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as cm from "aws-cdk-lib/aws-certificatemanager";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { PlaylistsApi } from "../../backend/src/playlists/playlists";

export interface BackendStackProps extends cdk.StackProps {
  domainName: string;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.domainName,
    });

    const certificate = new cm.Certificate(this, "Certificate", {
      domainName: "api." + props.domainName,
      validation: cm.CertificateValidation.fromDns(hostedZone),
    });

    const api = new apigateway.RestApi(this, "PlaylistCutterApi", {
      restApiName: "Playlist Cutter API",
      description: "API for the Playlist Cutter application",
      domainName: {
        domainName: "api." + props.domainName,
        certificate: certificate,
      },
    });

    new PlaylistsApi(this, "PlaylistsApi", {
      api: api,
    });

    new route53.ARecord(this, "ApiDnsRecord", {
      zone: hostedZone,
      recordName: "api",
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGateway(api)
      ),
    });
  }
} 