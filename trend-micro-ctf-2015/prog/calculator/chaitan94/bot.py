#!/usr/bin/env python

import re
import time
import roman
import socket


def recv_timeout(sock, timeout=2):
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


def text2int(textnum, numwords={}):
    if not numwords:
        units = [
            "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
            "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
            "sixteen", "seventeen", "eighteen", "nineteen",
        ]

        tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

        scales = ["hundred", "thousand", "million", "billion", "trillion"]

        numwords["and"] = (1, 0)
        for idx, word in enumerate(units):  numwords[word] = (1, idx)
        for idx, word in enumerate(tens):       numwords[word] = (1, idx * 10)
        for idx, word in enumerate(scales): numwords[word] = (10 ** (idx * 3 or 2), 0)

    ordinal_words = {'first':1, 'second':2, 'third':3, 'fifth':5, 'eighth':8, 'ninth':9, 'twelfth':12}
    ordinal_endings = [('ieth', 'y'), ('th', '')]

    textnum = textnum.replace('-', ' ')

    current = result = 0
    for word in textnum.split():
        if word in ordinal_words:
            scale, increment = (1, ordinal_words[word])
        else:
            for ending, replacement in ordinal_endings:
                if word.endswith(ending):
                    word = "%s%s" % (word[:-len(ending)], replacement)

            if word not in numwords:
                raise Exception("Illegal word: " + word)

            scale, increment = numwords[word]

        current = current * scale + increment
        if scale > 100:
            result += current
            current = 0

    return result + current


def solve(ques):
    # We only need lhs
    ques = ques.split("=")[0]
    # We don't need commas
    ques = ques.repace(',', '')
    parsed = ''
    # Let's separate parts between operators
    groups = re.split('([\-\+\*\/\(\)])', ques)
    # Convert each part to a number
    for g in groups:
        g = g.strip()
        # If part a roman numeral, convert it to decimal
        if re.match('([A-Z]+)', g):
            parsed += "%s" % roman.fromRoman(g)
        # If part is in plain english, convert it to decimal
        elif re.match('([a-z]+)', g):
            parsed += "%s" % text2int(g)
        else: parsed += g
    # Now eval can do the rest
    return "%s\r\n" % (eval(parsed))

if __name__ == '__main__':
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(('ctfquest.trendmicro.co.jp', 51740))
    while True:
        data = recv_timeout(sock)
        print(data)
        ans = solve(data)
        print(ans)
        sock.send(ans)
