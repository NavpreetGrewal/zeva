#!/bin/bash

PATRONI_SERVICE_NAME=$1
NAMESPACE=$2

## the value must be running
master_node_state=`curl --silent --show-error http://$PATRONI_SERVICE_NAME.$NAMESPACE.svc.cluster.local:8008/patroni | jq --raw-output .state`
if [ $master_node_state != "running" ]; then
    echo 'WARNING - Patroni master node checking failed'
    exit 2
fi

## the value must be streaming
second_node_state=`curl --silent --show-error http://$PATRONI_SERVICE_NAME.$NAMESPACE.svc.cluster.local:8008/patroni | jq --raw-output .replication[0].state`
if [ $second_node_state != "streaming" ]; then
    echo 'WARNING - Patroni second node checking failed'
    exit 2
fi

## the value must be streaming
third_node_state=`curl --silent --show-error http://$PATRONI_SERVICE_NAME.$NAMESPACE.svc.cluster.local:8008/patroni | jq --raw-output .replication[1].state`
if [ $third_node_state != "streaming" ]; then
    echo 'WARNING - Patroni third node checking failed'
    exit 2
fi

echo 'OK - Patroni cluster checking passed'