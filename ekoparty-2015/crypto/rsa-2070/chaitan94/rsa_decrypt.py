from sys import argv
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from base64 import b64decode

def decrypt_RSA(private_key_loc, package):
    key = open(private_key_loc, "r").read()
    rsakey = RSA.importKey(key)
    rsakey = PKCS1_OAEP.new(rsakey)
    decrypted = rsakey.decrypt(b64decode(package))
    return decrypted

def main():
    if len(argv) != 3:
        print("%s [enc] [private.pem]" % argv[0])
        exit(0)
    flag = open(argv[1], "r").read()
    print(decrypt_RSA(argv[2], flag))

if __name__ == '__main__':
    main()
