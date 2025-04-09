import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack";
import { BackendStack } from "../lib/backend-stack";
import { settings } from "../lib/settings";

const app = new cdk.App();

new FrontendStack(app, "FrontendStack", {
  ...settings,
});

new BackendStack(app, "BackendStack", {
  ...settings,
});
