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