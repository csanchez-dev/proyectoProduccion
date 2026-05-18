Write-Host "Generando diagnósticos de Kubernetes (PowerShell)..."

# 1. Describir nodos
kubectl describe nodes | Out-File -FilePath "diagnostico-nodos.txt" -Encoding utf8
Write-Host "✓ diagnostico-nodos.txt generado"

# 2. Obtener pods en formato YAML
kubectl get pods -o yaml | Out-File -FilePath "diagnostico-pods.yaml" -Encoding utf8
Write-Host "✓ diagnostico-pods.yaml generado"

# 3. Describir pods detalladamente
kubectl describe pods | Out-File -FilePath "diagnostico-pods-detalle.txt" -Encoding utf8
Write-Host "✓ diagnostico-pods-detalle.txt generado"

# 4. Obtener logs de todos los pods
Write-Host "Obteniendo logs de todos los pods..."
$pods = kubectl get pods -A -o json | ConvertFrom-Json
$logContent = ""

foreach ($pod in $pods.items) {
    $ns = $pod.metadata.namespace
    $name = $pod.metadata.name
    $logContent += "`n================================================================================`n"
    $logContent += "NAMESPACE: $ns | POD: $name`n"
    $logContent += "================================================================================`n"
    
    # Intentar obtener logs (puede fallar si el pod no ha iniciado)
    $logs = kubectl logs -n $ns $name --all-containers --prefix --tail=50 2>&1
    $logContent += $logs
}

$logContent | Out-File -FilePath "diagnostico-logs.txt" -Encoding utf8
Write-Host "✓ diagnostico-logs.txt generado"

Write-Host "=== Proceso finalizado ==="
