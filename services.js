import express from 'express'
import amqplib from 'amqplib'

const app = express()                                                //initialization of nodejs server

const port = 3001
const queueName = 'scheduler'
app.use(express.json())

app.post('/sms', async (req, res) => {                                 // route for /sms service
  
    const connection = await amqplib.connect('amqp://localhost')        // connecting to local rabbitmq using amqplib library
    const channel = await connection.createChannel()                    // creating a channel to rabbitmq
    await channel.assertQueue(queueName,{durable:false})                // connecting to a queue
    const date = new Date();
    const time = date.toTimeString().split(' ')[0].split(':');
    channel.sendToQueue(queueName,Buffer.from(JSON.stringify({           // sending data into the queue
        ...req.body,
        time : time[0] + ':' + time[1],
    })))
    setTimeout(()=>{
        connection.close()

    },100)
    res.send('message sent')
})


app.post('/email', async (req, res) => {
    const connection = await amqplib.connect('amqp://localhost')
    const channel = await connection.createChannel()
    await channel.assertQueue(queueName,{durable:false})
    channel.sendToQueue(queueName,Buffer.from(JSON.stringify(req.body)))
    setTimeout(()=>{
        connection.close()

    },100)
    res.send('message sent')
})

app.listen(port)                                                // server listening on port 3001