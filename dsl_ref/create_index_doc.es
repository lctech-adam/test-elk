
PUT /users
{
    "mappings": {
        "properties": {
            "info": {
                "type": "text",
                "analyzer": "ik_smart"
            },
            "email": {
                "type": "keyword",
                "index": false
            },
            "name": {
                "type": "object",
                "properties": {
                    "firstName": {
                        "type": "keyword",
                        "index": true
                    },
                    "lastName": {
                        "type": "keyword",
                        "index": true
                    }
                }
            }
        }
    }
}

POST /users/_doc/1
{
    "email": "test01@lctech.com.tw",
    "info": "the first test document",
    "name": {
        "firstName": "Chiu",
        "lastName": "Adam"
    }
}

