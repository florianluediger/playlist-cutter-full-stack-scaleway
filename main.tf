terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
  required_version = ">= 0.13"
}

provider "scaleway" {
  zone   = "fr-par-1"
  region = "fr-par"
}

resource "scaleway_account_project" "playlist_cutter" {
  name = "playlist-cutter"
}

resource "scaleway_cockpit_grafana_user" "grafana_user" {
  project_id = scaleway_account_project.playlist_cutter.id
  login = "playlist-cutter"
  role  = "editor"
}

resource "scaleway_object_bucket" "website_bucket" {
  project_id = scaleway_account_project.playlist_cutter.id
  name = "www.luediger.link"
}

resource "scaleway_object_bucket_policy" "main" {
  project_id = scaleway_account_project.playlist_cutter.id
  bucket = scaleway_object_bucket.website_bucket.id
  policy = jsonencode(
    {
      "Version" = "2012-10-17",
      "Id" = "MyPolicy",
      "Statement" = [
        {
          "Sid" = "GrantToEveryone",
          "Effect" = "Allow",
          "Principal" = "*",
          "Action" = [
            "s3:GetObject"
          ],
          "Resource":[
            "www.luediger.link/*"
          ]
        }
      ]
    })
}

resource "scaleway_object_bucket_website_configuration" "website_bucket_configuration" {
  project_id = scaleway_account_project.playlist_cutter.id
  bucket = scaleway_object_bucket.website_bucket.id
  index_document {
    suffix = "index.html"
  }
}

resource "scaleway_domain_record" "www" {
  project_id = scaleway_account_project.playlist_cutter.id
  data     = "${scaleway_object_bucket_website_configuration.website_bucket_configuration.website_endpoint}."
  dns_zone = var.domain_name
  name = "www"
  type     = "ALIAS"
}

resource "random_password" "redis_password" {
  min_upper = 1
  min_lower = 1
  min_special = 1
  min_numeric = 1
  length           = 20
}

resource "scaleway_redis_cluster" "main" {
  project_id = scaleway_account_project.playlist_cutter.id
  name         = "playlist-cutter-users"
  version      = "7.0.5"
  node_type    = "RED1-MICRO"
  user_name    = "playlist-cutter"
  password     = random_password.redis_password.result
  cluster_size = 1
  tls_enabled  = "true"

  acl {
    ip          = "0.0.0.0/0"
    description = "Allow all"
  }
}

resource "scaleway_function_namespace" "backend" {
  project_id = scaleway_account_project.playlist_cutter.id
  name = "backend"
}

resource "scaleway_secret" "spotify_credentials" {
  project_id = scaleway_account_project.playlist_cutter.id
  path = "/playlist-cutter"
  name = "spotify-credentials"
}

resource "scaleway_iam_application" "playlist_cutter_backend" {
  name = "playlist-cutter-backend"
}

resource "scaleway_iam_policy" "playlist_cutter_backend" {
  name = "playlist-cutter-backend-policy"
  application_id = scaleway_iam_application.playlist_cutter_backend.id
  rule {
    organization_id = scaleway_iam_application.playlist_cutter_backend.organization_id
    permission_set_names = ["SecretManagerFullAccess"]
  }
}

resource "scaleway_iam_api_key" "playlist_cutter_backend" {
  application_id = scaleway_iam_application.playlist_cutter_backend.id
}

resource "scaleway_function" "backend_handler" {
  project_id = scaleway_account_project.playlist_cutter.id
  namespace_id = scaleway_function_namespace.backend.id
  name = "backend-handler"
  privacy      = "public"
  runtime      = "node22"
  handler      = "backend-handler/index.handle"
  zip_file = "backend/build/backend-handler.zip"
  zip_hash = filesha256("backend/build/backend-handler.zip")
  deploy = true
  http_option = "redirected"
  secret_environment_variables = {
    SCALEWAY_ACCESS_KEY = scaleway_iam_api_key.playlist_cutter_backend.access_key
    SCALEWAY_SECRET_KEY = scaleway_iam_api_key.playlist_cutter_backend.secret_key
    REDIS_USER = "playlist-cutter"
    REDIS_PASSWORD = random_password.redis_password.result
  }
  environment_variables = {
    PROJECT_ID = scaleway_account_project.playlist_cutter.id
    REDIRECT_URI = "https://${var.api_domain_name}/auth/spotify/callback"
    REDIS_HOST = scaleway_redis_cluster.main.public_network[0].ips[0]
    REDIS_PORT = scaleway_redis_cluster.main.public_network[0].port
    FRONTEND_URL = "https://${var.frontend_domain_name}"
    SPOTIFY_SECRET_PATH = scaleway_secret.spotify_credentials.path
    SPOTIFY_SECRET_NAME = scaleway_secret.spotify_credentials.name
  }
}

resource "scaleway_function_domain" "backend_domain" {
  function_id = scaleway_function.backend_handler.id
  hostname    = var.api_domain_name
}

resource "scaleway_domain_record" "api" {
  project_id = scaleway_account_project.playlist_cutter.id
  data     = "${scaleway_function.backend_handler.domain_name}."
  dns_zone = var.domain_name
  name = "api"
  type     = "ALIAS"
}
