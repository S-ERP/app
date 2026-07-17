#!/bin/bash
# Atajo: enciende "caja" directo, sin preguntar el nombre (equivale a
# on_servidor.sh respondiendo "caja"). Queda del flujo original antes
# de generalizarlo.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$DIR/servidor_ctl.sh" caja up
