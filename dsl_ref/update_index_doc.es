// full update，POST改成PUT，json body不變 (新增兼修改)
PUT /users/_doc/1

// incremental update
POST /users/_update/1
{
    "doc": {
        "email": "adam.chiu@gmail.com"
    }
}

// scripted updates (如果是在script裡面變更field的值，result一定會是updated，就算值沒變也不會是noops)
POST /products/_update/3
{
    "script": {
        "source": "ctx._source.price += params.diff",
        "params": {
            "diff": 100
        }
    }
}

// upsert (create or run the script)
POST /products/_update/5
{
    "script": {
        "source": "ctx._source.price += params.diff",
        "params": {
            "diff": 100
        }
    },
    "upsert": {
        "name": "Comme des garcons",
        "price": 6000,
        "score": 4.5,
        "createdAt": "2024-12-03T12:50:30Z"
    }
}

// optimistic lock (primary_term和seq_no要和shard當前數字一致才會update)
POST /products/_update/3?if_primary_term=1&if_seq_no=3
{
    "doc": {
        "score": 3
    }
}
// error response demo if conflict
{
  "error": {
    "root_cause": [
      {
        "type": "version_conflict_engine_exception",
        "reason": "[3]: version conflict, required seqNo [3], primary term [1]. current document has seqNo [7] and primary term [1]",
        "index_uuid": "jwO2aISvQc-tBTdASFFyvQ",
        "shard": "1",
        "index": "products"
      }
    ],
    "type": "version_conflict_engine_exception",
    "reason": "[3]: version conflict, required seqNo [3], primary term [1]. current document has seqNo [7] and primary term [1]",
    "index_uuid": "jwO2aISvQc-tBTdASFFyvQ",
    "shard": "1",
    "index": "products"
  },
  "status": 409
}

// update...where... (abort all when conflicted by default)
POST /products/_update_by_query
{
    "conflicts": "proceed",
    "script": {
        "source": "ctx._source.price -= 50"
    },
    "query": {
        "match": {
            "name": "iPhone"
        }
    }
}

// 更新index mapping設定
PUT /reviews/_mapping
{
    "properties": {
        "created_at": {
            "type": "date"
        }
    }
}