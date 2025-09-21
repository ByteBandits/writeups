import string,md5,base64

'''
fab3e420d6d8a17b53b23ca4bb01866b
189f56eea9a9ba305dffa8425ba20048
2335667c646346b38c8f0f47b13fab13
f4709a7eef9d703920b910fc734b151c
b74e57f21f5a315550a9e2f6869d4e44
40abc257b6f0e0420dc9ae9ba19c8c8c

b74e57f21f5a315550a9e2f6869d4e44 AHzP
2335667c646346b38c8f0f47b13fab13 BcJH
f4709a7eef9d703920b910fc734b151c N8tK
40abc257b6f0e0420dc9ae9ba19c8c8c QmHY
189f56eea9a9ba305dffa8425ba20048 9aSY

HV15-9aSY-BcJH-N8tK-AHzP-QmHY
'''
v=string.ascii_uppercase+string.ascii_lowercase+string.digits
#v="HV15"
for i in v:
	for j in v:
		for k in v:
			for l in v:
				text=i+j+k+l
				h=md5.new(base64.b64encode(text)).hexdigest()
				if  h=="189f56eea9a9ba305dffa8425ba20048" or h=="2335667c646346b38c8f0f47b13fab13" or h=="f4709a7eef9d703920b910fc734b151c" or h=="b74e57f21f5a315550a9e2f6869d4e44" or h=="40abc257b6f0e0420dc9ae9ba19c8c8c":
					print h,text