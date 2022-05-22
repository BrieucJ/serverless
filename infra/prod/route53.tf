data "aws_acm_certificate" "issued" {
  domain  = "*.${var.domain_name}"
  statuses = ["ISSUED"]
}

resource "aws_route53_record" "dns_record" {
  zone_id = data.terraform_remote_state.common.outputs.aws_route53_zone_id 
  name = var.environment == "prod" ? "api.${var.domain_name}" : "api-${var.environment}.${var.domain_name}"
  type = "A"
  alias {
    name = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = true
  }
}