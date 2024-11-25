#!/bin/bash

until curl -u "${ELK_ROOT_USERNAME}:${ELK_ROOT_PASSWORD}" -s "${ELASTICSEARCH_HOST}" > /dev/null; do
  echo "Waiting for Elasticsearch to be available..."
  sleep 5
done

# 創建權限
curl -X POST -u "${ELK_ROOT_USERNAME}:${ELK_ROOT_PASSWORD}" "${ELASTICSEARCH_HOST}/_security/role/logstash_writer" \
  -H 'Content-Type: application/json' \
  -d'
{
  "cluster": ["manage_index_templates", "monitor", "manage_ilm"], 
  "indices": [
    {
      "names": [ "logstash-*", "pubsub_logs*", "pubsub-logs-alias" ], 
      "privileges": ["auto_configure","write","create","create_index","manage","manage_ilm"]  
    },
    {
      "names": [ "logs-generic-default" ],
      "privileges": ["auto_configure","create_index","manage","all"]
    }
  ]
}'

echo -e "\n\n indice created at host:${ELASTICSEARCH_HOST}!!! \n\n"

# 創建index模板
curl -X PUT "${ELASTICSEARCH_HOST}/_index_template/pubsub-logs-template" \
  -u "${ELK_ROOT_USERNAME}:${ELK_ROOT_PASSWORD}" \
  -H 'Content-Type: application/json' \
  -d'
{
  "index_patterns": ["pubsub-logs*"],
  "data_stream": {},
  "template": {
    "mappings": {
      "properties": {
        "id": {
          "type": "keyword"
        },
        "text": {
          "type": "text",
          "analyzer": "ik_max_word"
        },
        "createdAt": {
          "type": "date"
        }
      }
    },
    "settings": {
      "index.lifecycle.name": "pubsub-logs-lifecycle-policy",
      "index.lifecycle.rollover_alias": "pubsub-logs-alias"
    }
  }
}'

echo -e "\n\n logs_template created at host:${ELASTICSEARCH_HOST}!!! \n\n"

# 創建ILM規則
curl -X PUT -u "${ELK_ROOT_USERNAME}:${ELK_ROOT_PASSWORD}" "${ELASTICSEARCH_HOST}/_ilm/policy/pubsub-logs-lifecycle-policy" -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_size": "50gb"
          }
        }
      }
    }
  }
}'

echo -e "\n\n ilm policy created at host:${ELASTICSEARCH_HOST}!!! \n\n"

# 創建data stream
curl -X PUT -u "${ELK_ROOT_USERNAME}:${ELK_ROOT_PASSWORD}" "${ELASTICSEARCH_HOST}/_data_stream/pubsub-logs" -H 'Content-Type: application/json'

echo -e "\n\n data_stream created at host:${ELASTICSEARCH_HOST}!!! \n\n"

# 創建ElasticSearch用戶 for LogStash
curl -X POST -u "${ELK_ROOT_USERNAME}:${ELK_ROOT_PASSWORD}" "${ELASTICSEARCH_HOST}/_security/user/${ELASTICSEARCH_USERNAME}" \
  -H 'Content-Type: application/json' \
  -d"
{
  \"password\" : \"${ELASTICSEARCH_PASSWORD}\",
  \"roles\" : [ \"logstash_writer\"],
  \"full_name\" : \"Internal Logstash User\"
}"

echo -e "\n\n user:${ELASTICSEARCH_USERNAME} with password:${ELASTICSEARCH_PASSWORD} created!!! \n\n"