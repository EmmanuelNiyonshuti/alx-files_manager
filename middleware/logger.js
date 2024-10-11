#!/usr/bin/node

export default function logger(req, res, next){
    console.log(`${req.method} ${req.protocol}://${req.hostname}:5000${req.url} ${res.statusCode}`);
    next();
}