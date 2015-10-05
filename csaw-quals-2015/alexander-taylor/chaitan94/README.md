[](ctf=csaw-quals-2015)
[](type=recon)
[](tags=googling)

# Alexander Taylor

This question has a series of small tasks.


First, we are given link http://fuzyll.com/csaw2015/start which takes to part 1

> Part 1 of ?: Oh, good, you can use HTTP! The next part is at /csaw2015/<the acronym for my universitys hacking club>.

By googling "Alexander Taylor", we find his LinkedIn page: https://www.linkedin.com/in/fuzyll

We see "President of the Whitehatters Computer Security Club"

That takes to the next part: /csaw2015/wcsc


> CSAW 2015 FUZYLL RECON PART 2 OF ?: TmljZSB3b3JrISBUaGUgbmV4dCBwYXJ0IGlzIGF0IC9jc2F3MjAxNS88bXkgc3VwZXIgc21hc2ggYnJvdGhlcnMgbWFpbj4uCg==

```bash
$ echo "TmljZSB3b3JrISBUaGUgbmV4dCBwYXJ0IGlzIGF0IC9jc2F3MjAxNS88bXkgc3VwZXIgc21hc2ggYnJvdGhlcnMgbWFpbj4uCg==" | base64 -d                                                     
Nice work! The next part is at /csaw2015/<my super smash brothers main>.
```

So googled "Alexander Taylor Super Smash Brothers", nothing useful in the first page..

Googled "fuzyll Super Smash Brothers", found a youtube video titled "Smash 4 Monthly (July 2015) - Fuzyll (Yoshi) vs. AgentZ ..."

That takes us to next part: /csaw2015/yoshi


Part 3 gives us [an image file of yoshi](../yoshi). Downloaded it, and ran strings on it.
```bash
$ strings yoshi | less
....
CSAW 2015 FUZYLL RECON PART 3 OF ?: Isn't Yoshi the best?! The next egg in your hunt can be found at /csaw2015/<the cryptosystem I had to break in my first defcon qualifier>.
....
```

Hmm, this was the only hard part, googled aroud quite a lot of bit, but couldn't find anything. Finally decided I'll just try few random cryptosystems I know of:

After trying /csaw2015/rsa and /csaw2015/ecc, I tried /csaw2015/enigma and bingo!


> CSAW 2015 FUZYLL RECON PART 4 OF 5: Okay, okay. This isn't Engima, but the next location was "encrypted" with the JavaScript below: Pla$ja|p$wpkt$kj$}kqv$uqawp$mw>$+gwes6451+pla}[waa[ia[vkhhmj
```javascript
var s = "THIS IS THE INPUT"
var c = ""
for (i = 0; i < s.length; i++) {
    c += String.fromCharCode((s[i]).charCodeAt(0) ^ 0x4);
}
console.log(c);
```

This one is quite easy.. xor encryption decrypts itself, so didn\'t even have to code anything - changed the value of variable s to given cipher text and ran the code in the brower's console, resulting in the decrypted text:

The next stop on your quest is: /csaw2015/they_see_me_rollin

Aaand there's our flag!
>CSAW 2015 FUZYLL RECON PART 5 OF 5: Congratulations! Here's your flag{I_S3ARCH3D_HI6H_4ND_L0W_4ND_4LL_I_F0UND_W4S_TH1S_L0USY_FL4G}!

