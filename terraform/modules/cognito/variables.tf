variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "callback_urls" {
  description = "Callback URLs for OAuth"
  type        = list(string)
  default     = ["http://localhost:3000/callback"]
}

variable "logout_urls" {
  description = "Logout URLs"
  type        = list(string)
  default     = ["http://localhost:3000"]
}

variable "cognito_domain" {
  description = "Custom Cognito domain prefix (leave empty for auto-generated)"
  type        = string
  default     = ""
}

variable "access_token_validity" {
  description = "Access token validity in hours"
  type        = number
  default     = 1
}

variable "id_token_validity" {
  description = "ID token validity in hours"
  type        = number
  default     = 1
}

variable "refresh_token_validity" {
  description = "Refresh token validity in days"
  type        = number
  default     = 30
}
