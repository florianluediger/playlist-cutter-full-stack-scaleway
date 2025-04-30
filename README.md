# Playlist Cutter for Spotify

This tool allows users to generate new playlists by cutting songs out of existing playlists.
The basic principle looks like this:

**_Give me all songs from playlists X but exclude all songs from playlist Y_**

You can access the application here to see what it looks like: https://florianluediger.github.io/playlist-cutter/

## Deployment

### Building the backend

`npm -w backend run build && npm -w backend run package`

### Deploying the infrastructure

Put your Scaleway API credentials in the Scaleway configuration file.
[Have a look at the documentation here.](https://www.scaleway.com/en/docs/terraform/reference-content/scaleway-configuration-file/)
Afterward, you can deploy via terraform.

```
terraform init
terraform apply
```

### Adding Spotify credentials

You need to add the credentials of your Spotify API manually.
Navigate to the Scaleway console and go to the Secrets Manager.
You should find a secret under /playlist-cutter/spotify-credentials.
Create a new version and put in the following values.

```
{
    "clientId": "<your client id here>",
    "clientSecret":"<your client secret here>"
}
```

### Building the frontend

`npm -w frontend run build`

### Deploying the frontend

You can deploy the frontend files using the AWS cli.
You need to create a profile for the Scaleway credentials first.
[Have a look at the documentation here.](https://www.scaleway.com/en/docs/object-storage/api-cli/object-storage-aws-cli/)
Then you can deploy the frontend.

`npm -w frontend run deploy`

## Architecture overview

![Architecture overview](architecture_overview.svg)

## Authentication flow

![Authentication flow](authentication_flow.svg)

## Accessing Spotify API

![Accessing Spotify API](spotify_access_flow.svg)
