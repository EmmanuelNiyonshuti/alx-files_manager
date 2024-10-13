#!/usr/bin/node
// comprises errorHandler middleware.

export const validJson = (error, req, res, next) => {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')){
        return res.status(400).json({'error': 'Invalid content-type. expected application/json'});
    }
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error){
        return res.status(400).json({'error': 'Invalid JSON'});
    }
}