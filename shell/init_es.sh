#!/bin/bash

echo "${ES_PASSWORD}" | bin/elasticsearch-keystore add bootstrap.password -f
echo -e "\n\n set password: ${ES_PASSWORD}!!! \n\n"

./bin/elasticsearch