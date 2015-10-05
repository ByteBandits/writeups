[](ctf=ekoparty-2015)
[](type=pwn)
[](tags=)
[](tools=)
[](techniques=)

# PRNG Service (pwn-25)

We are a given [a file written in C](../pwn25.c).

We see that the code first creates an array of length 128 called _rnd_. Then it pretends to generate random numbers, but all is does is sleep for 2 seconds and then generated random numbers using on a hard-coded seed (1337). In First part of the array, _ANSWER_ is copied. This must be the flag we are looking for. In second half of the array, generated random numbers are stored. Then the code asks for 10 numbers in the range [0-63] as input, and prints out the values stored at index 64+input of _rnd_. Only input validation done is to check whether given number is less that 64. So there is in fact no reason for us to care about the random numbers, since nothing is stopping us from entering negative numbers and accessing elements from the first half. So it's straightforward to get the answer - enter negative indices as inputs.

Wrote down a [quick script](pwn.py) to automate this. Ran the code,

Aand there's the flag
> EKO{little_endian_and_signed_-1nt}
