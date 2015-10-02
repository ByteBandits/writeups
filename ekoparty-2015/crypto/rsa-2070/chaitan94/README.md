[](ctf=ekoparty-2015)
[](type=crypto)
[](tags=rsa)

We have a public key, let's get the modulus (n) and exponent (e)

```bash
$ openssl rsa -pubin -inform PEM -text -noout < public.key
Public-Key: (2070 bit)
Modulus:
    25:b1:8b:f5:f3:89:09:7d:17:23:78:66:bb:51:cf:
    f8:de:92:24:53:74:9e:bc:40:3b:09:95:c9:7c:0e:
    38:6d:46:c1:61:ca:df:f7:7c:69:86:0d:ae:47:91:
    c2:14:cf:84:87:aa:aa:9f:26:e9:20:a9:77:83:49:
    06:03:8a:ef:b5:c3:08:27:df:cf:3f:c9:e9:76:95:
    44:f9:4e:07:cd:fe:08:72:03:9a:3a:62:62:11:66:
    78:b2:61:fb:2d:6b:9d:32:53:9e:92:a1:53:b3:67:
    56:29:ba:b3:94:2e:7d:35:e3:0f:7e:ef:5a:bf:1c:
    50:d7:97:d0:cc:88:e1:bd:cc:fd:1a:12:ea:6f:7e:
    f7:5c:37:27:db:df:2e:78:0f:34:28:ae:8f:7a:4f:
    b7:a8:9f:18:4a:36:50:32:b1:53:f8:42:5e:84:57:
    50:eb:2b:7a:bc:02:dc:15:ce:02:07:50:7a:a9:50:
    86:3b:b8:48:0a:78:02:8d:d6:29:79:94:4d:6c:63:
    3f:af:a1:03:e4:db:28:ce:87:f5:a0:c6:ed:4a:2f:
    26:64:42:7f:56:5c:77:81:ab:61:91:45:6d:97:1c:
    7f:fa:39:52:72:37:4c:ec:01:55:e5:f9:11:89:db:
    74:2e:4c:28:b0:3a:0f:a1:1c:ff:b0:31:73:d2:a4:
    cc:e6:ae:53
Exponent: 65537 (0x10001)
```

We have the modulus, let's check [factordb.com](http://factordb.com) if we can get its factors (p and q)

Now that the factors are known, let's generate the private key using [rsatool](https://github.com/ius/rsatool)

```bash
$ python2 rsatool.py -f PEM -o private.pem -p 25478326064937419292200172136399497719081842914528228316455906211693118321971399936004729134841162974144246271486439695786036588117424611881955950996219646807378822278285638261582099108339438949573034101215141156156408742843820048066830863814362379885720395082318462850002901605689761876319151147352730090957556940842144299887394678743607766937828094478336401159449035878306853716216548374273462386508307367713112073004011383418967894930554067582453248981022011922883374442736848045920676341361871231787163441467533076890081721882179369168787287724769642665399992556052144845878600126283968890273067575342061776244939 -q 3133337
```

Now we have to just decrypt using the generated private key

```bash
$ base64 -d flag.enc | openssl rsautl -decrypt -inkey private.pem
```

Apparently, this doesn't seem to work, let's try decrypting with pycrypto library (see [rsa_decrypt.py](rsa_decrypt.py)).

```bash
$ python2 rsa_decrypt.py flag.enc private.pem
```

Aaand there's our flag:
> EKO{classic\_rsa\_challenge\_is\_boring\_but\_necessary}
