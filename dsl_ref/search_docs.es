// find all
GET /users/_search
{
    "query": {
        "match_all": {}
    }
}

// match (full text search)
// 鎖定的詞只要partial match就會返回，但符合度越高score越高、也越靠前
GET /users/_search
{
    "query": {
        "match": {
            "info": "test"
        }
    }
}

// multi_match (full text search)
// 模糊匹配查詢多欄位（但效率較低，不如多field copy_to all再用match查）
GET /users/_search
{
    "query": {
        "multi_match": {
            "query": "adam test",
            "fields": ["info", "email"]
        }
    }
}

// term (exact search)
GET /users/_search
{
    "query": {
        "term": {
          "email": {
            "value": "adam.chiu@gmail.com"
          }
        }
    }
}

// compound - function score (ES query score關聯度算分是BM25，可追加function score並將兩者結合)
// 結合方式可以是sum, avg, max, min, multiply或replace
GET /users/_search
{
    "query": {
        "function_score": {
            "query": {
                "match": {
                    "all": "test"
                }
            },
            "functions": [
                {
                    "filter": {
                        "term": {
                            "id": "1"
                        }
                    },
                    "weight": 10
                }
            ],
            "sort": [ // 可指定多個sort fields (e.g. order by field1, field2, field3)
                {
                    "createdAt": "desc"
                }
            ],
            "boost_mode": "multiply"
        }
    }
}

// compound - boolean query
GET /users/_search
{
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "info": "test"
                    }
                }
            ],
            "should": [
                {
                    "term": {
                        "firstName": "Chiu"
                    }
                },
                {
                    "term": {
                        "lastName": "Adam"
                    }
                }
            ],
            "must_not": [
                {
                    "range": {
                        "price": {
                            "lte": 2000
                        }
                    }
                }
            ],
            "filter": [
                {
                    "range": {
                        "score:" {
                            "gte": 60
                        }
                    }
                }
            ]
        }
    }
}

// sort + highlight (from = 起始位置，默認0)
POST /products/_search
{
    "query": {
        "match_all": {}
    },
    "highlight": {
        "fields": {
            "name": {
                "pre_tags": "<em>",
                "post_tags": "</em>",
                "require_field_match": "false"
            }
        }
    },
    "from": 0,
    "size": 3,
    "sort": {
        "createdAt": "desc"
    }
}

// aggregation (size=0會取消doc的回傳，hits會是空的。aggs裡面的size可以控制聚合的回傳數量)
GET /products/_search
{
    "query": {
        "range": {
          "price": {
            "gte": 1000,
            "lte": 5000
          }
        }
    },
    "size": 0,
    "aggs": {
      "priceAggregate": {
        "terms": {
            "field": "price",
            "size": 20,
            "order": {
                "_count": "asc"
            }
        }
      }
    }
}

// nested aggregation範例，stats (stands for statistic) 會一次性計算出count, avg, min, max, sum
// 下方範例依照scoreStats aggregate出來的max值進行降序
GET /products/_search
{
    "query": {
        "range": {
          "price": {
            "gte": 1000,
            "lte": 5000
          }
        }
    },
    "size": 0,
    "aggs": {
      "priceAggregate": {
        "terms": {
            "field": "price",
            "size": 20,
            "order": {
                "scoreStats.max": "desc"
            }
        },
        "aggs": {
            "scoreStats": {
                "stats": {
                    "field": "score"
                }
            }
        }
      }
    }
}