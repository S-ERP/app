export default {
    readFileChunk: (file, start, end) => {
        return new Promise((resolve, reject) => {
            resolve(file.slice(start, end))

        });
    }
}