#!/usr/bin/env python2
"""
Tool to search through the writeups
User can filter by using several filters based on:
1. Which CTF the problem appeared in
2. Type of the problem (web/rev/stego etc.)
3. Name of the problem
4. Tags related the problem (rsa/buffer-overflow etc.)
5. Author of the writeup

An example query of this could be:
$ python search.py -y crypto -t rsa morse -a chaitan94
which means "Give me all the writeups for problems of type crypto
which are tagged either 'rsa' or 'morse' and are written by chaitan94"
"""


import argparse
import glob

__author__ = 'ByteBandits'
__version__ = '0.0.1'


class Writeup(object):

    def __init__(self, ctf, problem_type, problem_name, author):
        self.ctf = ctf
        self.problem_type = problem_type
        self.problem_name = problem_name
        self.author = author

    def get_path(self):
        fmt = "{ctf}/{ptype}/{pname}/{author}/README.md"
        path = fmt.format(
            ctf=self.ctf,
            ptype=self.problem_type,
            pname=self.problem_name,
            author=self.author,
        )
        return path

    def get_headers(self):
        path = self.get_path()
        # Read only first 5 lines
        with open(path) as f:
            head = f.readlines(5)
        # Take only lines starting with []
        head = [line for line in head if line[:2] == "[]"]
        head = [line[3:-2].split('=') for line in head]
        head = {line[0]: line[1].split(',') for line in head}
        return head

    def get_tags(self):
        head = self.get_headers()
        return head["tags"]

    def __str__(self):
        fmt = "<Writeup by %s for the problem %s (%s) for the CTF %s>"
        return fmt % (self.author, self.problem_name, self.problem_type, self.ctf)


def get_all_writeups():
    return [Writeup(*(writeup.split('/')[:4])) for writeup in glob.glob("*/*/*/*/README.md")]


def main():
    parser = argparse.ArgumentParser(description='Tool to search through the writeups')
    parser.add_argument('-c', '--ctf', nargs='+', action="store",
                        help='Filter results using the specified ctf(s)')
    parser.add_argument('-a', '--author', nargs='+', action="store",
                        help='Filter results using the specified author(s)')
    parser.add_argument('-t', '--tag', nargs='+', action="store",
                        help='Filter results taggusing with specified tag(s)')
    parser.add_argument('-y', '--type', nargs='+', action="store",
                        help='Filter results using specified problem type(s)')
    parser.add_argument('-n', '--name', nargs='+', action="store",
                        help='Filter results using specified problem name(s)')
    args = parser.parse_args()
    writeups = get_all_writeups()
    if args.ctf is not None:
        writeups = [w for w in writeups if w.ctf in args.ctf]
    if args.author is not None:
        writeups = [w for w in writeups if w.author in args.author]
    if args.type is not None:
        writeups = [w for w in writeups if w.problem_type in args.type]
    if args.name is not None:
        writeups = [w for w in writeups if w.problem_name in args.name]
    if args.tag is not None:
        writeups = [w for w in writeups if len(list(set(w.get_tags()) & set(args.tag)))]
    for writeup in writeups:
        print(writeup)


if __name__ == '__main__':
    main()
