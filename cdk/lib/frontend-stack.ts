import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as cm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

export interface FrontendStackProps extends cdk.StackProps {
  domainName: string
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone",{
      domainName: props.domainName
    })

    const certificate = new cm.DnsValidatedCertificate(this, "Certificate", {
      hostedZone: hostedZone,
      region: "us-east-1",
      domainName: "*." + props.domainName,
    });

    const websiteBucket = new s3.Bucket(this, "FrontendBucket", {
      bucketName: "www.luediger.link",
      websiteIndexDocument: "index.html",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      publicReadAccess: true
    });

    const distribution = new cloudfront.Distribution(this, "CloudfrontDistribution", {
      defaultBehavior: {
        origin: new origins.S3StaticWebsiteOrigin(websiteBucket)
      },
      domainNames: ["www." + props.domainName],
      certificate: certificate,
      defaultRootObject: "index.html"
    });

    new route53.ARecord(this, "CloudfrontAliasRecord", {
      zone: hostedZone,
      recordName: "www",
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });
  }
}

