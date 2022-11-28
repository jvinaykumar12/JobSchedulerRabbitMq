import { Sequelize,DataTypes } from 'sequelize'


const sequelize = new Sequelize('mysql://127.0.0.1:4000/test?user=root')     // using Sequilize orm to connect to local tiDB

const taskModel = sequelize.define('Tasks',{                                 // creating a Model to store Tasks table
    id : {
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    job: {
        type : DataTypes.INTEGER
    },
    priority : {
        type : DataTypes.INTEGER
    },
    title : {
        type : DataTypes.STRING
    },
    time : {
        type : DataTypes.STRING
    },
    dependency : {
        type : DataTypes.STRING
    }},{
        timeStamps : false
})


export default taskModel
