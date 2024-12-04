POST /products/_bulk
{ "create": { "_id": "1" } }
{
    "name": "iPhone 13 mini",
    "price": 3000,
    "score": 3,
    "createdAt": "2015-01-01T12:10:30Z"
}
{ "create": { "_id": "2" } }
{
    "name": "iPhone 13",
    "price": 4000,
    "score": 2,
    "createdAt": "2015-01-02T12:10:30Z"
}
{ "create": { "_id": "3" } }
{
    "name": "iPhone 13 pro",
    "price": 3000,
    "score": 1,
    "createdAt": "2015-01-03T12:10:30Z"
}
{ "create": { "_id": "4" } }
{
    "name": "iPhone 13 pro max",
    "price": 5000,
    "score": 2,
    "createdAt": "2015-01-04T12:10:30Z"
}

// bulk處理多個index時，可以在metadata裡面指定index
POST /_bulk
{ "create": { "_index": "products", "_id": "5" } }
{
    "name": "iPhone 14 pro",
    "price": 8000,
    "score": 3.5,
    "createdAt": "2021-01-04T12:10:30Z"
}