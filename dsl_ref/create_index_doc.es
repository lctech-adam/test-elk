
// create index (_id一定得是keyword，就算原始數據data type是integer)
PUT /users
{
    "mappings": {
        "properties": {
            "id": {
                "type": "keyword"
            },
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
                        "index": true,
                        "copy_to": "all"
                    },
                    "lastName": {
                        "type": "keyword",
                        "index": true,
                        "copy_to": "all"
                    }
                }
            },
            "location": {
                "type": "geo_point",
                "index": true
            },
            "tag": {
                "type": "keyword",
                "index": true,
                "copy_to": "all"
            },
            "all": {
                "type": "text",
                "analyzer": "ik_max_word"
            }
        }
    }
}

// create document
POST /users/_doc/1
{
    "email": "test01@lctech.com.tw",
    "info": "the first test document",
    "name": {
        "firstName": "Chiu",
        "lastName": "Adam"
    }
}

// 測試分詞器效果
POST /_analyze
{
    "text": "測試一下ik的分詞功能如何",
    "analyzer": "ik_smart"
}


