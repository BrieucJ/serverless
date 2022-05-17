data "aws_acm_certificate" "issued" {
  domain  = "*.${var.domain_name}"
  statuses = ["ISSUED"]
}

resource "aws_route53_zone" "primary" {
  name = var.domain_name
}