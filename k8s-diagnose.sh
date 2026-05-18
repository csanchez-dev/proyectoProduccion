#!/bin/bash

echo "Generando diagnósticos de Kubernetes..."

# 1. Describir nodos
kubectl describe nodes > diagnostico-nodos.txt
echo "✓ diagnostico-nodos.txt generado"

# 2. Obtener pods en formato YAML
kubectl get pods -o yaml > diagnostico-pods.yaml
echo "✓ diagnostico-pods.yaml generado"

# 3. Describir pods detalladamente
kubectl describe pods > diagnostico-pods-detalle.txt
echo "✓ diagnostico-pods-detalle.txt generado"

# 4. Obtener logs (Corregido para obtener logs de todos los pods disponibles)
echo "Obteniendo logs de todos los pods..."
> diagnostico-logs.txt
kubectl get pods -A -o custom-columns=NS:.metadata.namespace,NAME:.metadata.name --no-headers | while read ns pod; do
    echo "================================================================================" >> diagnostico-logs.txt
    echo "NAMESPACE: $ns | POD: $pod" >> diagnostico-logs.txt
    echo "================================================================================" >> diagnostico-logs.txt
    kubectl logs -n "$ns" "$pod" --all-containers --prefix --tail=50 >> diagnostico-logs.txt 2>&1
done
echo "✓ diagnostico-logs.txt generado"

echo "=== Proceso finalizado ==="
