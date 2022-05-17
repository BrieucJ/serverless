data "aws_acm_certificate" "issued" {
  domain  = "*.${var.domain_name}"
  statuses = ["ISSUED"]
}

data "terraform_remote_state" "route53_zone" {
  backend = "local"
  config = {
    path = "../common/terraform.tfstate"
  }
}

resource "aws_route53_record" "dns_record" {
  zone_id = data.terraform_remote_state.route53_zone.outputs.aws_route53_zone_id 
  name = "api-dev.${var.domain_name}"
  type = "A"
  alias {
    name = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = true
  }
}