variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the instance will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "Private subnet IDs for the instance"
  type        = list(string)
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "Optional AMI ID override"
  type        = string
  default     = ""
}

variable "s3_bucket_arn" {
  description = "Optional S3 bucket ARN for read access"
  type        = string
  default     = ""
}
