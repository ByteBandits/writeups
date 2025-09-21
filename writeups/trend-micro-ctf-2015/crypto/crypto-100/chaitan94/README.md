[](ctf=trend-micro-ctf-2015)
[](type=crypto)
[](tags=rsa)
[](tools=factordb,rsatool,openssl)
[](techniques=rsa)

# crypto-100

Problem description
> You're given an RSA public key and an encrypted message which contains a flag. Get the flag.
>
> There's also a hint about "1bit" being wrong in the public key.
>
> message: kPmDFLk5b/torG53sThWwEeNm0AIpEQek0rVG3vCttc=

So lets go ahead and get the modulus (n) and exponent (e) from the given [public key](../PublicKey.pem)
```bash
$ openssl rsa -pubin -inform PEM -text -noout < PublicKey.pem
Public-Key: (256 bit)
Modulus:
    00:b6:2d:ce:9f:25:81:63:57:23:db:6b:18:8f:12:
    f0:46:9c:be:e0:cb:c5:da:cb:36:c3:6e:0c:96:b6:
    ea:7b:fc
Exponent: 65537 (0x10001)
```
n's value in base 10 is 82401872610398250859431855480217685317486932934710222647212042489320711027708

Hmm, n is even? Question says 1 bit is wrong.. it has to be last bit!

So, n must be 82401872610398250859431855480217685317486932934710222647212042489320711027709

Lets try http://www.factordb.com/index.php?query=82401872610398250859431855480217685317486932934710222647212042489320711027709

Perfect! Got p and q.

Let's generate private key and decrypt
```bash
$ python2 rsatool.py -f PEM -o private.pem -p 279125332373073513017147096164124452877 -q 295214597363242917440342570226980714417
$ echo "kPmDFLk5b/torG53sThWwEeNm0AIpEQek0rVG3vCttc=" > flag.enc 
$ base64 -d flag.enc | openssl rsautl -decrypt -inkey private.pem
```

Aand we get out flag
> TMCTF{$@!zbo4+qt9=5}
