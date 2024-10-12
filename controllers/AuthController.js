#!/usr/bin/node
//
import { v4 as uuidv4 } from 'uuid';
import dbClient from "../utils/db.js";
import redisClient from '../utils/redis.js';

export default class AuthController {
    static async getConnect(req, res){
        // sign-in the user by generating a new authentication token
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Basic')){
            return res.status(401).json({'error': 'Unauthorized'});
        }
        const base64 = auth.split(' ')[1];
        const decodedStr = Buffer.from(base64, 'base64').toString('utf-8');
        const [email, password] = decodedStr.split(':');
        const user = await dbClient.findByEmail(email);
        if (!user){
            return res.status(401).json({'error': 'Unauthorized'});
        }
        if (!dbClient.checkPw(password, user.password)){
            return res.status(401).json({'error': 'Unauthorized'});
        }
        const token = uuidv4();
        const key = `auth_${token}`;
        await redisClient.setEx(key, 24 * 60 * 60, user._id);
        return res.status(200).json({ "token": token });
    }
    static async getDisconnect(req, res){
        // signout the user based on the token
        const token = req.headers['x-token'];
        console.log(token);
        if (!token){
            return res.status(401).json({'error': 'unauthorized'});
        }
        const key = `auth_${token}`;
        const userId = await redisClient.get(key);
        console.log(userId);
        if (!userId){
            return res.status(401).json({'error': 'unauthorized'});
        }
        await redisClient.del(key);
        return res.status(204).json({});
    }
}

