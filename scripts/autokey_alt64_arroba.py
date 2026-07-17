# Script de AutoKey (no se ejecuta solo, se pega dentro de la app AutoKey).
# Detecta Alt+6 seguido de Alt+4 en menos de 1s y escribe "@".

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


 