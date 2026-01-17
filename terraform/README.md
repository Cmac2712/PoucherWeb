# PoucherWeb Terraform Infrastructure

Infrastructure as Code for deploying the PoucherWeb backend to AWS.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           VPC                                    │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │   Public Subnets    │    │   Private Subnets   │            │
│  │                     │    │                     │            │
│  │  ┌───────────────┐  │    │  ┌───────────────┐  │            │
│  │  │ NAT Gateway   │  │    │  │    Lambda     │  │            │
│  │  └───────────────┘  │    │  │   Functions   │  │            │
│  │                     │    │  └───────┬───────┘  │            │
│  └─────────────────────┘    │          │          │            │
│                             │          ▼          │            │
│                             │  ┌───────────────┐  │            │
│                             │  │     RDS       │  │            │
│                             │  │  PostgreSQL   │  │            │
│                             │  └───────────────┘  │            │
│                             └─────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   API Gateway   │     │     Cognito     │     │       S3        │
│    HTTP API     │     │   User Pool     │     │  Screenshots    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Directory Structure

```
terraform/
├── backend/              # S3 + DynamoDB for Terraform state
├── modules/
│   ├── vpc/              # VPC, subnets, NAT Gateway
│   ├── rds/              # PostgreSQL RDS
│   ├── cognito/          # User Pool & App Client
│   ├── lambda/           # Lambda functions & SQS
│   ├── api-gateway/      # HTTP API & routes
│   └── s3/               # Screenshots bucket
└── environments/
    └── prod/             # Production configuration
```

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **IAM Permissions**: User needs permissions for:
   - S3, DynamoDB (state management)
   - VPC, EC2 (networking)
   - RDS, Secrets Manager (database)
   - Cognito (authentication)
   - Lambda, API Gateway (compute)
   - IAM (role creation)
   - CloudWatch (logging)

## Getting Started

### 1. Bootstrap State Backend

First, create the S3 bucket and DynamoDB table for Terraform state:

```bash
cd terraform/backend
terraform init
terraform apply
```

### 2. Package Lambda Functions

Create a deployment package for the Lambda functions:

```bash
cd services
pip install -r requirements.txt -t package/
cp -r shared auth bookmarks tags users screenshot package/
cd package && zip -r ../lambda.zip .
```

### 3. Deploy Infrastructure

```bash
cd terraform/environments/prod
terraform init
terraform plan
terraform apply
```

### 4. Run Database Migrations

After RDS is created, get the credentials and run migrations:

```bash
# Get database password from Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id poucher/db-password \
  --query 'SecretString' --output text | jq -r '.password'

# Connect and run migrations
psql -h <rds-endpoint> -U poucher_admin -d poucher \
  -f services/migrations/001_initial_schema.sql
```

## Configuration

### terraform.tfvars

Edit `terraform/environments/prod/terraform.tfvars`:

```hcl
# Update with your production domain
cognito_callback_urls = [
  "https://yourdomain.com/callback"
]

cognito_logout_urls = [
  "https://yourdomain.com"
]

cors_allowed_origins = [
  "https://yourdomain.com"
]
```

### GitHub Secrets

For CI/CD, add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key with deployment permissions |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/terraform.yml`) provides:

- **On Pull Request**: Runs `terraform plan` and comments the output
- **On Merge to main/master**: Runs `terraform apply`

### Manual Deployment

```bash
cd terraform/environments/prod
terraform plan -out=tfplan
terraform apply tfplan
```

## Outputs

After deployment, Terraform outputs useful values:

```bash
terraform output api_endpoint         # API Gateway URL
terraform output cognito_user_pool_id # For frontend config
terraform output cognito_client_id    # For frontend config
terraform output frontend_env_vars    # Ready-to-use .env content
```

## Destroying Infrastructure

```bash
# First, disable deletion protection on RDS
terraform apply -var="db_deletion_protection=false"

# Then destroy
terraform destroy
```

## Cost Estimation

| Resource | Estimated Monthly Cost |
|----------|----------------------|
| NAT Gateway | ~$32 |
| RDS (db.t3.micro) | ~$15 |
| Lambda | Pay per request |
| API Gateway | Pay per request |
| S3 | Pay per storage |
| **Total (base)** | **~$50/month** |

To reduce costs in development:
- Set `enable_nat_gateway = false` in VPC module
- Use smaller RDS instance
- Make RDS publicly accessible (not recommended for production)

## Troubleshooting

### Lambda can't connect to RDS
- Ensure Lambda is in the same VPC as RDS
- Check security group rules allow port 5432
- Verify NAT Gateway is working for external calls

### API Gateway 500 errors
- Check CloudWatch logs: `/aws/lambda/poucher-*`
- Verify DATABASE_URL environment variable

### Terraform state lock
```bash
terraform force-unlock <lock-id>
```
