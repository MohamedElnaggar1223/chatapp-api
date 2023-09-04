const path = require('path')
const { format } = require('date-fns')
const { v4: uuid } = require('uuid')
const fsPromises = require('fs').promises

async function logEvents(msg, fileName)
{
    const date = format(new Date, 'yyyy-MM-dd\tHH:mm:ss')
    const logItem = `${date}\t${uuid()}\t${msg}\n`

    try 
    {
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', fileName), logItem)
    } 
    catch (error) 
    {
        console.log(error)
    }
}

async function logger(req, res, next)
{
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.log')
    next()
}

module.exports = { logger, logEvents }