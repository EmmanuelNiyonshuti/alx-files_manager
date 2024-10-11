#!/users/bin/node

import dbClient from "../utils/db.js";

export default class UsersController {
    static async PostNew(req, res){
        const { email, password } = req.body;
        if (!email){
            return res.status(400).json({'error': 'Missing email'});
        }
        // const password = req.params.password;
        if (!password){
            return res.status(400).json({'error': 'Missing password'});
        }
        try{
            const newUser = await dbClient.createUser(email, password);
            if (newUser.error){
                return res.status(400).json(newUser.error);
            }
            return res.status(201).json({'id': id, 'email': email})

        }catch(error){
            res.status(500).send(error.toString());
        }
    }
}
