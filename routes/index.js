#!/usr/bin/node
// comprises all application routes.

import express from 'express';
import authenticateUser from '../middleware/auth.js';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js'
import AuthController from '../controllers/AuthController.js';
import FilesController from '../controllers/FilesController.js'
import { validJson, validateJson } from '../middleware/errorHandlers.js';

const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', validJson, UsersController.PostNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', authenticateUser, UsersController.getMe);
// router.post('/files', validJson, authenticateUser, FilesController.postUpload);
router.post('/files', validJson, FilesController.postUpload);
// router.get('/files/:id', authenticateUser, FilesController.getShow);
router.get('/files/:id', FilesController.getShow);
// router.get('/files', authenticateUser, FilesController.getIndex);
router.get('/files', FilesController.getIndex);
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/publish', FilesController.putUnpublish);
router.get('/files/:id/data', FilesController.getFile);

export default router;
