const Redis = require('ioredis');

// Create a Redis client
const redisClient = new Redis({
  host: '127.0.0.1',
  port: 6379
});

// Check connection
redisClient.ping()
  .then(result => console.log("Redis PING:", result))
  .catch(err => console.error("Redis error:", err));

module.exports = redisClient;
