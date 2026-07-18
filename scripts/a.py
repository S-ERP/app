# Script de AutoKey de DEBUG (no se ejecuta solo, se pega dentro de la app
# AutoKey). Escribe cada tecla + modificadores en /tmp/a.log, con hora,
# para descubrir el nombre exacto que manda tu teclado numerico.
#
# Uso:
#   1. Pegar esto en un script nuevo de AutoKey y guardarlo.
#   2. Mantener Alt y tocar 6 y 4 en el numerico.
#   3. En una terminal: tail -f /tmp/a.log  (o cat /tmp/a.log)
#   4. Fijarse que valor aparece para esas teclas (ej: "<kp_6>", "6", etc.)
#      y usar ese mismo valor en autokey_alt64_arroba.py.

from datetime import datetime

def keyboard_press(key, modifiers):
    try:
        with open("/tmp/a.log", "a") as f:
            hora = datetime.now().strftime("%H:%M:%S.%f")[:-3]
            f.write("%s key=%r modifiers=%r\n" % (hora, key, modifiers))
            f.flush()
    except Exception as e:
        with open("/tmp/a.log", "a") as f:
            f.write("ERROR: %r\n" % (e,))
