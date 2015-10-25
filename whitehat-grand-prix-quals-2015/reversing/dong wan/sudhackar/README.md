[](ctf=whitehat-grand-prix-quals-2015)
[](type=analysis,reverse)
[](tags=base64)
[](tools=gdb-peda)
[](techniques=)

#Dong Van (RE - 100)

So we have a [zip](../re100_35d14595b17756b79556f6eca775c31a.zip).
```bash
$ file Re100
Re100: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=6c7c0504ab2f342427f59846298e97f9e4fbb98f, not stripped

$ ./Re100 
Input your secret: AAAA
Too bad :(
```
So its checking for a password. A strings on the binary will tell us.
```bash
$ strings ./Re100
.
.

stoull
%llu
ELF8n0BKxOCbj/WU9mwle4cG6hytqD+P3kZ7AzYsag2NufopRSIVQHMXJri51Tdv
0000
Input your secret: 
ms4otszPhcr7tMmzGMkHyFn=
Good boy! Submit your flag :)
Too bad :(
.
.
```
We see some base64 here. But it doesn't work. So we'll load it up in gdb.

When we run it we see the input we pass is given on to a function change() and the output is matched with ms4otszPhcr7tMmzGMkHyFn=.
So this uses a custom encoding technique. Stepping through the program we see that the program uses 'ELF8n0BKxOCbj/WU9mwle4cG6hytqD+P3kZ7AzYsag2NufopRSIVQHMXJri51Tdv' as its character set in the same fasion as normal Base64.
So we write [this](re100-base64-custom.c).

```c
#include <stdio.h>
#include <string.h>

char b64[] = "ELF8n0BKxOCbj/WU9mwle4cG6hytqD+P3kZ7AzYsag2NufopRSIVQHMXJri51Tdv";

void decodeblock(unsigned char in[], char *clrstr) {
  unsigned char out[4];
  out[0] = in[0] << 2 | in[1] >> 4;
  out[1] = in[1] << 4 | in[2] >> 2;
  out[2] = in[2] << 6 | in[3] >> 0;
  out[3] = '\0';
  strncat(clrstr, out, sizeof(out));
}

void b64_decode(char *b64src, char *clrdst) {
  int c, phase, i;
  unsigned char in[4];
  char *p;

  clrdst[0] = '\0';
  phase = 0; i=0;
  while(b64src[i]) {
    c = (int) b64src[i];
    if(c == '=') {
      decodeblock(in, clrdst); 
      break;
    }
    p = strchr(b64, c);
    if(p) {
      in[phase] = p - b64;
      phase = (phase + 1) % 4;
      if(phase == 0) {
        decodeblock(in, clrdst);
        in[0]=in[1]=in[2]=in[3]=0;
      }
    }
    i++;
  }
}

int main() {
  char myb64[] = "ms4otszPhcr7tMmzGMkHyFn=";
  char mydst[1024] = "";

  b64_decode(myb64, mydst);
  printf("%s",mydst);

  return 0;
}
````

Which gives us 
> Funny_encode_huh!


Flag:
>WhiteHat{49a07ca9d78eefff4f3c7888eb1dedeb56b16f1c}


