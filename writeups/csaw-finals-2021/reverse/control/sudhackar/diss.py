from pwn import *
sc = open("control.bin", "rb").read()
print('''section .data
flag:
    db 'y', 0xa, 'y', 0xa, "flag{wh0_n33ds_opc0des_wh3n_you_h4ve_CONTROL?}", 0
    times 1000 db 0
c: dd 0
r1: dd 0
r2: dd 0
r3: dd 0
r4: dd 0
r5: dd 0
r6: dd 0
r7: dd 0
ridx: dd 0
readidx: dd 0
outb: dd 0
prev_dword_4080:
    times 65535 dd 0
dword_4080:
    times 65535 dd 0
next_dword_4080:
    times 65535 dd 0
ptr1:
    incbin "control.bin"
section .text
global _start
_start:
''')
i = 0
while i < len(sc):
    op = u32(sc[i:i+4])
    print "pos"+hex(i/4), ":",
    i = i+4
    if (op & 0x40000) != 0:
        # print("c = r6 + r7")
        # print("lea edi, [r6]")
        # print("lea esi, [r7]")
        print("mov edi, dword [r6]")
        print("mov esi, dword [r7]")
        print("xor eax, eax")
        print("add eax, esi")
        print("add eax, edi")
        print("mov dword[c], eax")
    if (op & 0x80000) != 0:
        # print("c = r6 * r7")
        # print("lea edi, [r6]")
        # print("lea esi, [r7]")
        print("mov edi, dword [r6]")
        print("mov esi, dword [r7]")
        print("mov eax, esi")
        print("mul edi")
        print("mov dword[c], eax")
    if (op & 0x20000) != 0:
        # print("c = r6 (<<|>>) r7")
        print("mov edi, dword [r6]")
        print("mov esi, dword [r7]")
        print("cmp esi, 0")
        print("jle .left%x"% i)
        print("mov ecx, esi")
        print("shr edi, cl")
        print("mov dword[c], edi")
        print("jmp .fin%x"% i)
        print(".left%x :"% i)
        print("neg esi")
        print("mov ecx, esi")
        print("shl edi, cl")
        print("mov dword[c], edi")
        print(".fin%x :"% i)
    if (op & 0x100000) != 0:
        # print("c = r6 ^ r7")
        print("mov edi, dword [r6]")
        print("mov esi, dword [r7]")
        print("mov eax, esi")
        print("xor eax, edi")
        print("mov dword[c], eax")
    if (op & 0x200000) != 0:
        # print("c = r6 == r7")
        print("mov edi, dword [r6]")
        print("mov esi, dword [r7]")
        print("cmp edi, esi")
        print("setz al")
        print("movzx eax, al")
        print("mov dword[c], eax")
    if ( (op & 4) != 0 ):
        # print("ridx = r1")
        print("mov edi, dword [r1]")
        print("mov dword [ridx], edi")
    if ( (op & 0x20) != 0 ):
        # print("ridx = r2")
        print("mov edi, dword [r2]")
        print("mov dword [ridx], edi")
    if ((op & 0x100) != 0):
        # print("ridx = r3")
        print("mov edi, dword [r3]")
        print("mov dword [ridx], edi")
    if ((op & 0x800) != 0):
        # print("ridx = r4")
        print("mov edi, dword [r4]")
        print("mov dword [ridx], edi")
    if ((op & 0x4000) != 0):
        # print("ridx = r5")
        print("mov edi, dword [r5]")
        print("mov dword [ridx], edi")
    if ((op & 2) != 0):
        # print("c = r1")
        print("mov edi, dword [r1]")
        print("mov dword [c], edi")
    if ((op & 0x10) != 0):
        # print("c = r2")
        print("mov edi, dword [r2]")
        print("mov dword [c], edi")
    if ((op & 0x80) != 0):
        # print("c = r3")
        print("mov edi, dword [r3]")
        print("mov dword [c], edi")
    if ((op & 0x400) != 0):
        # print("c = r4")
        print("mov edi, dword [r4]")
        print("mov dword [c], edi")
    if ((op & 0x2000) != 0):
        # print("c = r5")
        print("mov edi, dword [r5]")
        print("mov dword [c], edi")
    if ((op & 0x800000) != 0):
        # print("c = dword_4080[ridx]")
        print("mov edi, dword [ridx]")
        print("lea esi, [dword_4080]")
        print("mov eax, [esi+edi*4]")
        print("mov dword[c], eax")
    if ((op & 0x4000000) != 0):
        # print("c = %x"% u32(sc[i:i+4]))
        print("mov dword[c], 0x%x"% u32(sc[i:i+4]))
    if ((op & 0x8000000) != 0):
        # print("c = ptr1[ridx]")
        print("mov edi, dword [ridx]")
        print("lea esi, [ptr1]")
        print("mov eax, [esi+edi*4]")
        print("mov dword[c], eax")
    if ((op & 0x2000000) != 0):
        # print("c = getchar()")
        print("mov edi, dword [readidx]")
        print("inc dword [readidx]")
        print("lea esi, [flag]")
        print("mov al, byte [esi+edi]")
        print("movzx eax, al")
        print("mov dword[c], eax")
    if ((op & 1) != 0):
        # print("r1 = c")
        print("mov edi, dword [c]")
        print("mov dword [r1], edi")
    if ((op & 8) != 0):
        # print("r2 = c")
        print("mov edi, dword [c]")
        print("mov dword [r2], edi")
    if ((op & 0x40) != 0):
        # print("r3 = c")
        print("mov edi, dword [c]")
        print("mov dword [r3], edi")
    if ((op & 0x200) != 0):
        # print("r4 = c")
        print("mov edi, dword [c]")
        print("mov dword [r4], edi")
    if ((op & 0x1000) != 0):
        # print("r5 = c")
        print("mov edi, dword [c]")
        print("mov dword [r5], edi")
    if ((op & 0x8000) != 0):
        # print("r6 = c")
        print("mov edi, dword [c]")
        print("mov dword [r6], edi")
    if ((op & 0x10000) != 0):
        # print("r7 = c")
        print("mov edi, dword [c]")
        print("mov dword [r7], edi")
    if ((op & 0x400000) != 0):
        # print("dword_4080[ridx] = c")
        print("mov edi, dword [ridx]")
        print("lea esi, [dword_4080]")
        print("mov eax, dword[c]")
        print("mov [esi+edi*4], eax")
    if ((op & 0x1000000) != 0):
        print("mov eax, dword[c]")
        print("mov dword[outb], eax")
        print('''
        mov  edx, 1           ; length
        lea  ecx, [outb]        ; buffer
        mov  ebx, 1             ; stdout
        mov  eax, 4             ; sys_write
        int  80h
        ''')
    # if ((op & 0x10000000) != 0):
    #     print("++vip")
    if ((op & 0x20000000) != 0):
        # print("vip += 2")
        # print "pos"+hex(i/4), ":", "align 128,db 0xcc"
        i = i+4
    if ((op & 0x40000000) != 0):
        # print("vip = c")
        print("lea edi, [_start]")
        print("mov eax, dword[c]")
        print("mov ecx, 0x80")
        print("imul ecx")
        print("lea esi, [eax+edi]")
        print("jmp esi")
    print("jmp pos0x%x" % ((i/4)))
    print("align 128,db 0xcc")
    if ((op & 0x20000000) != 0):
        # print("vip += 2")
        print "pos"+hex((i/4)-1), ":", "db 0xcc"
        print("align 128,db 0xcc")
print("pos0x14b3 :")
print('''
mov    eax, 1
mov    ebx, 0
int    80h              ; _exit(0)
''')
# c, r1, r2, r3, r4, r5, r6, r7, ridx, ip
# bp, a, b, c, d, si, di,