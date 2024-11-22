#!/bin/bash

docker-compose down
docker volume rm demo-elk_esdata01
docker volume rm demo-elk_esdata02
docker volume rm demo-elk_esdata03
