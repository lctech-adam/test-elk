#!/bin/bash

until curl -u "${ELK_ROOT_USERNAME}:${ELK_ROOT_PASSWORD}" -s "${ELASTICSEARCH_HOST}" > /dev/null; do
  echo "Waiting for Elasticsearch to be available..."
  sleep 5
done

curl -X POST -u "${ELK_ROOT_USERNAME}:${ELK_ROOT_PASSWORD}" "${ELASTICSEARCH_HOST}/_security/user/${ELASTICSEARCH_USERNAME}/_password" \
  -H 'Content-Type: application/json' \
  -d"
{
  \"password\": \"${ELASTICSEARCH_PASSWORD}\"
}"