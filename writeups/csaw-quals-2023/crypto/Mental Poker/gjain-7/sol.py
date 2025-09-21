from pwn import *
import os, sys
from Crypto.Util.number import getPrime, bytes_to_long, long_to_bytes
from math import gcd

card_value_dict = {
    0: "Zero",
    1: "One",
    2: "Two",
    3: "Three",
    4: "Four",
    5: "Five",
    6: "Six",
    7: "Seven",
    8: "Eight",
    9: "Nine",
    10: "Ten",
    11: "Jack",
    12: "Queen",
    13: "King",
    14: "Ace",
    15: "Joker",
}
card_rank_dict = {
    "Zero": 0,
    "One": 1,
    "Two": 2,
    "Three": 3,
    "Four": 4,
    "Five": 5,
    "Six": 6,
    "Seven": 7,
    "Eight": 8,
    "Nine": 9,
    "Ten": 10,
    "Jack": 11,
    "Queen": 12,
    "King": 13,
    "Ace": 14,
    "Joker": 15,
}
SENDING_CARDS = [
    "Zero of Spades",
    "One of Hearts",
    "Three of Clubs",
    "Four of Clubs",
    "Six of Diamonds",
    "Joker of Spades",
    "King of Spades",
    "Ace of Spades",
    "Queen of Spades",
    "Jack of Spades",
    "One of Spades",
    "Two of Spades",
    "Three of Spades",
    "Four of Spades",
    "Five of Spades",
    "Six of Spades",
    "Seven of Spades",
    "Eight of Spades",
    "Nine of Spades",
    "Ten of Spades",
    "Zero of Hearts",
    "Two of Hearts",
    "Three of Hearts",
    "Four of Hearts",
    "Five of Hearts",
    "Six of Hearts",
    "Seven of Hearts",
    "Eight of Hearts",
    "Nine of Hearts",
    "Ten of Hearts",
    "Jack of Hearts",
    "Queen of Hearts",
    "King of Hearts",
    "Ace of Hearts",
    "Joker of Hearts",
    "Zero of Diamonds",
    "One of Diamonds",
    "Two of Diamonds",
    "Three of Diamonds",
    "Four of Diamonds",
    "Five of Diamonds",
    "Seven of Diamonds",
    "Eight of Diamonds",
    "Nine of Diamonds",
    "Ten of Diamonds",
    "Jack of Diamonds",
    "Queen of Diamonds",
    "King of Diamonds",
    "Ace of Diamonds",
    "Joker of Diamonds",
    "Zero of Clubs",
    "One of Clubs",
    "Two of Clubs",
    "Five of Clubs",
    "Six of Clubs",
    "Seven of Clubs",
    "Eight of Clubs",
    "Nine of Clubs",
    "Ten of Clubs",
    "Jack of Clubs",
    "Queen of Clubs",
    "King of Clubs",
    "Ace of Clubs",
    "Joker of Clubs",
]


def get_deck():
    deck_str = []
    for suit in ["Spades", "Hearts", "Diamonds", "Clubs"]:
        for i in range(16):
            deck_str.append(f"{card_value_dict[i]} of {suit}")
    return deck_str


CARD_DECK = get_deck()


class PRNG:
    def __init__(self, seed=int(os.urandom(8).hex(), 16)):
        self.seed = seed
        self.state = [self.seed]
        self.index = 64
        for i in range(63):
            self.state.append(
                (3 * (self.state[i] ^ (self.state[i - 1] >> 4)) + i + 1) % 64
            )
        # print(self.state)
        # sys.exit()

    def __str__(self):
        return f"{self.state}"

    def getnum(self):
        if self.index >= 64:
            for i in range(64):
                y = (self.state[i] & 0x20) + (self.state[(i + 1) % 64] & 0x1F)
                val = y >> 1
                val = val ^ self.state[(i + 42) % 64]
                if y & 1:
                    val = val ^ 37
                self.state[i] = val
            self.index = 0
        seed = self.state[self.index]
        self.index += 1
        return (seed * 15 + 17) % (2**6)


def shuffle(rng, deck):
    new_deck = []
    for i in range(len(deck)):
        x = rng.getnum()
        if deck[x] not in new_deck:
            new_deck.append(deck[x])
        elif deck[i] not in new_deck:
            new_deck.append(deck[i])
        else:
            for card in deck:
                if card not in new_deck:
                    new_deck.append(card)
                    break
    return new_deck


def exploit():
    def get_e_from_seed(seed, phi):
        rng = PRNG(seed)
        deck = CARD_DECK[:]
        deck = shuffle(rng, deck)
        computer_e, computer_d = -1, 0
        while computer_e < 2 or computer_d < 1:
            e_array = []
            for _ in range(6):
                e_array.append(str(rng.getnum()))
            computer_e = int("".join(e_array))
            if gcd(computer_e, phi) == 1:
                computer_d = pow(computer_e, -1, phi)
        return computer_e

    def get_e_s(phi):
        e_s = []
        for seed in range(1024):
            # print("trying seed", seed)
            e = get_e_from_seed(seed, phi)
            e_s.append(e)
        return e_s

    def find_e(enc_cards, e_s, phi, N):
        for e in e_s:
            d = pow(e, -1, phi)
            fl = True
            for enc_card in enc_cards:
                try:
                    card = long_to_bytes(pow(enc_card, d, N)).decode("utf-8")
                    if card not in CARD_DECK:
                        fl = False
                        break
                    else:
                        print(card)
                except UnicodeDecodeError:
                    fl = False
                    break

            if fl:
                return e
        return None

    def get_exp(r):
        r.recvuntil(b"RSA public and private exponents --> ")
        exp = r.recvuntil(b"\n").rstrip().decode("utf-8")
        exp = list(map(int, exp.split(",")))
        r.sendlineafter(b">> ", b"1")
        r.sendlineafter(b">> ", b"1")
        return exp

    def get_cards(r):
        r.recvuntil(b"Here is the shuffled encrypted deck --> ")
        val = r.recvuntil(b"]").strip().decode("utf-8")
        val = list(map(int, val[1:-1].split(",")))
        r.recvuntil(
            b"Please shuffle the deck and give it back to me one card at a time"
        )
        return val

    def submit_cards(r):
        for card in SENDING_CARDS:
            val = r.sendlineafter(b">> ", str(card).encode())
            # print(val)

    r = remote("0.0.0.0", 5555)
    # r = remote("crypto.csaw.io", 5001)
    p, q = get_exp(r)
    print(p, q)
    phi, N = (p - 1) * (q - 1), p * q
    e_s = get_e_s(phi)
    enc_cards = get_cards(r)
    print(enc_cards)
    e = find_e(enc_cards, e_s, phi, N)
    print(e, N)

    # encrypt cards
    for i, card in enumerate(SENDING_CARDS):
        SENDING_CARDS[i] = pow(bytes_to_long(str(card).encode()), e, N)

    print(SENDING_CARDS)

    for _ in range(9):
        submit_cards(r)
        get_cards(r)
    submit_cards(r)

    r.recvuntil(b"HAHAHAHA!!!!")
    val = r.recvall().strip()
    val = eval(val)
    print(val)
    flag = long_to_bytes(pow(bytes_to_long(val), pow(e, -1, phi), N))
    print(flag)
    r.close()


exploit()
