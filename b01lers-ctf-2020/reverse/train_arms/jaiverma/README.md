[](ctf=b01lers-ctf-2020)
[](type=reversing)
[](tags=arm)
[](tools=python)

# train arms
We are given an `ARM` assembly [source file](../main.s) and a
[text file](result.txt)

The source is simple enough and we can write a python script to give us the
flag.

```asm
.cpu cortex-m0
.thumb
.syntax unified
.fpu softvfp


.data 
    flag: .string "REDACTED" //len = 28

.text
.global main
main:
    ldr r0,=flag
    eors r1,r1
    eors r2,r2
    movs r7,#1
    movs r6,#42
loop:
    ldrb r2,[r0,r1]
    cmp r2,#0
    beq exit
    lsls r3,r1,#0
    ands r3,r7
    cmp r3,#0
    bne f1//if odd
    strb r2,[r0,r1]
    adds r1,#1
    b loop
f1:
    eors r2,r6
    strb r2,[r0,r1]
    adds r1,#1
    b loop

exit:
    wfi
```

Running the [solver script](./solve.py) gives us the flag.

```sh
$ python solve.py
b'pctf{tr41ns_d0nt_h4v3_arms}\x00'
```
