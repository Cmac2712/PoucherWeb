# SES Module
# Creates SES email identity for sending E2E test report emails

resource "aws_ses_email_identity" "sender" {
  email = var.sender_email
}

# IAM policy for sending emails via SES
resource "aws_iam_policy" "ses_send" {
  name        = "${var.project_name}-ses-send-email"
  description = "Allow sending emails via SES for E2E test reports"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSendEmail"
        Effect = "Allow"
        Action = [
          "ses:SendRawEmail",
          "ses:SendEmail"
        ]
        Resource = aws_ses_email_identity.sender.arn
      }
    ]
  })
}
