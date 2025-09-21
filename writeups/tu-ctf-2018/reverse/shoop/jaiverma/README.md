[](ctf=tu-ctf-2018)
[](type=reversing)
[](tags=malloc,memcpy)
[](tools=radare2,gdb-peda)

# Shoop

We are given a [binary](../shoop) which accepts user input and validates it before printing the flag.

```bash
vagrant@amy:~/share/shoop$ file shoop
shoop: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=2569da7d2c1014488a9a5fad953f7e6d1791125e, not stripped
```

The disassembly can be viewed using a disassembler like `radare2`.

```assembly
[0x00000990]> pdf
┌ (fcn) main 518

...

│       ┌─< 0x00000a4b      eb29           jmp 0xa76
│       │   ; CODE XREF from main (0xa7a)
│      ┌──> 0x00000a4d      8b45f0         mov eax, dword [nbyte]
│      ╎│   0x00000a50      2b45fc         sub eax, dword [local_4h]
│      ╎│   0x00000a53      4898           cdqe
│      ╎│   0x00000a55      488d50ff       lea rdx, [rax - 1]
│      ╎│   0x00000a59      488b45e0       mov rax, qword [s2]
│      ╎│   0x00000a5d      4801c2         add rdx, rax                ; '#'
│      ╎│   0x00000a60      8b45fc         mov eax, dword [local_4h]
│      ╎│   0x00000a63      4863c8         movsxd rcx, eax
│      ╎│   0x00000a66      488b45e8       mov rax, qword [buf]
│      ╎│   0x00000a6a      4801c8         add rax, rcx                ; '&'
│      ╎│   0x00000a6d      0fb600         movzx eax, byte [rax]
│      ╎│   0x00000a70      8802           mov byte [rdx], al
│      ╎│   0x00000a72      836dfc01       sub dword [local_4h], 1
│      ╎│   ; CODE XREF from main (0xa4b)
│      ╎└─> 0x00000a76      837dfc00       cmp dword [local_4h], 0
│      └──< 0x00000a7a      79d1           jns 0xa4d
│           0x00000a7c      8b45f0         mov eax, dword [nbyte]
│           0x00000a7f      4863d0         movsxd rdx, eax             ; size_t n
│           0x00000a82      488b4de0       mov rcx, qword [s2]
│           0x00000a86      488b45e8       mov rax, qword [buf]
│           0x00000a8a      4889ce         mov rsi, rcx                ; const void *s2
│           0x00000a8d      4889c7         mov rdi, rax                ; void *s1
│           0x00000a90      e88bfdffff     call sym.imp.memcpy         ; void *memcpy(void *s1, const void *s2, size_t n)
│           0x00000a95      c745f8000000.  mov dword [local_8h], 0
│       ┌─< 0x00000a9c      eb34           jmp 0xad2
│       │   ; CODE XREF from main (0xad8)
│      ┌──> 0x00000a9e      8b45f8         mov eax, dword [local_8h]
│      ╎│   0x00000aa1      4863d0         movsxd rdx, eax
│      ╎│   0x00000aa4      488b45e8       mov rax, qword [buf]
│      ╎│   0x00000aa8      4801d0         add rax, rdx                ; '('
│      ╎│   0x00000aab      0fb600         movzx eax, byte [rax]
│      ╎│   0x00000aae      8845df         mov byte [local_21h], al
│      ╎│   0x00000ab1      0fb645df       movzx eax, byte [local_21h]
│      ╎│   0x00000ab5      83e805         sub eax, 5
│      ╎│   0x00000ab8      8845de         mov byte [local_22h], al
│      ╎│   0x00000abb      8b45f8         mov eax, dword [local_8h]
│      ╎│   0x00000abe      4863d0         movsxd rdx, eax
│      ╎│   0x00000ac1      488b45e8       mov rax, qword [buf]
│      ╎│   0x00000ac5      4801c2         add rdx, rax                ; '#'
│      ╎│   0x00000ac8      0fb645de       movzx eax, byte [local_22h]
│      ╎│   0x00000acc      8802           mov byte [rdx], al
│      ╎│   0x00000ace      8345f801       add dword [local_8h], 1
│      ╎│   ; CODE XREF from main (0xa9c)
│      ╎└─> 0x00000ad2      8b45f8         mov eax, dword [local_8h]
│      ╎    0x00000ad5      3b45f0         cmp eax, dword [nbyte]
│      └──< 0x00000ad8      7cc4           jl 0xa9e
│           0x00000ada      c745f4000000.  mov dword [local_ch], 0
│       ┌─< 0x00000ae1      eb30           jmp 0xb13
│       │   ; CODE XREF from main (0xb19)
│      ┌──> 0x00000ae3      8b45f4         mov eax, dword [local_ch]
│      ╎│   0x00000ae6      83c00a         add eax, 0xa
│      ╎│   0x00000ae9      99             cdq
│      ╎│   0x00000aea      f77df0         idiv dword [nbyte]
│      ╎│   0x00000aed      8955d8         mov dword [local_28h], edx
│      ╎│   0x00000af0      8b45f4         mov eax, dword [local_ch]
│      ╎│   0x00000af3      4863d0         movsxd rdx, eax
│      ╎│   0x00000af6      488b45e0       mov rax, qword [s2]
│      ╎│   0x00000afa      4801c2         add rdx, rax                ; '#'
│      ╎│   0x00000afd      8b45d8         mov eax, dword [local_28h]
│      ╎│   0x00000b00      4863c8         movsxd rcx, eax
│      ╎│   0x00000b03      488b45e8       mov rax, qword [buf]
│      ╎│   0x00000b07      4801c8         add rax, rcx                ; '&'
│      ╎│   0x00000b0a      0fb600         movzx eax, byte [rax]
│      ╎│   0x00000b0d      8802           mov byte [rdx], al
│      ╎│   0x00000b0f      8345f401       add dword [local_ch], 1
│      ╎│   ; CODE XREF from main (0xae1)
│      ╎└─> 0x00000b13      8b45f4         mov eax, dword [local_ch]
│      ╎    0x00000b16      3b45f0         cmp eax, dword [nbyte]
│      └──< 0x00000b19      7cc8           jl 0xae3
│           0x00000b1b      8b45f0         mov eax, dword [nbyte]
│           0x00000b1e      4863d0         movsxd rdx, eax             ; size_t n
│           0x00000b21      488b4de0       mov rcx, qword [s2]
│           0x00000b25      488b45e8       mov rax, qword [buf]
│           0x00000b29      4889ce         mov rsi, rcx                ; const void *s2
│           0x00000b2c      4889c7         mov rdi, rax                ; void *s1
│           0x00000b2f      e8ecfcffff     call sym.imp.memcpy         ; void *memcpy(void *s1, const void *s2, size_t n)
│           0x00000b34      488b45e8       mov rax, qword [buf]
│           0x00000b38      4889c6         mov rsi, rax
│           0x00000b3b      488d3dfa0000.  lea rdi, str.Survey_Says___s ; 0xc3c ; "Survey Says! %s\n" ; const char *format
│           0x00000b42      b800000000     mov eax, 0
│           0x00000b47      e894fcffff     call sym.imp.printf         ; int printf(const char *format)
│           0x00000b4c      8b45f0         mov eax, dword [nbyte]
│           0x00000b4f      4863d0         movsxd rdx, eax             ; size_t n
│           0x00000b52      488b45e8       mov rax, qword [buf]
│           0x00000b56      488d35f00000.  lea rsi, str.jmt_j_tm_q_t_j_mpjtf ; 0xc4d ; "jmt_j]tm`q`t_j]mpjtf^" ; const void *s2
│           0x00000b5d      4889c7         mov rdi, rax                ; const void *s1
│           0x00000b60      e8abfcffff     call sym.imp.memcmp         ; int memcmp(const void *s1, const void *s2, size_t n)
│           0x00000b65      85c0           test eax, eax
│       ┌─< 0x00000b67      751a           jne 0xb83
│       │   0x00000b69      488d3df30000.  lea rdi, str.That_s_right   ; 0xc63 ; "That's right!" ; const char *s
│       │   0x00000b70      e84bfcffff     call sym.imp.puts           ; int puts(const char *s)
│       │   0x00000b75      488d3df50000.  lea rdi, str.bin_cat_._flag ; 0xc71 ; "/bin/cat ./flag" ; const char *string
│       │   0x00000b7c      e84ffcffff     call sym.imp.system         ; int system(const char *string)
...
```

This roughly corresponds to:

```c
char s[21] = (char*)malloc(21);
char t[21] = (char*)malloc(21);

read(s, 0, 21);

for (int i = 20; i >= 0; i--)
    t[20-i] = s[i];

for (int i = 0; i < 21; i++)
    s[j] -= 5;

for (int i = 0; i < 21; i++)
    t[i] = s[(i + 10) % 21];

if (!memcmp(t, "jmt_j]tm`q`t_j]mpjtf^", 21))
    //print flag
```

The final string `jmt_j]tm`q`t_j]mpjtf^` used in the `memcmp` at `0x00000b60` can easily be reversed to the corresponding input.

```python
ans = 'jmt_j]tm`q`t_j]mpjtf^'
ans = map(lambda x: chr(ord(x) + 5), ans)

s = ['' for i in range(len(ans))]

for i in range(len(ans)):
    j = (i - 10) % 21
    s[i] = ans[j]

print ''.join(s)[::-1]

# everybodyrockyourbody
```

Providing the input to the server gives us the flag.

Flag
> TUCTF{5w337_dr34m5_4r3_m4d3_0f_7h353}
