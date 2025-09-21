# darcrackme

#### Category: rev
#### Points: 200

The binary asks for username and password when we run it.

```
./darkcrackme     

||============================================||
||              DARK ARMY SAFE v2.0           ||
||~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~||
||                                            ||
|                                              |
|       / /        (\-"```"-/)       \ \       |
|      / /         //^\   /^\\        \ \      |
|     / /         ;/ ~_\ /_~ \;        \ \     | 
|    / /           |  / \Y/ \  |        \ \    |
|   | |          (,  \0/ \0/  ,)         | |   |
|    \ \          |   /   \   |         / /    |
|     \ \         | (_\._./_) |        / /     |
|      \ \       )|\ \v-.-v/ /|(      / /      |
|       \ \     / ) \ `===' / ( \    / /       |
|               """           """              |
||~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~||
||  Only the top 1% of the 1% can crack me!   ||
||============================================||

Username :: asd
Password :: as
```

Opening the binary in ghidra, we see,

```c
  iVar1 = strcmp(username,"1_4m_th3_wh1t3r0s3");
  if (iVar1 == 0) {
    iVar1 = FUN_004013f9(username,password);
    if (iVar1 == 1) {
      puts("\nAuthorised!!");
      printf("Here is my Dark Secret : infernoCTF{%s}\n",local_e8);
    }
    else {
      puts("\nAre you trying to pwn the pwners");
    }
  }
```

Our username and password is the parameters to a function.

When we look inside the function, we see that another string is constructed using our password and is check against the username.

The function roughly does:

* For every character in input, get the index of character in one of 2 strings, depending on whether index is even or odd.
* Convert this index into binary.
* Interleave the 2 binary numbers to new number(Ex: if t1 is 0b1011 and t2 is -b1001 result is 0b11001011)
* This number is the character at the index

Corresponding C code:

```c
  while( true ) {
    sVar2 = strlen(password);
    if (sVar2 <= (ulong)(long)local_20) break;
    local_44 = idx_in_1("ADGJLQETUOZCBM10",password[local_20]);
    local_48 = idx_in_1("sfhkwryipxvn5238",password[(long)local_20 + 1]);
    local_50 = to_bin(local_44);
    local_58 = to_bin(local_48);
    local_24 = 0;
    while ((int)local_24 < 8) {
      if ((local_24 & 1) == 0) {
        local_19 = local_50[(int)local_24 / 2];
      }
      else {
        local_19 = local_58[(int)local_24 / 2];
      }
      local_68[(int)local_24] = local_19;
      local_24 = local_24 + 1;
    }
    lVar1 = strtol(local_68,(char **)0x0,2);
    local_30[local_20 / 2] = (char)lVar1;
    local_20 = local_20 + 2;
  }
```

I initialy rewrote the functions in python to inspect them:

```python
def to_bin(param1):
    t = ['1'] * 5
    j = 3
    local1 = param1
    while local1 > 0:
        if (local1 & 1) == 0:
            t[j] = '1'
        else:
            t[j] = '0'
        j -= 1
        local1 = local1//2
    return ''.join(t)

def idx_in_1(p1: str, p2: str) -> int:
    idx = p1.find(p2)
    return idx
```

Once I got a clear idea, I wrote the following script which reverses the algorithm.

```python
stri = "1_4m_th3_wh1t3r0s3"

flag = ['*']* 0x24
s1 = "ADGJLQETUOZCBM10"
s2 = "sfhkwryipxvn5238"

i = 0
while i < len(stri):
    print(i)
    b = ord(stri[i])
    # b = bin(ord(b))[2:]
    b = f'{b:08b}'
    print(b)

    t1 = ''
    t2 = ''

    for idx in range(len(b)):
        if idx %2:
            t2 += b[idx]
        else:
            t1 += b[idx]

    print(t1, t2)

    flag[i*2] = s1[rev_bs(t1)]
    flag[i*2+1] = s2[rev_bs(t2)]
    i+=1

print(''.join(flag))
flag = ''.join(flag)

from pwn import *
# p = gdb.debug('./darkcrackme', 'b *0x004013cd')
p = process('./darkcrackme')
p.sendline(stri.encode())
p.sendline(flag.encode())
p.interactive()
```
