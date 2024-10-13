#!/usr/bin/node
// comprise middleware to retrieve a user based on their id.
import redisClient from "../utils/redis.js";
import dbClient from "../utils/db.js";

const authenticateUser = async (req, res, next) => {
        const token = req.headers['x-token'];
        if (!token){
            return res.status(401).json({'error': 'Unauthorized'});
        }
        const key = `auth_${token}`;
        const userId = await redisClient.get(key);
        if (!userId){
            return res.status(401).json({'error': 'unauthorized'});
        }
        req.key = key;
        const user = await dbClient.findById(userId);
        if (!user){
            return res.status(401).json({'error': 'Unauthorized'});
        }
        req.user = user;
        next();
}

export default authenticateUser;
