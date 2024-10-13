#!/usr/bin/node
// implements files controller.
import dbClient from "../utils/db.js";
import redisClient from "../utils/redis.js";
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export default class FilesController {
    static async postUpload(req, res){
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
                req.user._id
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
            req.user._id
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
    static async getShow(req, res){
        const fileId = req.params.id;
        const file = await dbClient.findFileById(fileId);
        if (file === null){
            return res.status(404).json({'error': 'Not found'});
        }
        if (file._id != user._id){
            return res.status(404).json({'error': 'Not found'});
        }
    }
    static async getIndex(req, res){
        
    }
}
