import subprocess
import string
prev = "aN0ther_HeRRing_or_irhtH3ewi"
for _ in range(74):
    cnt = []
    for i in string.digits+string.ascii_letters+string.punctuation:
        open("/tmp/input", "w+").write(prev+i)
        d = subprocess.Popen("gdb -q -x /tmp/some.py ", shell=True, stdout=subprocess.PIPE).stdout.read().strip()
        # print(d.split(b":::::")[1])
        try:
            c = int(d.split(b":::::")[1])
        except Exception as e:
            print(e)
            c = -1
        cnt.append((c, i))
    best = sorted(cnt ,key=lambda x: x[0], reverse=True)[0]
    if best[0] == 49:
        print(cnt)
        best = sorted(cnt ,key=lambda x: x[0], reverse=True)[1]
    prev += best[1]
    print(prev, best)
