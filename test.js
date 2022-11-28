import axios from "axios";

let testCases = [1,2,"nil",2,2,"nil",3,1,1,4,1,"nil",5,3,"nil",6,1,5]   // test cases for testing the job scheduler
                                                                         

for(let i=0;i<testCases.length;i=i+3) {
    let temp = {
        job : testCases[i],
        priority : testCases[i+1],
        dependency : testCases[i+2]
    }
    setTimeout(()=>{
        console.log(temp)
        axios.post('http://localhost:3001/sms',temp)                    // sendind requests to sms service
    },i*500)
}