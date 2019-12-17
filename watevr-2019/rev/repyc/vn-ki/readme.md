# Repyc

#### Category: Rev
#### Points: 147

This was a python bytecode reversing challenge. We are given a python 3.6 bytecode compiled [file](./decomp.py).
Once decompiled we get a python file with variables as unicode characters.

```python
佤 = 0
侰 = ~佤 * ~佤
俴 = 侰 + 侰

def 䯂(䵦):
    굴 = 佤
    굿 = 佤
    괠 = [佤] * 俴 ** (俴 * 俴)
    궓 = [佤] * 100
    괣 = []
    while 䵦[굴][佤] != '듃':
        굸 = 䵦[굴][佤].lower()
        亀 = 䵦[굴][侰:]
        if 굸 == '뉃':
            괠[亀[佤]] = 괠[亀[侰]] + 괠[亀[俴]]
        elif 굸 == '렀':
            괠[亀[佤]] = 괠[亀[侰]] ^ 괠[亀[俴]]
        elif 굸 == '렳':
            괠[亀[佤]] = 괠[亀[侰]] - 괠[亀[俴]]
        elif 굸 == '냃':
            괠[亀[佤]] = 괠[亀[侰]] * 괠[亀[俴]]
        elif 굸 == '뢯':
            괠[亀[佤]] = 괠[亀[侰]] / 괠[亀[俴]]
        elif 굸 == '륇':
            괠[亀[佤]] = 괠[亀[侰]] & 괠[亀[俴]]
        elif 굸 == '맳':
            괠[亀[佤]] = 괠[亀[侰]] | 괠[亀[俴]]
        elif 굸 == '괡':
            괠[亀[佤]] = 괠[亀[佤]]
        elif 굸 == '뫇':
            괠[亀[佤]] = 괠[亀[侰]]
```

I thought this was some obfuscation technique and wasted some time looking for deobfuscators.

Then I tried to rename the variables and try to make sense of the code.

The function is later called with a list of lists.

```python

 ['꽺', 0, 0],
 ['꼖',
  6,
  'á×äÓâæíäàßåÉÛãåäÉÖÓÉäàÓÉÖÓåäÉÓÚÕæïèäßÙÚÉÛÓäàÙÔÉÓâæÉàÓÚÕÓÒÙæäàÉäàßåÉßåÉäàÓÉÚÓáÉ·Ôâ×ÚÕÓÔÉ³ÚÕæïèäßÙÚÉÅä×ÚÔ×æÔÉ×Úïá×ïåÉßÉÔÙÚäÉæÓ×ÜÜïÉà×âÓÉ×ÉÑÙÙÔÉâßÔÉÖãäÉßÉæÓ×ÜÜïÉÓÚÞÙïÉäàßåÉåÙÚÑÉßÉàÙèÓÉïÙãÉáßÜÜÉÓÚÞÙïÉßäÉ×åáÓÜÜ\x97ÉïÙãäãÖÓ\x9aÕÙÛ\x99á×äÕà©â«³£ï²ÕÔÈ·±â¨ë'],
 ['꼖', 2, 120],
```

After soem renaming, we can see the function acts as an executor and the list is a list of commands.

The control flow of deobfuscation is wrong. We can see this by executing both pyc and decompiled py file.

So I used pdb to step through the bytecode.

```sh
$ python -i 3nohtyp.pyc
Authentication token: Traceback (most recent call last):
  File "circ.py", line 135, in <module>
  File "circ.py", line 45, in 䯂
KeyboardInterrupt
>>> import pdb
>>> pdb.runcall(䯂, 䯂)
> /home/vn-ki/ctf/watevr/repyc/circ.py(5)䯂()
(Pdb)
```

We can see that our input is processed by subtracting 15 and xoring with 135.

The following script solves for the flag.

```python
t = 'á×äÓâæíäàßåÉÛãåäÉÖÓÉäàÓÉÖÓåäÉÓÚÕæïèäßÙÚÉÛÓäàÙÔÉÓâæÉàÓÚÕÓÒÙæäàÉäàßåÉßåÉäàÓÉÚÓáÉ·Ôâ×ÚÕÓÔÉ³ÚÕæïèäßÙÚÉÅä×ÚÔ×æÔÉ×Úïá×ïåÉßÉÔÙÚäÉæÓ×ÜÜïÉà×âÓÉ×ÉÑÙÙÔÉâßÔÉÖãäÉßÉæÓ×ÜÜïÉÓÚÞÙïÉäàßåÉåÙÚÑÉßÉàÙèÓÉïÙãÉáßÜÜÉÓÚÞÙïÉßäÉ×åáÓÜÜ\x97ÉïÙãäãÖÓ\x9aÕÙÛ\x99á×äÕà©â«³£ï²ÕÔÈ·±â¨ë'
s = ''
for i in range(len(t)):
  s += chr((ord(t[i]) + 15)^135)
print(s)
```


flag: `watevr{this_must_be_the_best_encryption_method_evr_henceforth_this_is_the_new_Advanced_Encryption_Standard_anyways_i_dont_really_have_a_good_vid_but_i_really_enjoy_this_song_i_hope_you_will_enjoy_it_aswell!_youtube.com/watch?v=E5yFcdPAGv0}`
