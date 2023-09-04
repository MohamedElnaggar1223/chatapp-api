const mongoose = require('mongoose')

async function connectDB()
{
    try
    {
        //@ts-ignore
        await mongoose.connect(process.env.DATABASE_URI)
    }
    catch(e)
    {
        console.error(e)
    }
}

module.exports = connectDB 