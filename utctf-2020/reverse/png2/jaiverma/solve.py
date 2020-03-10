import struct
from PIL import Image

width = b'\x05\xcf'
height = b'\x02\x88'

width = struct.unpack('>H', width)[0]
height = struct.unpack('>H', height)[0]

print(f'Dimension: {width}x{height}')

buf = None
with open('pic.png2', 'rb') as f:
    buf = f.read()

buf = buf[21:]

img = Image.frombytes('RGB', (width, height), buf)
img.show()
