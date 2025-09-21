import os
import errno
import math

def draw():
    current = 2
    check_map("2")
    print 'Press Ctrl + C to stop draw map'

    while 1:
        try:
            current = find_next_prime(current)
            check_map(str(current))
        except KeyboardInterrupt:
            break

def check_map(path):
    try:
        os.makedirs(path)
    except OSError as exception:
        if exception.errno !=errno.EEXIST:
            raise

def find_next_prime(current):
    flag = False
    for p in range(current+1, current*2):
        for i in range(2, int(math.sqrt(p)) + 1):
            if p % i == 0:
                flag = True
                break
        if flag == False:
            return p
        else:
            flag = False

draw()
