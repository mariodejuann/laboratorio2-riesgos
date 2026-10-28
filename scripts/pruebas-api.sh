#!/usr/bin/env bash
# Pruebas de aceptación contra la API (local o Preview).
# Uso:  bash scripts/pruebas-api.sh https://tu-preview.vercel.app
# La contraseña se pide por teclado (no se muestra) o se toma de ADMIN_PASSWORD.
# No escribas la contraseña en archivos ni en el chat.
set -u
BASE="${1:-http://localhost:3000}"
if [ -z "${ADMIN_PASSWORD:-}" ]; then read -r -s -p "Contraseña de administración: " ADMIN_PASSWORD; echo; fi
TMP=$(mktemp -d); JAR="$TMP/cookies"; OK=0; KO=0
trap 'rm -rf "$TMP"' EXIT

comprobar() { # nombre esperado obtenido
  if [ "$2" = "$3" ]; then echo "PASA  $1 (HTTP $3)"; OK=$((OK+1)); else echo "FALLA $1 (esperado $2, obtenido $3)"; KO=$((KO+1)); fi
}
peticion() { # metodo ruta [cuerpo] [opciones extra...]
  local m=$1 r=$2 b=${3:-}; shift 3 2>/dev/null || shift $#
  curl -s -o "$TMP/out" -w "%{http_code}" -X "$m" "$BASE$r" -H "Content-Type: application/json" ${b:+--data "$b"} "$@"
}

VALIDO='{"proceso":"matrícula","activo":"plataforma web","objetivo":"completar solicitudes en plazo","condicion":"prueba automática","amenaza":"prueba","evento":"prueba","consecuencia":"prueba","supuesto":"","probabilidad":1,"justificacionProbabilidad":"prueba","impacto":2,"justificacionImpacto":"prueba","medidaDescripcion":"prueba","medidaPrioridad":"baja","medidaResponsable":"","medidaEfecto":"prueba de efecto esperado","medidaVerificacion":"prueba","medidaEstado":"propuesta"}'
ID_FALSO="3f1c7a2e-9b4d-4c1e-8a2f-1b2c3d4e5f60"

echo "== Escritura y lectura no autorizadas (SEG-03) =="
comprobar "GET /api/riesgos sin sesión" 401 "$(peticion GET /api/riesgos)"

# Prueba 4: escritura no autorizada no cambia la BD (comparar /api/resumen antes y después)
peticion GET /api/resumen >/dev/null; RESUMEN_ANTES=$(cat "$TMP/out")
comprobar "POST sin sesión" 401 "$(peticion POST /api/riesgos "$VALIDO")"
comprobar "PUT sin sesión" 401 "$(peticion PUT /api/riesgos/$ID_FALSO "$VALIDO")"
comprobar "DELETE sin sesión" 401 "$(peticion DELETE /api/riesgos/$ID_FALSO)"
comprobar "POST con cookie falsificada" 401 "$(peticion POST /api/riesgos "$VALIDO" -H "Cookie: sesion=admin.9999999999999.firmafalsa")"
peticion GET /api/resumen >/dev/null; RESUMEN_DESPUES=$(cat "$TMP/out")
if [ "$RESUMEN_ANTES" = "$RESUMEN_DESPUES" ]; then
  comprobar "BD sin cambios tras escrituras no autorizadas" si si
else
  comprobar "BD sin cambios tras escrituras no autorizadas" si no
fi

comprobar "Login con contraseña incorrecta" 401 "$(peticion POST /api/login '{"contrasena":"incorrecta"}')"

echo "== Inicio de sesión =="
CUERPO=$(node -e 'process.stdout.write(JSON.stringify({contrasena: process.argv[1]}))' "$ADMIN_PASSWORD")
comprobar "Login correcto" 200 "$(peticion POST /api/login "$CUERPO" -c "$JAR")"
S=(-b "$JAR")

echo "== Validación en servidor (SEG-05) =="
comprobar "Probabilidad 5" 400 "$(peticion POST /api/riesgos "${VALIDO/\"probabilidad\":1/\"probabilidad\":5}" "${S[@]}")"
comprobar "Probabilidad como texto" 400 "$(peticion POST /api/riesgos "${VALIDO/\"probabilidad\":1/\"probabilidad\":\"1\"}" "${S[@]}")"
LARGO=$(printf 'x%.0s' $(seq 1 121))
comprobar "Proceso de 121 caracteres" 400 "$(peticion POST /api/riesgos "${VALIDO/\"proceso\":\"matrícula\"/\"proceso\":\"$LARGO\"}" "${S[@]}")"
comprobar "Activo fuera de lista" 400 "$(peticion POST /api/riesgos "${VALIDO/plataforma web/servidor de correo}" "${S[@]}")"
comprobar "Cuerpo que no es JSON" 415 "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/riesgos" -H 'Content-Type: text/plain' --data 'x' "${S[@]}")"
comprobar "Identificador no UUID" 400 "$(peticion DELETE "/api/riesgos/1%20OR%201=1" "" "${S[@]}")"
comprobar "Origen distinto" 403 "$(peticion POST /api/riesgos "$VALIDO" "${S[@]}" -H 'Origin: https://atacante.example')"

echo "== Persistencia y clasificación =="
comprobar "Crear riesgo válido" 201 "$(peticion POST /api/riesgos "$VALIDO" "${S[@]}")"
NUEVO=$(node -e 'const r=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).riesgo;process.stdout.write(r.id+" "+r.puntuacion+" "+r.nivel)' "$TMP/out")
set -- $NUEVO; ID=$1
comprobar "Clasificación 1×2 calculada en servidor" "2 bajo" "$2 $3"
comprobar "Lectura tras crear (persistencia)" 200 "$(peticion GET /api/riesgos "" "${S[@]}")"
grep -q "$ID" "$TMP/out" && comprobar "El riesgo creado se recupera" si si || comprobar "El riesgo creado se recupera" si no
comprobar "Editar a 3×3" 200 "$(peticion PUT /api/riesgos/$ID "$(echo "$VALIDO" | sed 's/"probabilidad":1/"probabilidad":3/; s/"impacto":2/"impacto":3/')" "${S[@]}")"
grep -q '"puntuacion":9,"nivel":"alto"' "$TMP/out" && comprobar "Reclasificado 3×3 = 9 alto" si si || comprobar "Reclasificado 3×3 = 9 alto" si no
comprobar "Borrar el riesgo de prueba" 204 "$(peticion DELETE /api/riesgos/$ID "" "${S[@]}")"

echo "== Errores sin detalles internos (SEG-07) =="
peticion GET /api/resumen >/dev/null
if grep -qiE "postgres|password|select |stack|at .*\.js" "$TMP/out"; then comprobar "Respuesta sin detalles internos" si no; else comprobar "Respuesta sin detalles internos" si si; fi

peticion POST /api/logout "" "${S[@]}" >/dev/null
echo; echo "Resultado: $OK pasan, $KO fallan"
[ "$KO" -eq 0 ]
