import amqplib from 'amqplib'
import taskModel from './model.js'
import express from 'express'


const queueName = 'scheduler'   
const app = express()                                                          // initializing nodejs server
const port = 3002
let scheduledTasks = []                                                        // array to store incoming tasks from rabbitmq

app.get('/',(req,res)=>{
    res.json(scheduledTasks)                                                   // api for getting the scheduledTasks
})                                                                              


const saveinDb = async (item)=>{                                               // funtion to save incoming tasks into the local tiDB
    const {priority,dependency,time,job} = item
    if(scheduledTasks.length == 0)  await taskModel.sync({force : true})       //checking for existing tables 
    else await taskModel.sync({})
    const test1 = taskModel.build({                                            // building the object using taskModel from model.js
        job,
        priority,
        time,
        dependency
    })
    let temp = await test1.save()                                               // saving the data to local tiDB
    console.log(scheduledTasks)
}



const receiveTasks = async ()=>{                                               // function to consume tasks from rabbitMQ
    const connection = await amqplib.connect('amqp://localhost')
    const channel = await connection.createChannel()
    await channel.assertQueue(queueName,{durable:false})                        //creating scheduler queue
    channel.consume(queueName, (message) =>{                                    //listening for events on scheduler queue
        let receivedItem = message.content.toString()
        let item = JSON.parse(receivedItem)                                     // parsing the received string into JSON objext
        saveinDb(item)                                                          // saving the receivedItem in database
        taskScheduler({...item,ch_P : item.priority})                           // add the received item to sacheduledTasks array;
    },{noAck:true})
}   



const reArrangeTasks = (i) => {                                              //funtion to rearrange the items in scheduledTask array
        while(i>0 && scheduledTasks[i-1].ch_P > scheduledTasks[i].ch_P) {       
            let temp = scheduledTasks[i];
            scheduledTasks[i] = scheduledTasks[i-1];
            scheduledTasks[i-1] = temp;
            i--;
        }
}


const taskScheduler = async (item)=>{                                        // funtion to arrange items according to priority
    if(item.dependency == 'nil') {
        scheduledTasks.push(item);
        let i = scheduledTasks.length - 1
        reArrangeTasks(i);
    }

    else {
        let dependencyJobIndex = -1;
        for(let i = 0;i<scheduledTasks.length;i++) {
            if(scheduledTasks[i].job == item.dependency) {
                dependencyJobIndex = i;
                scheduledTasks[i].ch_P = item.ch_P
                break;
            }
        }

        reArrangeTasks(dependencyJobIndex)
        scheduledTasks.push(item);
        reArrangeTasks(scheduledTasks.length-1)
    }
}

app.listen(port)
receiveTasks()                                                                     // connect to RabbitMQ