const EventEmitter = require('node:events');

class TaskQueue extends EventEmitter {
    #queue = [];
    #running = 0;
    #concurrency;

    constructor(concurrency) {
        super()
        if (!Number.isInteger(concurrency) || concurrency < 1) {
            throw new Error('Concurrency must be a positive integer');
        }
        this.#concurrency = concurrency;
    }
    add(id, cb) {
        this.#queue.push({ id, cb });
        this.#process();
    }
    #process() {
        while (this.#running < this.#concurrency && this.#queue.length > 0) {
            const job = this.#queue.shift();
            ++this.#running;
            console.log(`Starting job ${job.id}`);

            job.cb().then(res => {
                console.log(`Job ${job.id} completed`, res);
            }).catch(err => {
                console.log(`Job ${job.id} failed`, err.message);
            }).finally(() => {
                --this.#running;
                this.#process();
            });
        }
    }
}

const queue = new TaskQueue(2);
queue.add('A', async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return 'result-A';
});
queue.add('B', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'result-B';
});
queue.add('C', async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return 'result-C';
});
queue.add('D', async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return 'result-D';
});