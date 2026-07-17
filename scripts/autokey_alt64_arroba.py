from time import time

last = []

def keyboard_press(key, modifiers):
    global last

    if "<alt>" in modifiers:
        if key == "6":
            last = [6, time()]
        elif key == "4" and last and last[0] == 6 and time() - last[1] < 1:
            keyboard.send_keys("@")
            last = []
