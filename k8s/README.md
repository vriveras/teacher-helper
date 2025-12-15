# Kubernetes Manifests

This directory will contain Kubernetes deployment manifests for Azure AKS.

## Planned Structure
```
k8s/
├── base/
│   ├── namespace.yaml
│   ├── api-deployment.yaml
│   ├── api-service.yaml
│   ├── web-deployment.yaml
│   ├── web-service.yaml
│   └── ingress.yaml
├── overlays/
│   ├── dev/
│   │   └── kustomization.yaml
│   ├── staging/
│   │   └── kustomization.yaml
│   └── prod/
│       └── kustomization.yaml
└── secrets/
    └── .gitkeep
```

## Prerequisites
- Azure AKS cluster
- kubectl configured
- Helm (optional)

## External Services (Azure Managed)
- PostgreSQL: Azure Database for PostgreSQL
- Neo4j: Neo4j Aura or self-hosted on AKS
- Redis: Azure Cache for Redis

## Deployment
```bash
# Apply to dev environment
kubectl apply -k k8s/overlays/dev/

# Apply to production
kubectl apply -k k8s/overlays/prod/
```
