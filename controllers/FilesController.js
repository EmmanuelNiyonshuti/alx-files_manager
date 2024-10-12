#!/usr/bin/node
// implements files controller.
import dbClient from "../utils/db.js";
import redisClient from "../utils/redis.js";
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export default class FilesController {
    static async postUpload(req, res){
        const token = req.headers['x-token'];
        if (!token){
            return res.status(401).json({'error': 'Unauthorized'});
        }
        const key = `auth_${token}`;
        const userId = await redisClient.get(key);
        const user = await dbClient.findById(userId);
        if (!user){
            return res.status(401).json({'error': 'Unauthorized'});
        }
        const { name, type, parentId=0, isPublic=false, data } = req.body;
        if (!name){
            return res.status(400).json({'error': 'Missing name'});
        }
        if (!type || !['folder', 'file', 'image'].includes(type)){
            return res.status(400).json({'error': 'Missing type'});
        }
        if(!data && type !== 'folder'){
            return res.status(400).json({'error': 'Missing data'});
        }
        if (parentId !== 0){
            const parentFile = await dbClient.findFileById(parentId);
            if (!parentFile){
                return res.status(400).json({'error': 'Parent not found'});
            }
            if (parentFile.type != 'folder'){
                return res.status(400).json({'error': 'Parent is not folder'});
            }
        }
        if(type === 'folder'){
            const newFile = await dbClient.createFile(
                name,
                type,
                parentId,
                isPublic,
                user._id
            );
            return res.status(201).json({
                'id': newFile._id,
                'userId': newFile.userId,
                'name': newFile.name,
                'type': newFile.type,
                'isPublic': newFile.isPublic,
                'parentId': newFile.parentId
                });
        }
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        if (!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath, { recursive: true });
        }
        const fileName = uuidv4();
        const filePath = `${folderPath}/${fileName}`;
        fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
        const newFile = await dbClient.createFile(
            name,
            type,
            parentId,
            isPublic,
            filePath,
            user._id
        );
        console.log(newFile.name);
        console.log(newFile.type)
        return res.status(201).json({
            'id': newFile._id,
            'userId': newFile.userId,
            'name': newFile.name,
            'type': newFile.type,
            'isPublic': newFile.isPublic,
            'parentId': newFile.parentId
        });
    }
}
