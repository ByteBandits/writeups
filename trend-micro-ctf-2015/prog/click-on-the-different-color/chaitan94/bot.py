import requests
from lxml import html
from PIL import Image

BASE_URL = 'http://ctfquest.trendmicro.co.jp:43210'
TMP_IMG = 'tmp.png'

url = BASE_URL + '/click_on_the_different_color'
level = 1


def get_tile_pos(i, j, tiles, isz):
    offset = 2 + (isz-1)//(2*(tiles))
    tilesz = (isz-1)//(tiles)
    return (offset + i*tilesz, offset + j*tilesz)

if __name__ == '__main__':
    while True:
        print("Getting level %d.. %s" % (level, url))
        page = requests.get(url)
        tree = html.fromstring(page.text)
        imgs = tree.xpath('//img/@src')

        # Have we found the flag?
        if not len(imgs):
            print(html.tostring(tree, pretty_print=True))
            break

        page = requests.get(BASE_URL + imgs[0])
        img_hash = imgs[0].split('/')[-1].split('.')[0]
        with open(TMP_IMG, 'wb') as test:
            test.write(page.content)

        img = Image.open(TMP_IMG)
        w, h = img.size
        img = img.convert('RGB').load()
        count = {}
        tiles = level + 1
        for i in xrange(tiles):
            for j in xrange(tiles):
                x, y = get_tile_pos(i, j, tiles, w)
                r, g, b = img[x, y]
                if (r, g, b) not in count:
                    count[(r, g, b)] = []
                count[(r, g, b)].append((x, y))

        for color in count:
            if len(count[color]) == 1:
                x, y = count[color][0]
        url = BASE_URL + "/%s?x=%d&y=%d" % (img_hash, x, y)
        level += 1
