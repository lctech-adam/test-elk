// full update，POST改成PUT，json body不變 (新增兼修改)
PUT /users/_doc/1

// incremental update
POST /users/_update/1
{
    "doc": {
        "email": "adam.chiu@gmail.com"
    }
}



