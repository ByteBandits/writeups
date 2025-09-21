[](ctf=whitehat-contest-11-2016)
[](type=rev)
[](tags=py2exe)
[](tool=unpy2exe)

# RE3 (rev 100)

So we have an [exe file](../digital_fortrees.exe)

```bash
$ file digital_fortrees.exe
digital_fortrees.exe: PE32 executable (console) Intel 80386, for MS Windows
$ strings digital_fortrees.exe
!This program cannot be run in DOS mode.
.
.
<pythondll>
LoadLibrary(pythondll) failed
.
```

This suggests the executable was made using [py2exe](http://www.py2exe.org/). Byte compiled pyc files can be easily fished out from such exe using [unpy2exe](https://github.com/matiasb/unpy2exe). We take out the pyc file and then use [Easy Python Decompiler](https://sourceforge.net/projects/easypythondecompiler/) to get

```python
# Embedded file name: digital_fortrees.py
import urllib2

def main():
    print "                                       /\\\n                                      /`:\\\n                                     /`'`:\\\n                                    /`'`'`:\\\n                                   /`'`'`'`:\\\n                                  /`'`'`'`'`:\\\n                                   |`'`'`'`:|\n     _ _  _  _  _                  |] ,-.  :|_  _  _  _\n    ||| || || || |                 |  |_| ||| || || || |\n    |`' `' `' `'.|                 | _'=' |`' `' `' `'.|\n    :          .:;                 |'-'   :          .:;\n     \\-..____..:/  _  _  _  _  _  _| _  _'-\\-..____..:/\n      :--------:_,' || || || || || || || `.::--------:\n      |]     .:|:.  `' `'_`' `' `' `' `'    | '-'  .:|\n      |  ,-. .[|:._     '-' ____     ___    |   ,-.'-|\n      |  | | .:|'--'_     ,'____`.  '---'   |   | |.:|\n      |  |_| .:|:.'--' ()/,| |`|`.\\()   __  |   |_|.:|\n      |  '=' .:|:.     |::_|_|_|\\|::   '--' |  _'='.:|\n      | __   .:|:.     ;||-,-,-,-,|;        | '--' .:|\n      |'--'  .:|:. _  ; ||       |:|        |      .:|\n      |      .:|:.'-':  ||       |;|     _  |]     _:|\n      |      '-|:.   ;  ||       :||    '-' |     '--|\n      |  _   .:|].  ;   ||       ;||]       |   _  .:|\n      | '-'  .:|:. :   [||      ;|||        |  '-' .:|\n  ,', ;._____.::-- ;---->'-,--,:-'<'--------;._____.::.`.\n ((  (          )_;___,' ,' ,  ; //________(          ) ))\n  `. _`--------' : -,' ' , ' '; //-       _ `--------' ,'\n       __  .--'  ;,' ,'  ,  ': //    -.._    __  _.-  -\n   `-   --    _ ;',' ,'  ,' ,;/_  -.       ---    _,\n       _,.   /-:,_,_,_,_,_,_(/:-\\   ,     ,.    _\n     -'   `-'--'-'-'-'-'-'-'-''--'-' `-'`'  `'`' `-\n"
    print 'Welcome to DIGITAL FORTRESS'
    while 1:
        print 'Be carefull with your choice: '
        print '1: Draw infinity map'
        print '2: Go through all room on your map'
        choice = '-1'
        while not choice.isdigit():
            choice = raw_input("What's your choice: ")
            if choice not in ('1', '2'):
                choice = '-1'

        choice = int(choice)
        if choice == 1:
            exec (urllib2.urlopen('http://material.wargame.whitehat.vn/contests/11/drawmap.py').read(), globals())
        elif choice == 2:
            exec (urllib2.urlopen('http://material.wargame.whitehat.vn/contests/11/letgo.py').read(), globals())


if __name__ == '__main__':
    main()
```

This shows that 2 more scripts are executed on running this exe.
[drawmap.py](drawmap.py) keeps creating folders in your cwd with prime numbered names.

letgo.py

```python
import os

def gothrough():
    key = 1
    roomtogo = [r for r in os.listdir(os.curdir)if os.path.isdir(r)]
    for room in roomtogo:
        key *= int(room)
        os.system("start cmd /k echo Room number " + room + ": get key part")
    if (key == 1000012277050240711531267079):
        os.system("start cmd /k echo Congrats! Where did you get these key parts?")
    else:
        os.system("start cmd /k echo Nothing here! wrong key parts")

gothrough()
```

[letgo.py](letgo.py) then traverses these folders then and checks the product of the traversed primes to be equal to 1000012277050240711531267079.
So flag is Easy
```python
>>> from sympy import primefactors
>>> factors=primefactors(1000012277050240711531267079)
>>> import sha
>>> print sha.new(':'.join(map(str,factors))).hexdigest()
89225c98a509271436fd55c3c6aeef44fd07728a
```

> Flag : 89225c98a509271436fd55c3c6aeef44fd07728a
