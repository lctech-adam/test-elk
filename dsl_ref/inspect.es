// 確認cluster狀態
GET /_cluster/health

GET /_cat/nodes?v

GET /_cat/indices?v&expand_wildcards=all

GET /_cat/shards?v


// 測試分詞器效果
POST /_analyze
{
    "text": "測試一下ik的分詞功能如何",
    "analyzer": "ik_smart"
}

// custom analyzer
PUT /analyzer_test
{
    "settings": {
        "analysis": {
            "analyzer": {
                "my_custom_analyzer": {
                    "type": "custom",
                    "char_filter": ["html_strip"],
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "stop",
                        "asciifolding"
                    ]
                }
            }
        }
    }
}

POST /analyzer_test/_analyze
{
    "analyzer": "my_custom_analyzer",
    "text": "I&apos;m in a <em>good</em> mood&nbsp;-&nbsp;and I <strong>love</strong> acai!"
}

PUT /analyzer_test_2
{
    "settings": {
        "analysis": {
            "char_filter": {},
            "tokenizer": {},
            "filter": {
                "danish_stop": {
                    "type": "stop",
                    "stopwords": "_danish_"
                }
            },
            "analyzer": {
                "my_custom_analyzer": {
                    "type": "custom",
                    "char_filter": ["html_strip"],
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "danish_stop",
                        "asciifolding"
                    ]
                }
            }
        }
    }
}

POST /analyzer_test_2/_analyze
{
    "analyzer": "my_custom_analyzer",
    "text": "I&apos;m in a <em>good</em> mood&nbsp;-&nbsp;and I <strong>love</strong> acai!"
}

// 新增analyzer到index的static setting，會需要先把index關閉
POST /analyzer_test/_close

PUT /analyzer_test/_settings
{
    "analysis": {
        "analyzer": {
            "my_second_analyzer": {
                "type": "custom",
                "tokenizer": "standard"
            }
        }
    }
}

// 重新打開index
POST /analyzer_test/_open