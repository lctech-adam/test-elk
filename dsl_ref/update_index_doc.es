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
