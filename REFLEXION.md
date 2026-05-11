# Preguntas de reflexión
Grecia Klarissa Saucedo Sandoval | A00839374 

## 1. ¿Qué ventajas tiene usar WebSocket vs REST polling?

Con polling el cliente estaría preguntando cada cierto tiempo si ya hubo algun cambio incluso cuando no ha pasado nada, entonces se mandan request innecesarios. Con WebSocket la conexión se queda abierta y el servidor te avisa justo cuando hay un cambio. En este caso, cuando alguien mete un gol, se manda el update en ese momento. Eso hace que haya menos tráfico, todo sea más rápido y funcione mejor cuando hay muchos usuarios conectados.

## 2. ¿Qué pasaría si el servidor se reinicia? ¿Qué datos se pierden?

Se pierde todo, como se está usando H2 en memoria con create-drop, en cuanto el servidor se apaga o se reinicia, la base de datos desaparece. Entonces el marcador vuelve a cero y no queda registro de nada. Además, el historial no se encuentra  en el backend sino en el estado de React, así que también se pierde si recargas. 

## 3. ¿Cómo diferencia el servidor quién envía cada cambio?

Realmente no lo hace. No hay autenticación, entonces cualquier cliente puede mandar un PUT y el servidor lo acepta sin saber quién fue. Tampoco se manda información del usuario en el WebSocket, así que todos ven el cambio pero no saben quién lo hizo. En algo más real sí se necesitaría autenticación, tipo JWT, para identificar a cada usuario.

## 4. ¿Por qué el frontend necesita hacer GET inicial + WebSocket y no solo WebSocket?

Porque el WebSocket solo te manda lo que pasa después de que te conectas. Si entras cuando el marcador ya va 2-1, no te va a decir ese resultado, solo te avisará cuando haya otro cambio. Por eso primero se hace un GET para traer el estado actual, y luego el WebSocket se encarga de ir actualizando todo en tiempo real. Si no hicieras el GET, la pantalla estaría vacía hasta que pase algo nuevo.