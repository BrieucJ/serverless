resource "mongodbatlas_project" "project" {
  name = local.mongo_project_name
  org_id = "626bf5b942020521a4c377c7"
}

resource "mongodbatlas_project_ip_access_list" "access" {
  project_id = mongodbatlas_project.project.id
  cidr_block= "0.0.0.0/0"
  comment = "${var.environment} database accessible from anywhere"
}

resource "mongodbatlas_cluster" "cluster" {
  project_id = mongodbatlas_project.project.id
  name = local.cluster_name
  provider_name = "TENANT"
  backing_provider_name = "AWS"
  provider_region_name = var.atlas_region
  provider_instance_size_name = var.database_instance_size
  cluster_type = "REPLICASET"
  replication_specs {
    num_shards = 1
    regions_config {
      region_name = var.atlas_region
      electable_nodes = 3
      priority = 7
      read_only_nodes = 0
    }
  }
#   cloud_backup = true
#   auto_scaling_disk_gb_enabled = false
  mongo_db_major_version = "5.0"
}

resource "mongodbatlas_database_user" "user" {
  username = var.mongodbatlas_user
  password = var.mongodbatlas_password
  project_id = mongodbatlas_project.project.id
  auth_database_name = "admin"
  roles {
    role_name = "dbAdmin"
    database_name = var.mongodbatlas_database_name
  }
}

