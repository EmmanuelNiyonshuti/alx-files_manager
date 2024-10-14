#!/users/bin/node

import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

export default class UsersController {
  static async PostNew(req, res) {
    // create a new user
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    try {
      const newUser = await dbClient.createUser(email, password);
      if (newUser.error) {
        return res.status(400).json({ error: newUser.error });
      }
      return res.status(201).json({
        id: newUser._id,
        email,
      });
    } catch (error) {
      return res.status(500).send(error.toString());
    }
  }

  static async getMe(req, res) {
    // retrieve the user based on the token used.
    // const user = req.user; Using middleware to retrieve 'user',
    // but project requirements expect token handling here.
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
    return res.status(200).json({ id: user._id, email: user.email });
  }
}
