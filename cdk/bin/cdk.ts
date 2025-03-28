import * as cdk from 'aws-cdk-lib';
import {FrontendStack} from '../lib/frontend-stack';
import {settings} from "../lib/settings";

const app = new cdk.App();

new FrontendStack(app, 'FrontendStack', {
    ...settings,
});
