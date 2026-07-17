# Script de AutoKey (no se ejecuta solo, se pega dentro de la app AutoKey).
# Mantener presionado Alt y escribir 6, 4 con el teclado numerico (Alt + 64)
# escribe "@", igual que el "codigo Alt" clasico de Windows.
# Tambien funciona con el 6/4 de la fila superior por si el numerico no
# manda esos nombres de tecla en tu sistema.

from time import time

last = []

def keyboard_press(key, modifiers):
    global last

    if "<alt>" in modifiers:
        if key in ("6", "<kp_6>"):
            last = [6, time()]
        elif key in ("4", "<kp_4>") and last and last[0] == 6 and time() - last[1] < 1:
            keyboard.send_keys("@")
            last = []
