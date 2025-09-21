[](ctf=trend-micro-ctf-2015)
[](type=prog)
[](tags=roman,parsing)
[](tools=)
[](techniques=)

# Calculator (prog-200)

Again, problem is simple: We're given simple arithmetic questions, we need to calculate their values.

In the start, it's quite simple as the questions contained just numbers and operators. Python's `eval()` would've been more than enough, but as level increase, we get numbers separated by commas (like 62,234,612). Even more, we start to see roman numerals (CMXIV), and finally even numbers in plain english! (six hundred twenty two).

To automate this, we wrote a python script which after reading each question, does the following:

```python
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
```
(Complete code is in [bot.py](bot.py))

After about 100 levels, we get the flag:

> TMCTF{U D1D 17!}
