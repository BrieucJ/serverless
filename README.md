## Boilerplate serverless GraphQL API

##### Technologies:

apollo | express | graphql | husky | jest | jsonwebtoken | node | mongodb | mongoose | terraform | typescript | winston

##### TERRAFORM
run ```yarn compile```
export AWS_ACCESS_KEY_ID="<YOUR_AWS_ACCESS_KEY_ID>"
export AWS_SECRET_ACCESS_KEY="<YOUR_AWS_SECRET_ACCESS_KEY>"
export AWS_DEFAULT_REGION="<YOUR_AWS_DEFAULT_REGION>"
export MONGODB_ATLAS_PUBLIC_KEY="<YOUR_MONGODB_ATLAS_PUBLIC_KEY>"
export MONGODB_ATLAS_PRIVATE_KEY="<YOUR_MONGODB_ATLAS_PRIVATE_KEY>"

Deploy infrasctrucure:
- Common: terraform -chdir='./infra/dev' apply -auto-approve
- Development: terraform -chdir='./infra/dev' apply -var-file="dev.tfvars" -auto-approve
- Production: terraform -chdir='./infra/prod' apply -var-file="prod.tfvars" -auto-approve

<!-- ##### Create databases
```sh
> development
 docker run -d -p 27017:27017 -e MONGODB_INITDB_ROOT_PASSWORD=password -e MONGODB_INITDB_ROOT_USERNAME=username  -e MONGO_INITDB_DATABASE=dev_DB --name mongo_development mongo:latest
> test
 docker run -d -p 27016:27017 -e MONGODB_INITDB_ROOT_PASSWORD=password -e MONGODB_INITDB_ROOT_USERNAME=username  -e MONGO_INITDB_DATABASE=test_DB --name mongo_test mongo:latest
``` -->

##### Start

```sh
yarn install
yarn dev
```

##### DOMAIN NAME (IONOS)
Import into AWS Certificate Manager
A:
- ssl_certificate
- ssl_certificate_INTERMEDIATE
- private_key

B Copy aws' name servers into IONOS


