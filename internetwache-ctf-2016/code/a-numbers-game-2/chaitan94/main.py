import sympy


def encode(eq):
    out = []
    for c in eq:
        q = bin(ord(c) ^ (2<<4)).lstrip("0b")
        q = "0" * ((2<<2)-len(q)) + q
        out.append(q)
    b = ''.join(out)
    pr = []
    for x in range(0,len(b),2):
        c = chr(int(b[x:x+2],2)+51)
        pr.append(c)
    s = '.'.join(pr)
    return s


def decode(eq):
    s = eq.split('.')
    pr = ''.join([bin(ord(x)-51)[2:].zfill(2) for x in s])
    out = []
    while len(pr):
        out.append(chr(int(pr[:8], 2) ^ 32))
        pr = pr[8:]
    return ''.join(out)


import subprocess, socket, time

def recv_timeout(sock, timeout=1):
    sock.setblocking(0)
    total_data = []
    data = ''
    begin = time.time()
    while 1:
        now = time.time()
        if total_data and now-begin > timeout: break
        elif now-begin > timeout*2: break
        try:
            data = sock.recv(1024)
            if data:
                total_data.append(data)
                begin = time.time()
            else: time.sleep(0.01)
        except: pass
    return ''.join(total_data)

if __name__ == '__main__':
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(('188.166.133.53', 11071))
    i = 1
    while 1:
        data = recv_timeout(sock, 0.2)
        print data
        if 'Level' not in data: continue
        data = data.split('\n')
        data = [line for line in data if 'Level' in line][0]
        data = data.split(".: ")[-1]
        print i, decode(data)
        lhs, rhs = decode(data).split("=")
        x = sympy.symbols('x')
        sol = sympy.solve(sympy.Eq(sympy.sympify(lhs), sympy.sympify(rhs)), x)
        ans = encode(str(sol[0]))
        print i, ans
        sock.send(ans)
        i += 1
