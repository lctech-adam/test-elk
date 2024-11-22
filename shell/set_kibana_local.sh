until curl -u "elastic:adam1234" -s "http://127.0.0.1:9200" > /dev/null; do
  echo "Waiting for Elasticsearch to be available..."
  sleep 5
done

curl -X POST -u "elastic:adam1234" "http://127.0.0.1:9200/_security/user/kibana_system/_password" \
  -H 'Content-Type: application/json' \
  -d"
{
  \"password\": \"adam1234\"
}"