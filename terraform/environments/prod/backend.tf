# Backend configuration for remote state storage
# Run `terraform init` after creating the backend with terraform/backend

terraform {
  backend "s3" {
    bucket         = "poucher-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "poucher-terraform-locks"
  }
}
