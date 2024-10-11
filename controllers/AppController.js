#!/usr/bin/node

import dbClient from "../utils/db.js";
import redisClient from "../utils/redis.js";

export default class AppController {
    static  getStatus(req, res){
        if (dbClient.isAlive() && redisClient.isAlive()){
            res.status(200).send({ "redis": true, "db": true });
        }
    }

    static async getStats(req, res){
        try{
            const numUsers = await dbClient.nbUsers();
            const nbFiles = await dbClient.nbFiles();
            res.status(200).send({ "users": numUsers, "files": nbFiles});
        }catch(error){
            console.error(error);
        }
    }
}
