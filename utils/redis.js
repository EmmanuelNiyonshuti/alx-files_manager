#!/usr/bin/node
import redis from 'redis';
// comprises RedisClient class that connects to mongodb and perform some operations.

class RedisClient {

    constructor(){
        this.client = redis.createClient();
        this.client.on('error', (err) => console.error(err));
    }
    isAlive() {
        return this.client.connected;
    }
    async get(key) {
        return new Promise ((resolve, reject) =>{
            this.client.get(key, (err, val) => {
                if (err){
                    reject(err);
                }else{
                    resolve(val);
                }
            });
        });
    }
    async setEx(key, delay, val){
        return new Promise((resolve, reject) => {
            this.client.setex(key, delay, val, (err) => {
                if (err){
                    reject(err);
                }else{
                    resolve();
                }
            });
        });
    }
    async del(key){
        return new Promise((resolve, reject) => {
            this.client.del(key, (err) => {
                if (err){
                    reject(err);
                }else{
                    resolve();
                }
            });
        });
    }
}

const redisClient = new RedisClient();

export default redisClient;
