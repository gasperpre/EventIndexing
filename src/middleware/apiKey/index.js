const apiKey = (req, res, next) => {
    const api_key = req.get('API-Key');
    if (!api_key || api_key !== process.env.API_KEY) {
        res.status(401).json({error: 'unauthorised'});
    } else {
        next();
    }
}
module.exports =  apiKey