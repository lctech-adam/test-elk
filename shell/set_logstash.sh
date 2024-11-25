#!/bin/bash

AUTH="${ES_ROOT_USERNAME}:${ES_ROOT_PASSWORD}"
HEADER="Content-Type: application/json"

until curl -u $AUTH -s "${ES_HOST}" > /dev/null; do
  echo "Waiting for Elasticsearch to be available..."
  sleep 5
done

# 創建權限
curl -X POST "${ES_HOST}/_security/role/logstash_writer" \
  -u "$AUTH" -H "$HEADER" \
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

echo -e "\n\n indice created at host:${ES_HOST}!!! \n\n"

# 創建index模板
curl -X PUT "${ES_HOST}/_index_template/pubsub-logs-template" \
  -u "$AUTH" -H "$HEADER" \
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

echo -e "\n\n logs_template created at host:${ES_HOST}!!! \n\n"

# 創建ILM規則
curl -X PUT "${ES_HOST}/_ilm/policy/pubsub-logs-lifecycle-policy" \
     -u "$AUTH" -H "$HEADER" \
     -d'
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

echo -e "\n\n ilm policy created at host:${ES_HOST}!!! \n\n"

# 創建data stream
curl -X PUT "${ES_HOST}/_data_stream/pubsub-logs" \
    -u "$AUTH" -H "$HEADER"

echo -e "\n\n data_stream created at host:${ES_HOST}!!! \n\n"

# 創建ElasticSearch用戶 for LogStash
curl -X POST "${ES_HOST}/_security/user/${ES_USERNAME}" \
  -u "$AUTH" -H "$HEADER" \
  -d"
{
  \"password\" : \"${ES_PASSWORD}\",
  \"roles\" : [ \"logstash_writer\"],
  \"full_name\" : \"Internal Logstash User\"
}"

echo -e "\n\n user:${ES_USERNAME} with password:${ES_PASSWORD} created at ${ES_HOST}!!! \n\n"