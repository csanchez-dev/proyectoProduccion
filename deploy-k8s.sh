#!/bin/bash
set -e

echo "Building Docker images for local Kubernetes..."
docker build -t auth-service:v1 ./services/auth-service
docker build -t agenda-service:v1 ./services/agenda-service
docker build -t inscription-service:v1 ./services/inscription-service
docker build -t notification-service:v1 ./services/notification-service
docker build -t backend-gateway:v1 ./services/backend
docker build -t frontend-app:v1 ./frontend/vite-project

echo "Checking if Minikube is used and images need to be loaded..."
if command -v minikube &> /dev/null; then
    if minikube status | grep -q "host: Running"; then
        echo "Minikube detected. Loading images into Minikube cluster..."
        minikube image load auth-service:v1
        minikube image load agenda-service:v1
        minikube image load inscription-service:v1
        minikube image load notification-service:v1
        minikube image load backend-gateway:v1
        minikube image load frontend-app:v1
    fi
fi

echo "Applying Kubernetes manifests..."
kubectl apply -f ./k8s-manifests/

echo "Deployment applied. Check status with 'kubectl get pods'."
