const EventEmitter = require('events');

class Downloader extends EventEmitter {
    painting() {
        let steps = 0;
        const interval = setInterval(() => {
            steps += 10;
            this.emit('progress', steps);
            if (steps === 100) {
                clearInterval(interval);
                this.emit('done');
            }
        }, 300);
    }
}

const downloader = new Downloader();
downloader.on('progress', (percent) => {
    const totalChars = 20;
    const filledChars = percent / 5;
    const emptyChars = totalChars - filledChars;

    const hashes = '#'.repeat(filledChars);
    const dashes = '-'.repeat(emptyChars);

    process.stdout.write(`\r[${hashes}${dashes}] ${percent}%`);
});

downloader.on('done', () => {
    process.stdout.write('\nDownload complete!\n');
});

downloader.painting();