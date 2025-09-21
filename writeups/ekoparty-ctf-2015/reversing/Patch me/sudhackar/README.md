[](ctf=ekoparty-ctf-2015)
[](type=reversing)
[](tags=image,C#)
[](tools=Telerik-JustDecompile,PIL)
[](techniques=no-patch)

# Patch me (rev50)

We have a [zip](../rev50.zip).
Extract and we get

```bash
$ file *
SecureImageViewer.exe: PE32 executable (GUI) Intel 80386 Mono/.Net assembly, for MS Windows
secureimage.xml:       XML document text
```

.Net assembly can be very easy decompiled. I use [Telerik JustDecompile](http://www.telerik.com/products/decompiler.aspx) to decompile the code. Here is the code that does the main job of decoding the xml to an image.


```cs
protected void open(object sender, EventArgs e)
    {
        int num = 201527;
        int[] numArray = new int[100001];
        int num1 = 0;
        using (FileStream fileStream = File.OpenRead("secureimage.xml"))
        {
            numArray = (int[])(new XmlSerializer(typeof(int[]))).Deserialize(fileStream);
        }
        for (int i = 0; i < 100000; i++)
        {
            num1 = num1 + numArray[i];
        }
        if (num1 != numArray[100000])
        {
            MessageDialog messageDialog = new MessageDialog(null, 1, 3, 1, "Corrupted Image", new object[0]);
            messageDialog.Run();
            messageDialog.Destroy();
            return;
        }
        GC gC = new GC(this.graph.get_GdkWindow());
        gC.set_RgbFgColor(new Color(51, 102, 153));
        this.graph.get_GdkWindow().GetImage(0, 0, 500, 200);
        for (int j = 0; j < 500; j++)
        {
            for (int k = 0; k < 200; k++)
            {
                if ((numArray[j + k * 500] ^ num) == 3368601)
                {
                    this.graph.get_GdkWindow().DrawPoint(gC, j, k);
                }
                num = num * 100673 + 15485867;
            }
        }
    }
```

The algorithm is easier to implement in python than to patch the binary xD.
The xml provided here fails the check 

```
for (int i = 0; i < 100000; i++)
        {
            num1 = num1 + numArray[i];
        }
        if (num1 != numArray[100000])
```
I would write python instead.

```python
>>> from PIL import Image
>>> size=500,200
>>> num=201527
>>> num1=0
>>> for i in xrange(100000):
...     num1+=arr[i]
... 
>>> num1
245665872900
>>> num1=0
>>> arr[100000]
0
>>> im = Image.new("RGB", size, "white")
>>> pix=im.load()
>>> for j in xrange(0,500):
...     for k in xrange(0,200):
...             if (arr[j+k*500]^num) == 3368601:
...                     pix[j,k]=(0,0,0)
...             num=((num*100673)+15485867)&0xffffffff
... 
>>> im.show()
>>> 
```
Will give me ![final](final.jpg).

Flag
> EKO{n1L+P4tch}

