class DelayQueueManager {
    /* Object to coordinate function call execution -- in a RUN then SCHEDULE style
    /  At the moment, we will only run one function at a time
    /  Start it by running "DelayQueueManager.run()""
    /  Add a command to execute by running "DelayQueueManager.schedule(testfuction, 1000)"
   */
    static delayQueue = [];

    // Call a function, followed by a delay
    static scheduleFunc(func, delayMs, param1=null) {
        this.delayQueue.push([func, delayMs, param1])
    };

    // static scheduleFuncs(funcsArray) {
    //     funcsArray.forEach(func => {
    //         console.log(func[0])
    //         console.log(func[1])
    //         // func[0] is the actual function, func[1] is the delay in ms
    //         this.delayQueue.push([func[0], func[1]])
    //     });
        
    // };

    static get() { return DelayQueueManager.delayQueue };

    // This runs continuously, checking for more commands to execute
    static run(sleepMsWhiledelayQueueEmpty = 1000) {
        console.log(DelayQueueManager.delayQueue)
        // Are there any functions to run in our queue? If so, schedule the next one!
        if (DelayQueueManager.delayQueue.length != 0) {

            // Execute the next function in the queue
            console.log(this.delayQueue)
            let nextFuncArray = DelayQueueManager.delayQueue[0]

            console.log(nextFuncArray)
            let func = nextFuncArray[0] // the function that will be called
            let delayMs = nextFuncArray[1] // the delay which will occur afterwards in ms
            let param1 = nextFuncArray[2] // a parameter passed in (can be null)
            // DelayQueueManager.delayQueue[0][0]()
            if(param1 !== null){
            console.log(`Passing param ${param1}`)
            func(param1)
            }
            else{
            console.log('Not passing param')
                func()
            }
            // Remove the function that we have just run
            DelayQueueManager.delayQueue.shift()

            // Schedule the DelayQueueManager to check/run functions again soon
            setTimeout(DelayQueueManager.run, delayMs)


        }
        else {
            //if the delayQueue is empty call myself agien after 2000 millaseconds
            setTimeout(DelayQueueManager.run, sleepMsWhiledelayQueueEmpty)
            console.log(`DelayQueue is empty, waiting ${sleepMsWhiledelayQueueEmpty} milliseconds before attempting to execute another function`)
        }
    }

}

module.exports = DelayQueueManager;

