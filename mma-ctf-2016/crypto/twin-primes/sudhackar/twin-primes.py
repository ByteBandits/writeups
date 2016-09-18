with open("encrypted", "r") as f:
    flag = f.read()
from Crypto.Util.number import *
import Crypto.PublicKey.RSA as RSA
import os
import gmpy2
e=65537
pq=19402643768027967294480695361037227649637514561280461352708420192197328993512710852087871986349184383442031544945263966477446685587168025154775060178782897097993949800845903218890975275725416699258462920097986424936088541112790958875211336188249107280753661467619511079649070248659536282267267928669265252935184448638997877593781930103866416949585686541509642494048554242004100863315220430074997145531929128200885758274037875349539018669336263469803277281048657198114844413236754680549874472753528866434686048799833381542018876362229842605213500869709361657000044182573308825550237999139442040422107931857506897810951
p2q2=19402643768027967294480695361037227649637514561280461352708420192197328993512710852087871986349184383442031544945263966477446685587168025154775060178782897097993949800845903218890975275725416699258462920097986424936088541112790958875211336188249107280753661467619511079649070248659536282267267928669265252935757418867172314593546678104100129027339256068940987412816779744339994971665109555680401467324487397541852486805770300895063315083965445098467966738905392320963293379345531703349669197397492241574949069875012089172754014231783160960425531160246267389657034543342990940680603153790486530477470655757947009682859
p_q=(p2q2-pq-4)/2
d=(p_q**2)-4*pq
p=(p_q+gmpy2.isqrt(d))/2
q=(p_q-gmpy2.isqrt(d))/2
print p*q==pq
d1 = inverse(e, (p-1)*(q-1))
d2 = inverse(e, (p+1)*(q+1))
key1 = RSA.construct((pq, long(e), d1))
key2 = RSA.construct((p2q2, long(e), long(d2)))
flag=int(flag)
print hex(key1.decrypt(key2.decrypt(flag)))[2:-1].decode('hex')