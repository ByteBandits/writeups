# meta-dreams

#### Category: AI
#### Pts: 1750

We are give a pth file. Some initial investigations show that it might be a pytorch save file.

Let's open it and see. It's getting opened correctly. Let's look at the keys

```python
In [3]: checkpoint.keys()                      
Out[3]: odict_keys(['conv1.conv2d.weight', 'conv1.conv2d.bias', 'in1.weight', 'in1.bias', 'conv2.conv2d.weight', 'conv2.conv2d.bias', 'in2.weight', 'in2.bias', 'conv3.conv2d.weight', 'conv3.conv2d.bias', 'in3.weight', 'in3.bias', 'res1.conv1.conv2d.weight', 'res1.conv1.conv2d.bias', 'res1.in1.weight', 'res1.in1.bias', 'res1.conv2.conv2d.weight', 'res1.conv2.conv2d.bias', 'res1.in2.weight', 'res1.in2.bias', 'res2.conv1.conv2d.weight', 'res2.conv1.conv2d.bias', 'res2.in1.weight', 'res2.in1.bias', 'res2.conv2.conv2d.weight', 'res2.conv2.conv2d.bias', 'res2.in2.weight', 'res2.in2.bias', 'res3.conv1.conv2d.weight', 'res3.conv1.conv2d.bias', 'res3.in1.weight', 'res3.in1.bias', 'res3.conv2.conv2d.weight', 'res3.conv2.conv2d.bias', 'res3.in2.weight', 'res3.in2.bias', 'res4.conv1.conv2d.weight', 'res4.conv1.conv2d.bias', 'res4.in1.weight', 'res4.in1.bias', 'res4.conv2.conv2d.weight', 'res4.conv2.conv2d.bias', 'res4.in2.weight', 'res4.in2.bias', 'res5.conv1.conv2d.weight', 'res5.conv1.conv2d.bias', 'res5.in1.weight', 'res5.in1.bias', 'res5.conv2.conv2d.weight', 'res5.conv2.conv2d.bias', 'res5.in2.weight', 'res5.in2.bias', 'deconv1.conv2d.weight', 'deconv1.conv2d.bias', 'in4.weight', 'in4.bias', 'deconv2.conv2d.weight', 'deconv2.conv2d.bias', 'in5.weight', 'in5.bias', 'deconv3.conv2d.weight', 'deconv3.conv2d.bias'])
```

Searching the keys `in1`, `conv1`, `in2` got me an pytorch example repository which does something similar to Google Deep Dreams.

The code given in the example doesnt work which suggests that the code might be changed by the chall author.

Chall author is Jess. Let's look at his github. We find a similar repo.

https://github.com/JEF1056/Reconstruction-Style

Clone the repo and run it with a pure white image and we get a green-grey image.

The flag format is `rtcp{hex of a color}`.

Inputting the color of the image, we get the flag.
