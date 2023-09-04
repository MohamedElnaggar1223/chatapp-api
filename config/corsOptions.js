const allowedOrigins = require('./allowedOrigins')

const corsOptions = 
{
    origin: (origin, callBack) => 
    {
        if(allowedOrigins.indexOf(origin) !== -1)
        {
            callBack(null, true)
        }
        else
        {
            callBack(new Error('Not Allowed By Cors'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions