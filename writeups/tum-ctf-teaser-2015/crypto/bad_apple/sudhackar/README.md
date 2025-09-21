[](ctf=tum-ctf-teaser-2015)
[](type=crypto)
[](tags=hash-length-extension-attack)
[](tool=hashpump)

# bad_apple (crypto 15)

```
Baby's 1st

ctf.link/assets/downloads/cry/bad_apple.tar.xz

try:
    ncat 1.ctf.link 1027 < good.bin
expect:
    "hello"
```

We are given a [tar archive](../bad_apple.tar.xz)
It has a python file which is probably the source of the service

```python
#!/usr/bin/env python3
import sys, binascii
from Crypto.Hash import SHA256

key = open('key.bin', 'rb').read()

message = sys.stdin.buffer.read(0x100)
if len(message) < SHA256.digest_size:
  print('len')
  exit(0)

tag, message = message[:SHA256.digest_size], message[SHA256.digest_size:]

if SHA256.new(key + message).digest() != tag:
  print('bad')
  exit(0)

if b'hello pls' in message:
  print('hello')
if b'flag pls' in message:
  print(open('flag.txt', 'r').read())
```

Also 

```bash
$ xxd good.bin 
0000000: 2628 455f 6617 ecea 0248 95a4 8578 ebce  &(E_f....H...x..
0000010: 00fa 9204 983d 09b6 d175 7d05 dc43 0567  .....=...u}..C.g
0000020: 6865 6c6c 6f20 706c 73                   hello pls
````

We see that the service uses sha256 to verify the signature and then process the message.
We can use hash [Length Extension Attack](https://en.wikipedia.org/wiki/Length_extension_attack) to verify a request with a message 'flag pls'.

I use [hashpump](https://github.com/bwall/HashPump) to do the same. There is no information about the key. Hashpump needs a key length for the attack. We'll bruteforce that.

```python
import hashpumpy
original='hello pls'
add='flag pls'
hash_old='2628455f6617ecea024895a48578ebce00fa9204983d09b6d1757d05dc430567'
limit=100
for i in xrange(limit):
	f=open('lol/'+str(i),'w')
	l=hashpumpy.hashpump(hash_old,original,add,i)
	f.write(l[0].decode('hex')+l[1])
	f.close()
```

will five me hundred files in lol directory.

```bash
$ for i in {1..100}; do ncat 1.ctf.link 1027 < $i ; done
bad
bad
.
.
hello
hxp{M3rkL3_D4mg4rd_h4s_s0m3_Pr0bl3mZ}

bad
^C
```
for keylength 32 it worked.

Flag
> hxp{M3rkL3_D4mg4rd_h4s_s0m3_Pr0bl3mZ}
