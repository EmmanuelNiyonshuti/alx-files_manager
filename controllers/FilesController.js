#!/usr/bin/node
// implements files controller.
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import mime from 'mime-types';

export default class FilesController {
    static async postUpload(req, res) {
        const token = req.headers['x-token'];
        if (!token) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const key = `auth_${token}`;
        const userId = await redisClient.get(key);
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await dbClient.findById(userId);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const {
          name, type, parentId = 0, isPublic = false, data,
        } = req.body;
    
        if (!name) {
          return res.status(400).json({ error: 'Missing name' });
        }
        const acceptedTypes = ['folder', 'file', 'image'];
        if (!type || !acceptedTypes.includes(type)) {
          return res.status(400).json({ error: 'Missing type' });
        }
        if (!data && type !== 'folder') {
          return res.status(400).json({ error: 'Missing data' });
        }
        if (parentId !== 0) {
          const file = await dbClient.findFileByParentId(parentId);
          if (!file) {
            return res.status(400).json({ error: 'Parent not found' });
          }
          if (file.type !== 'folder') {
            return res.status(400).json({ error: 'Parent is not a folder' });
          }
        }
        if (type === 'folder') {
          const newFolder = await dbClient.createFolder(
            name,
            type,
            parentId,
            isPublic,
            user._id
          );
          return res.status(201).json({
            id: newFolder._id,
            userId: newFolder.userId,
            name: newFolder.name,
            type: newFolder.type,
            isPublic: newFolder.isPublic,
            parentId: newFolder.parentId
          });
        }
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        if (!fs.existsSync(folderPath)) {
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
          user._id,
          filePath
        );
        return res.status(201).json({
          id: newFile._id,
          userId: newFile.userId,
          name: newFile.name,
          type: newFile.type,
          isPublic: newFile.isPublic,
          parentId: newFile.parentId
        });
    }
  static async getShow(req, res) {
    // fetch a specific file using it's Id.
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const fileId = req.params.id;
    if (!fileId){
      return res.status(404).json({ error: 'Not found' });
    }
    const file = await dbClient.findFileById(fileId);
    if (!file || file.userId != user._id) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json({
      id: file._id,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId
    });
  }
  static async getIndex(req, res) {
    // retrieve a list of files belonging to the authenticated user.
    const token = req.headers['x-token'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.findById(userId);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page) || 0;
    const limit = 20;
    try {
        const query = { userId: userId, parentId: parentId };
        const files = await dbClient.filterFiles(query, page, limit);
        return res.status(200).json(files);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  static async putPublish(req, res){
    // update a file (set's isPublic property to true)
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.findById(userId);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const fileId = req.params.id;
      if (!fileId){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const file = await dbClient.findFileById(fileId);
    if (!file){
      return res.status(401).json({ error: 'Not found' });
    }
    if (file.userId != user._id){
      return res.status(401).json({ error: 'Not found' });
    }
    file.isPublic = true;
    return res.status(200).json(file);
  }
  static async putUnpublish(req, res){
    // update a file (set's isPublic property to false)
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.findById(userId);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const fileId = req.params.id;
      if (!fileId){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const file = await dbClient.findFileById(fileId);
    if (!file){
      return res.status(401).json({ error: 'Not found' });
    }
    if (file.userId != user._id){
      return res.status(401).json({ error: 'Not found' });
    }
    file.isPublic = false;
    return res.status(200).json(file);
  }

  static async getFile(req, res){
    const fileId = req.params.id;
    if (!fileId){
      return res.status(400).json({ error: 'Bad request' });
    }
    const file = await dbClient.findFileById(fileId);
    if (!file){
      return res.status(404).json({error: 'Not found'});
    }
    if (!file.isPublic){
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
      }
    }
    if (file.type === 'folder'){
      return res.status(400).json({error: 'A folder doesn\'t have content'});
    }
    if (!fs.existsSync(file.localPath)){
      return res.status(404).json({error: 'Not found'});
    }
    const mimeType = mime.lookup(file.name);
    res.setHeader('Content-Type', mimeType);
    fs.createReadStream(filePath).pipe(res);
  }
}
