import subprocess

prev = "^_^ONE_BYTE_INSTRUCTION_FLAG_IZ_CLASSY_AND_FUN"
for _ in xrange(20):
    cnt = []
    for i in xrange(0x40,0x60):
        open("input", "w+").write(prev+chr(i)) 
        d = subprocess.Popen("gdb -q -x ./magic.py ", shell=True, stdout=subprocess.PIPE).stdout.read().strip()
        try:
            c = int(d.split(":::::")[1])
        except:
            c = -1
        cnt.append((c, i))
    best = sorted(cnt ,key=lambda x: x[0], reverse=True)[0]
    prev += chr(best[1])
    print prev, best 
