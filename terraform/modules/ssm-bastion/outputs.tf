output "instance_id" {
  description = "ID of the SSM bastion instance"
  value       = aws_instance.bastion.id
}

output "security_group_id" {
  description = "Security group ID for the SSM bastion"
  value       = aws_security_group.bastion.id
}
