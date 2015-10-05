[](ctf=ekoparty-2015)
[](type=misc)
[](tags=pwsafe,john)
[](tools=john)
[](techniques=bruteforce-attack)

# Password Manager (misc-100)

We're given a [Password Safe V3 database](../mypasswords) and a hint: [a-zA-Z0-9]{0,4}. So, time to use [john](http://www.openwall.com/john/) and crack it open!

Let's run [pwsafe2john](https://github.com/piyushcse29/john-the-ripper/blob/master/src/pwsafe2john.c) on it and get a hash first, so that john can crack the password from the produced hash.

```bash
$ pwsafe2john mypasswords > hash.txt
```

We also had a hint, so instead of letting john brute-force all possibilities, let's generate a wordlist and then run john using it:

```python
ALNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
c = 0
q = ''

def rec(i, s):
    if i > 4: return
    global c, q
    c += 1
    q += ''.join(s + ['\n'])
    if c % 100000 == 0:
        with open("wordlist", "a") as f:
            f.write(q)
        q = ''
    for a in ALNUM:
        rec(i + 1, s + [a])

rec(0, [])
```

After running the above code, our wordlist will be generated (roughly 72 MB :P). Now, we just have to give this to john, and it is going to crack the password for us.

```bash
$ john -w=wordlist hash.txt
```

Now let it run for a few minutes.. and we see that john cracked it: 'Ek0'

Now installed [pwsafe software](http://pwsafe.info/), and opened the given database with the password 'Ek0'

Aaand there's our flag:
> EKO{password\_managers\_rulez}
