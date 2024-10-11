#!/usr/bin/node
// comprises DBClient class that connects to mongodb and perform some operations.

import mongodb from 'mongodb';
import crypto from 'crypto';

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
    constructor() {
        this.client = null;
        this.db = null;
        this.connected = false;
        mongodb.MongoClient.connect(url, { useUnifiedTopology: true } , (error, client) => {
            if (error){
                console.error(error);
                return;
            }
            this.client = client;
            this.db = client.db(DB_DATABASE);
            this.connected = true;
            }
        )}

    isAlive(){
        return this.connected;
    }
    hashPw(password){
        // hash password with 'SHA1'
        const hash = crypto.createHash('SHA1').update(password).digest('hex');
        return hash;
    }
    checkPw(password, hashedPw){
        // check the password
        const hash = crypto.createHash('SHA1').update(password).digest('hex');
        return hash === hashedPw;
    }
    async nbUsers() {
        if (!this.isAlive()){
            return 0;
        }
        const numUsers = await this.db.collection('users').countDocuments();
        return numUsers;
    }
    async nbFiles() {
        if (!this.isAlive()){
            return 0;
        }
        const numFiles = await this.db.collection('files').countDocuments();
        return numFiles;
    }
    async createUser(email, password){
        if (!this.isAlive()){
            return 0;
        }
        const user = await this.db.collection('users').findOne({email: email});
        if (user){
            return {'error': 'Already exist'}
        }
        const hashedPw = this.hashPw(password);
        const newUser = {email: email, password: hashedPw};
        await this.db.collection('users').insertOne(newUser);
        return newUser;
    }
}

const dbClient = new DBClient();
export default dbClient;
