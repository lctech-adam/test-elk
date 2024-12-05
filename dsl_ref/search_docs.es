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

// 設定explain可以知道查到的每個doc分別是位於哪個node上的shard
GET /products/_search
{
  "explain": true,
  "query": {
    "match_all": {}
  }
}

// 不分大小寫term level query
GET /products/_search
{
    "query": {
        "term": {
          "tags.keyword": {
            "value": "veGeTable",
            "case_insensitive": true
          }
        }
    }
}

// match term within (只要符合其中一個)
GET /products/_search
{
    "query": {
        "terms": {
            "tags.keyword": ["Soup", "Meat"]
        }
    }
}

// search by ids
GET /products/_search
{
    "query": {
        "ids": {
            "values": ["100", "200", "300"]
        }
    }
}

// range query (指定time zone的話，ES會先減掉8，才和存儲的UTC比對)
GET /products/_search
{
    "query": {
        "range": {
          "created": {
            "time_zone": "+08:00",
            "gte": "2000/01/01 01:00:00",
            "lte": "2020/01/31 00:59:59"
          }
        }
    }
}

// search by prefix
GET /products/_search
{
    "query": {
        "prefix": {
          "name.keyword": {
            "value": "Past"
          }
        }
    }
}

// wildcard
GET /products/_search
{
    "query": {
        "wildcard": {
          "tags.keyword": {
            "value": "Pas?a"
          }
        }
    }
}

// regexp
GET /products/_search
{
    "query": {
        "regexp": {
            "tags.keyword": "Bee(r|t){1}"
        }
    }
}

// where tags is not null
GET /products/_search
{
    "query": {
        "exists": {
            "field": "tags.keyword"
        }
    }
}

// where tags is null
GET /products/_search
{
    "query": {
        "bool": {
            "must_not": [
              {
                "exists": {
                    "field": "tags.keyword"
                }
              }
            ]
        }
    }
}

// full text match with AND condition
GET /products/_search
{
    "query": {
        "match": {
          "name": {
            "query": "PasTa ChIckEn",
            "operator": "AND"
          }
        }
    }
}

// adjust relevance scoring with multi match (tie_breaker讓score較低的field還是加入計算 * 0.3)
GET /products/_search
{
    "query": {
        "multi_match": {
          "query": "vegetable",
          "fields": ["name^2", "tags"],
          "tie_breaker": 0.3
        }
    }
}

// bool query
GET /products/_search
{
    "query": {
        "bool": {
            "must": [
              {
                "term": {
                    "tags.keyword": "Alcohol"
                }
              }
            ],
            "must_not": [
              {
                "term": {
                  "tags.keyword": {
                    "value": "Wine"
                  }
                }
              }
            ],
            "should": [
              {
                "term": {
                  "tags.keyword": {
                    "value": "Beer"
                  }
                }
              },
              {
                "match": {
                  "name": "Mcguinness"
                }
              }
            ],
            "minimum_should_match": 1
        }
    }
}

// boosting會先從positive查出結果及，如果其中有符合negative的，該doc的score會乘以negative_boost (used for decreasing relevance score based on certain condition)
GET /products/_search
{
    "size": 20,
    "query": {
        "boosting": {
            "positive": {
                "match": {
                  "name": "juice"
                }
            },
            "negative": {
                "match": {
                  "name": "apple"
                }
            },
            "negative_boost": 0.5
        }
    }
}

// disjuction max (multi_match底層會轉成dis_max)
GET /products/_search
{
    "query": {
        "dis_max": {
          "tie_breaker": 0.7,
          "boost": 1.2,
          "queries": [
            {
                "match": {
                  "name": "Mango"
                }
            },
            {
                "term": {
                    "value": "Beverage"
                }
            }
          ]
        }
    }
}

// query nested array of objects (就算指定了path，field name還是要包含path)
// inner_hits會指出hit的child object的offset和score
GET /recipes/_search
{
    "query": {
        "nested": {
          "path": "ingredients",
          "inner_hits": {
            "name": "what_i_want",
            "size": 5
          },
          "query": {
            "bool": {
                "must": [
                  {
                    "match": {
                      "ingredients.name": "permesan"
                    }
                  },
                  {
                    "range": {
                      "ingredients.amount": {
                        "gte": 100
                      }
                    }
                  }
                ]
            }
          }
        }
    }
}