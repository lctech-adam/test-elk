#!/bin/bash

until curl -u "${ES_ROOT_USERNAME}:${ES_ROOT_PASSWORD}" -s "${ES_HOST}" > /dev/null; do
  echo "Waiting for Elasticsearch to be available..."
  sleep 5
done

curl -X POST -u "${ES_ROOT_USERNAME}:${ES_ROOT_PASSWORD}" "${ES_HOST}/_security/user/${ES_USERNAME}/_password" \
  -H 'Content-Type: application/json' \
  -d"
{
  \"password\": \"${ES_PASSWORD}\"
}"

echo -e "\n\n username:${ES_USERNAME} with password:${ES_PASSWORD} created at ${ES_HOST}!!! \n\n"