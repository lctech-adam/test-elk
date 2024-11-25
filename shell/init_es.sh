#!/bin/bash

echo "${ELK_PASSWORD}" | bin/elasticsearch-keystore add bootstrap.password -f
echo -e "\n\n set password: ${ELK_PASSWORD}!!! \n\n"

./bin/elasticsearch