# 🚀 Minimal Prometheus Setup Guide

This guide walks you through deploying a lightweight Prometheus instance to scrape a Spring Boot app, without extra components like Alertmanager or Node Exporter.

---

## ⚙️ 0. In `prometheus` directory

```bash
cd /Users/tommy/Development/ott-pcms/.ignored/prometheus/prometheus
```

## ⚙️ 1. Create `prometheus-values.yaml`

```yaml
serverFiles:
  prometheus.yml:
    scrape_configs:
      - job_name: 'frontend-external-feed-generator'
        metrics_path: /prometheus
        scheme: http
        static_configs:
          - targets:
              - frontend-external-feed-generator.stable-int.svc.cluster.local:9034

# Disable all extras
prometheus-node-exporter:
  enabled: false

alertmanager:
  enabled: false

kubeStateMetrics:
  enabled: false

prometheus-pushgateway:
  enabled: false
```

---

## 🏗️ 2. Render the Helm chart

```bash
helm template prometheus ./ \
  -f prometheus-values.yaml \
  --namespace prometheus \
  --include-crds \
  --create-namespace > prometheus.yaml
```

---

## 🧼 3. Optional: Clean previous Helm resources

```bash
kubectl delete all,cm,secret,sa,role,rolebinding,svc,deploy,sts,ds,pvc \
  -n prometheus \
  --context=aws-nbcu-atom-aio-dev \
  --selector "app.kubernetes.io/managed-by=Helm"
```

## 3.5 Create the namespace
```bash
kubectl create namespace prometheus
```


---

## 🚀 4. Apply the rendered manifest

```bash
kubectl apply -f prometheus.yaml --context=aws-nbcu-atom-aio-dev
```

---

## 🔌 5. Access Prometheus Web UI

```bash
kubectl port-forward -n prometheus svc/prometheus-server 9090:80 \
  --context=aws-nbcu-atom-aio-dev
```

Then visit: [http://localhost:9090](http://localhost:9090)

---

## 🔍 6. Prometheus Query Examples

| Description                          | Query |
|--------------------------------------|-------|
| Target status                        | `up{job="frontend-external-feed-generator"}` |
| All metrics for job                  | `{job="frontend-external-feed-generator"}` |
| Request rate (1m)                    | `rate(http_server_requests_seconds_count[1m])` |
| 95th percentile latency              | `histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri))` |
| 5xx error rates                      | `sum by (uri, status) (rate(http_server_requests_seconds_count{status=~"5.."}[1m]))` |

---
