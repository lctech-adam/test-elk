
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
                "analyzer": "ik_max_word",
                "search_analyzer": "ik_max_word"
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

// 根據分詞需求再設定char_filter, tokenizer, filter
// 指定sharding和replica
PUT /products
{
    "settings": {
        "analysis": {
            "char_filter": {},
            "tokenizer": {},
            "filter": {},
            "analyzer": {
                "talk_analyzer": {
                    "tokenizer": "ik_max_word"
                }
            }
        },
        "number_of_shards": 2,
        "number_of_replicas": 1
    },
    "mappings": {
        "properties": {
            "id": {
                "type": "keyword",
                "index": true
            },
            "name": {
                "type": "text",
                "analyzer": "ik_max_word",
                "search_analyzer": "ik_max_word"
            },
            "price": {
                "type": "integer",
                "index": true
            },
            "score": {
                "type": "integer",
                "index": true
            },
            "createdAt": {
                "type": "date",
                "index": true
            }
        }
    }
}

PUT /reviews
{
    "settings": {
        "index.mapping.coerce": false
    },
    "mappings": {
        "numeric_detection": true,
        "date_detection": true,
        "dynamic_date_formats": ["dd-MM-yyyy"],
        "properties": {
            "rating": {
                "type": "float"
            },
            "content": {
                "type": "text"
            },
            "product_id": {
                "type": "integer"
            },
            "author": {
                "type": "object",
                "properties": {
                    "first_name": {
                        "type": "text"
                    },
                    "last_name": {
                        "type": "text"
                    },
                    "email": {
                        "type": "keyword"
                    }
                }
            }
        }
    }
}

PUT /reviews/_mapping
{
    "properties": {
        "created_at": {
            "type": "date",
            "format": "dd/MM/YYYY",
            "doc_value": false,
            "norms": false,
            "index": false
        },
        "first_name": {
            "type": "text",
            "copy_to": "full_name"
        },
        "last_name": {
            "type": "text",
            "copy_to": "full_name"
        },
        "full_name": {
            "type": "text"
        }
    }
}

POST /_reindex
{
    "source": {
        "index": "reviews"
    },
    "dest": {
        "index": "reviews_new"
    }
}

POST /_reindex
{
    "source": {
        "index": "reviews",
        "_source": [ "content", "created_at", "rating" ]
    },
    "dest": {
        "index": "reviews_new"
    }
}

POST /_reindex
{
    "source": {
        "index": "reviews",
        "_source": [ "content", "created_at", "rating" ]
    },
    "dest": {
        "index": "reviews_new"
    },
    "script": {
        "source": """
            ctx._source.comment = ctx._source.remove("content");
        """
    }
}

PUT /multi_field_test
{
    "mappings": {
        "dynamic": false,
        "properties": {
            "description": {
                "type": "text"
            },
            "ingredients": {
                "type": "text",
                "fields": {
                    "keyword": {
                        "type": "keyword",
                        "ignore_above": 256
                    }
                }
            }
        }
    }
}

// define multi mapping on certain field
POST /multi_field_test/_doc
{
    "description": "To make this spaghetti carbonara, you first need to...",
    "ingredients": ["Spaghetti", "Bacon", "Eggs"]
}

// full text
GET /multi_field_test/_search
{
    "query": {
        "match": {
            "ingredients": "bACoN"
        }
    }
}

// exact
GET /multi_field_test/_search
{
    "query": {
        "term": {
            "ingredients.keyword": "Bacon"
        }
    }
}

PUT /dynamic_template_test
{
    "mappings": {
        "date_detection": true,
        "dynamic_templates": [
            {
                "integers": {
                    "match_mapping_type": "long",
                    "mapping": {
                        "type": "integer"
                    }
                }
            },
            {
                "strings": {
                    "match_mapping_type": "string",
                    "match": "text_*",
                    "unmatch": "*_keyword",
                    "mapping": {
                        "type": "text",
                        "fields": {
                            "keyword": {
                                "type": "keyword",
                                "ignore_above": 512
                            }
                        }
                    }
                }
            }
        ]
    }
}

POST /dynamic_template_test/_doc
{
    "in_stock": 123,
    "name": "Adam"
}