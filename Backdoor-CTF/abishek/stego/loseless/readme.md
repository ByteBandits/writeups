***LOSELESS***

*category:steganography*  *points:100*

In this challenge, we are provided with two images, `original.png` and `encrypted.png`. And are supposed to find the hidden message. Observing the images and seeing the difference using  `compare original.png encrypted.png diff.png` reveals that both the images differ only in the top right corner.

![bump](files/diff.png)

 It was only a matter of seconds that we realized these may be binary strings Blue - 1 and Black - 0. Moreover, they were of 7 bits (Vertically). That further provoked the thought of them fitting in ASCII representation. (<128)
 We wrote a quick script to read the binary numbers and got the output `The flag is SHA256{-----------------------------}`.
 
 TEAM BYTEBANDITS
