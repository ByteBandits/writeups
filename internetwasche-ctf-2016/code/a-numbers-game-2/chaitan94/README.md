[](ctf=internetwasche-ctf-2016)
[](type=code)
[](tags=bot,crypto,math)
[](tools=sympy)
[](techniques=)

# A Numbers Game II (code-70)

> Math is used in cryptography, but someone got this wrong. Can you still solve the equations? Hint: You need to encode your answers.

We are given the following information in a flag:
> This snippet may help:
> 
> ```python
>     def encode(self, eq):
>         out = []
>         for c in eq:
>             q = bin(self._xor(ord(c),(2<<4))).lstrip("0b")
>             q = "0" * ((2<<2)-len(q)) + q
>             out.append(q)
>         b = ''.join(out)
>         pr = []
>         for x in range(0,len(b),2):
>             c = chr(int(b[x:x+2],2)+51)
>             pr.append(c)
>         s = '.'.join(pr)
>         return s
> ```

Now we have a service running on 188.166.133.53:11071, which gives messages like this
> Hi, I like math and cryptography. Can you talk to me?!
> Level 1.: 4.4.5.3.3.3.3.3.3.3.6.4.3.3.3.3.3.4.3.4.3.4.3.3.3.3.3.3.3.4.6.4.3.3.3.3.3.3.6.4.3.4.4.5

Obviously, to be able to reply, we need to be able to understand the encoded message.
We need to write a decoding function before we can proceed further. So, let's do that.

The given encoding function does the following things to encode a string:

 1. Consider the string as a byte-stream and XOR with 32 for each byte
 2. Consider the string as a crumb-stream (crumb=2 bits) and replace each crumb with the following:
     1. if 00, replace it with character '3' 
     2. if 01, replace it with character '4'
     3. if 10, replace it with character '5'
     4. if 11, replace it with character '6'
 3. Join all these characters with '.' in between

Therefore, to decode this we simply do the reverse:

 1. Split the characters with '.' in between them
 2. Create a crumb-stream by replacing each character with respective crumb:
     1. if character is '3', replace it with the crumb 00 
     2. if character is '4', replace it with the crumb 01
     3. if character is '5', replace it with the crumb 10
     4. if character is '6', replace it with the crumb 11
 3. Consider the crumb-stream as a byte-stream and XOR with 32 for each byte
 4. Return as a string

Great, now lets decode the original message and see what's in there:
```python
>>> decode('4.4.5.3.3.3.3.3.3.3.6.4.3.3.3.3.3.4.3.4.3.4.3.3.3.3.3.3.3.4.6.4.3.3.3.3.3.3.6.4.3.4.4.5')
'x - 10 = -6'
```

An algebraic equation! Looks like we need to send the value of x which satisfies the given equation.

So,  quickly [wrote a script](main.py) using the [SymPy](http://www.sympy.org/) library which automatically solves the given levels. We let it run for 100 levels..

Aaand there's our flag:
> IW{Crypt0_c0d3}
