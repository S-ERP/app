#!/bin/bash
# Atajo: apaga "caja" directo, sin preguntar el nombre (equivale a
# off_servidor.sh respondiendo "caja"). Queda del flujo original antes
# de generalizarlo.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$DIR/servidor_ctl.sh" caja down
