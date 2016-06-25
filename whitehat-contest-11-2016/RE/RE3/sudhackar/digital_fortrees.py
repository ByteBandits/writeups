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