#!/usr/bin/node
// comprises DBClient class that connects to mongodb and perform some operations.

import mongodb from 'mongodb';
import crypto from 'crypto';
import { resourceLimits } from 'worker_threads';

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
        // check the passwordhash
        const pwdHash = this.hashPw(password);
        return pwdHash === hashedPw;
    }
    async nbUsers() {
        // count the number of users.
        if (!this.isAlive()){
            return 0;
        }
        try{
            const numUsers = await this.db.collection('users').countDocuments();
            return numUsers;
        }catch(error){
            console.error(error);
            return 0;
        }
    }
    async nbFiles() {
        // count the number of files in the db.
        if (!this.isAlive()){
            return 0;
        }
        try{
            const numFiles = await this.db.collection('files').countDocuments();
            return numFiles;
        }catch(error){
            console.error(error);
            return 0;
        }
    }
    async findByEmail(email){
        // retrieve a user based on email.
        if (!this.isAlive()){
            return 0;
        }
        try{
            const user = await this.db.collection('users').findOne({email: email});
            return user ? user : 0;
        }catch(error){
            console.error(error);
            return 0;
        }
    }
    async findUsers(){
        // retrieve all users.
        if (!this.isAlive()){
            return [];
        }
        try{
            const users = await this.db.collection('users').find().toArray();
            return users
        }catch(error){
            console.error(error);
            return [];
        }
    }
    async findById(userId){
        // finds a user based on id.
        if (!this.isAlive){
            return 0;
        }
        try{
            const users = await this.findUsers();
            return users.find(user => user._id == userId) || null;
        }catch(error){
            console.error(error);
            return 0;
        }
    }
    async createUser(email, password){
        // creates a new user.
        if (!this.isAlive()){
            return 0;
        }
        try{
            const user = await this.findByEmail(email);
            if (user){
                return {'error': 'Already exists'};
            }
            const hashedPw = this.hashPw(password);
            const newUser = {email: email, password: hashedPw};
            await this.db.collection('users').insertOne(newUser);
            return newUser;
        }catch(error){
            console.error(error);
            return 0;
        }
    }
    async filterFiles(query, page = 0, limit = 20){
        // retrieves files based on the provided query.
        if (!this.isAlive()){
            return 0;
        }
        try{
            const skip = page * limit;
            const collection = this.db.collection('files');
            const total = await collection.countDocuments(query);
            const files = await collection.find(query)
                    .skip(skip)
                    .limit(limit)
                    .toArray();
            const transformedFiles = files.map(file => ({
                id: file._id.toString(),
                userId: file.userId,
                name: file.name,
                type: file.type,
                isPublic: file.isPublic,
                parentId: file.parentId  
            }));
            return transformedFiles;
        }catch(error){
            console.error(error);
            return [];
        }
    }
    async findFiles(){
        // retrieves all files.
        if (!this.isAlive()){
            return 0;
        }
        try{
            const allFiles = await this.db.collection('files').find().toArray();
            return allFiles;
        }catch(error){
            console.error(error);
            return [];
        }
    }
    async findFileByParentId(parentId){
        // retrieves a files by it's parentId
        if (!this.isAlive){
            return 0;
        }
        try{
            const files = await this.findFiles();
            return files.find(file => file.parentId == parentId) || null;
        }catch(error){
            console.error(error);
            return [];
        }
    }
    async findFileById(fileId){
        // finds a user based on id.
        if (!this.isAlive){
            return 0;
        }
        try{
            const files = await this.findFiles();
            return files.find(file => file._id == fileId) || null;
        }catch(error){
            console.error(error);
            return [];
        }
    }
    async findFileByName(name){
        // retrieve a file based on the id.
        if (!this.isAlive()){
            return 0;
        }
        try{
            const allFiles = await this.findFiles();
            return allFiles.find(file => file.name == name) || null;
        }catch{
            console.error(error);
            return 0;
        }
    }
    async createFolder(name, type, parentId, isPublic, userId){
        // creates a folder.
        if (!this.isAlive()){
            return 0;
        }
        try{
            const result = await this.db.collection('files').insertOne({
                    name,
                    type,
                    parentId,
                    isPublic,
                    userId,
                });
            return result.ops[0];
        }catch(error){
            console.error(error);
            return 0;
        }
    }
    async createFile(name, type, parentId, isPublic, userId, localPath){
        // creates a file.
        if (!this.isAlive()){
            return 0;
        }
        try{
            const result = await this.db.collection('files').insertOne({
                    name,
                    type,
                    parentId,
                    isPublic,
                    userId,
                    localPath
                });
            return result.ops[0];
        }catch(error){
            console.error(error);
            return 0;
        }
    }
}

const dbClient = new DBClient();
export default dbClient;
