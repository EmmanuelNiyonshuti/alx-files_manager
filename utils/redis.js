#!/usr/bin/node
import redis from 'redis';
// comprises RedisClient class.

class RedisClient {
  // connects to redis server.
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (err) => console.error(err));
  }

  isAlive() {
    // check the connection.
    return this.client.connected;
  }

  async get(key) {
    // given a key it retrieves it's value.
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, val) => {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  }

  async set(key, delay, val) {
    // sets a key with a value with an expiration amount of time.
    return new Promise((resolve, reject) => {
      this.client.setex(key, delay, val, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async del(key) {
    // deletes the key.
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

const redisClient = new RedisClient();

export default redisClient;
