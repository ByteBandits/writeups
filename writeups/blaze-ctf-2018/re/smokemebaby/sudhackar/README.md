[](ctf=blaze-2018)
[](type=re)
[](tags=game)
[](techniques=bruteforce)

# smokemebaby (re-420)

```
get this files

solve at: smokeme.420blaze.in tcp 12345

author: vito

solves: ~30
```

This was a rust compiled binary. In main()->check(), there were 39 check_i functions to verify the i'th character based on some equations.
If the check failed check_i() returned i as the exit code. This made it perfect for bruteforce. Iterate through your keyspace unless the exit code increases, repeat.

driver script 

```python
import subprocess
import string

prev = ["A" for i in xrange(42)]

#flag = "on anntada ona? Somebnefbbeafd roia me a"
flag = ""
for i, j in enumerate(flag):
    prev[i] = j

for i in xrange(len(flag),42):
    cnt = []
    for j in string.lowercase+string.digits+string.uppercase+" <>,.?/\"\':;{}[]\\~`!@#$%^&*()_+=-":
        prev[i] = j 
        open("input", "w+").write("".join(prev)) 
        d = subprocess.Popen("gdb -q -x ./plz.py ", shell=True, stdout=subprocess.PIPE).stdout.read().strip()
        try:
            c = int(d.split(":::::")[1])
            # print c,
        except:
            c = -1
        cnt.append((c,j))
    print cnt
    best = sorted(cnt ,key=lambda x: x[0], reverse=True)[0]
    prev[i] = best[1]
    print "".join(prev)

"""
echo -ne "on anntada ona? Somebnefbbeafd roia me a"| base64 |nc smokeme.420blaze.in 12345
send your solution as base64, followed by a newline
96667aaad70646abc06a8b44b1016e94e3897dd5a95dff21b6e7a9628a823d06
The flag is: blaze{a0ddb69ede14231576e7f0241623723385814f32}
"""
```

gdb helper

```python
import gdb

gdb.execute('file ../96667aaad70646abc06a8b44b1016e94e3897dd5a95dff21b6e7a9628a823d06')
gdb.execute("set verbose off")
gdb.execute("run < input > output")
gdb.execute("set confirm off")
exit = int(gdb.parse_and_eval("$_exitcode").cast(gdb.lookup_type('uint32_t')))
print(":::::%d:::::" % exit)
gdb.execute('quit')
```
