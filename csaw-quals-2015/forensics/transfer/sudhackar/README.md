[](ctf=csaw-quals-2015)
[](type=forensics)
[](tags=packet,)
[](tools=wireshark)
[](techniques=)

We are given a [pcap]() file.
On viewing in Wireshark and looking around we see some python code. Follow the TCP stream to get [file](../transfer.py)

```python
import string
import random
from base64 import b64encode, b64decode

FLAG = 'flag{xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx}'

enc_ciphers = ['rot13', 'b64e', 'caesar']
# dec_ciphers = ['rot13', 'b64d', 'caesard']

def rot13(s):
	_rot13 = string.maketrans("ABCDEFGHIJKLMabcdefghijklmNOPQRSTUVWXYZnopqrstuvwxyz","NOPQRSTUVWXYZnopqrstuvwxyzABCDEFGHIJKLMabcdefghijklm")
	return string.translate(s, _rot13)

def b64e(s):
	return b64encode(s)

def caesar(plaintext, shift=3):
    alphabet = string.ascii_lowercase
    shifted_alphabet = alphabet[shift:] + alphabet[:shift]
    table = string.maketrans(alphabet, shifted_alphabet)
    return plaintext.translate(table)

def encode(pt, cnt=5):
	tmp = '2{}'.format(b64encode(pt))
	for cnt in xrange(cnt):
		c = random.choice(enc_ciphers)
		i = enc_ciphers.index(c) + 1
		_tmp = globals()[c](tmp)
		tmp = '{}{}'.format(i, _tmp)
		print tmp,c,i

	return tmp

if __name__ == '__main__':
	print encode(FLAG)
#2Mk16Sk5iakYxVFZoS1RsWnZXbFZaYjFaa1prWmFkMDVWVGs1U2IyODFXa1ZuTUZadU1YVldiVkphVFVaS1dGWXlkbUZXTVdkMVprWnJWMlZHYz...
```
We also see a long string(redacted). This is the cipher text generated from the above code and its easy to reverse.
Every block has a number (1,2 or 3) followed by sometext, we can easily convert it back.

Here is the [script](solve.py) for same.

```python
import string
import random
from base64 import b64encode, b64decode
def rot13(s):
	_rot13 = string.maketrans("NOPQRSTUVWXYZnopqrstuvwxyzABCDEFGHIJKLMabcdefghijklm","ABCDEFGHIJKLMabcdefghijklmNOPQRSTUVWXYZnopqrstuvwxyz")
	return string.translate(s, _rot13)

def b64e(s):
	return b64decode(s)

def caesar(plaintext, shift=-3):
	alphabet = string.ascii_lowercase
	shifted_alphabet = alphabet[shift:] + alphabet[:shift]
	table = string.maketrans(alphabet, shifted_alphabet)
	return plaintext.translate(table)

a='''2Mk16Sk5iakYxVFZoS1RsWnZXbFZaYjFaa1prWmFkMDVWVGs1U2IyODFXa1ZuTUZa...'''

def decrypt(s):
	if int(s[0])==1:
		return rot13(s[1:])
	if int(s[0])==2:
		return b64e(s[1:])
	if int(s[0])==3:
		return caesar(s[1:])


for i in range(80):
	try:
		a=decrypt(a)
	except:
		pass
print a
```

will give us flag

> flag{li0ns_and_tig3rs_4nd_b34rs_0h_mi}
