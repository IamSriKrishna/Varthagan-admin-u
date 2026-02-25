# Infrastructure Requirements

## DNS Configuration

- **Domain**: `dev-admin.bbcloud.app`
- **Type**: A record or CNAME
- **Target**: Cluster ingress IP/hostname
- **Repository**: Configure in infra repository

## Traefik Ingress Configuration

Configure in the infra repository with the following specifications:

```yaml
# Traefik ingress rule for admin UI
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: admin-ui-ingress
  namespace: bbapp-dev
  annotations:
    kubernetes.io/ingress.class: traefik
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    traefik.ingress.kubernetes.io/router.tls: "true"
spec:
  tls:
    - hosts:
        - dev-admin.bbcloud.app
      secretName: bbcloud-app-tls
  rules:
    - host: dev-admin.bbcloud.app
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: admin-ui-service
                port:
                  number: 80
```

## Service Configuration

The admin UI service is already configured as:

- **Service Name**: `admin-ui-service`
- **Namespace**: `bbapp-dev`
- **Port**: `80` (maps to container port `3000`)
- **Type**: `ClusterIP`

## Resource Optimization

Current deployment is optimized for single-node environment:

- **CPU Requests**: `25m`
- **CPU Limits**: `100m`
- **Memory Requests**: `128Mi`
- **Memory Limits**: `256Mi`

## Access

Once DNS and ingress are configured, the admin UI will be accessible at:
**https://dev-admin.bbcloud.app**

## Testing

For local testing during development, use port forwarding:

```bash
kubectl port-forward svc/admin-ui-service -n bbapp-dev 3000:80
```

Then access at: http://localhost:3000
