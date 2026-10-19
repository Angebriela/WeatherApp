# Tareas — Weather App

## Proceso de avance

Completar cada tarea de forma independiente. Al terminarla:

1. Revisar el cambio con `git diff`.
2. Ejecutar la prueba manual indicada.
3. Revisar que se cumplan los criterios de aceptación.
4. Crear un commit antes de comenzar la tarea siguiente.

No iniciar una tarea si sus dependencias no están revisadas y confirmadas.

---

## T-01 — Estructura semántica y estilos base

**Dependencias:** ninguna.

**Archivos a modificar**
- `index.html`
- `css/styles.css`

**Requisitos relacionados**
- RNF-01, RNF-03, RNF-04.

**Criterios de aceptación**
- `index.html` contiene las regiones semánticas previstas en `design.md`: búsqueda, resultados, clima actual, pronóstico, favoritas y mensajes de estado.
- Los controles tienen etiquetas visibles o accesibles.
- Se enlaza `css/styles.css` y se carga `js/app.js` como módulo.
- El diseño base no presenta desbordamiento horizontal a 375 px.

**Prueba manual**
- Abrir `index.html` en el navegador.
- Revisar que las secciones y controles estén presentes y que la página no tenga desbordamiento horizontal a 375 px ni en escritorio.

**Punto de revisión y commit:** revisar estructura y estilos base; crear commit antes de T-02.

---

## T-02 — Funciones de presentación y estado inicial

**Dependencias:** T-01.

**Archivos a modificar**
- `js/ui.js`
- `js/app.js`

**Requisitos relacionados**
- RF-01, RF-05, RF-06, RNF-04.

**Criterios de aceptación**
- `ui.js` exporta funciones para mostrar carga, mensajes, resultados, clima, pronóstico y favoritas, sin hacer solicitudes de red ni acceder a `localStorage`.
- `app.js` importa `ui.js` y registra el envío del formulario.
- El formulario puede enviarse mediante el botón o Enter.
- Una entrada vacía o compuesta solo por espacios no provoca una llamada de búsqueda y muestra una indicación.
- Los estados de carga y mensajes se representan como texto accesible.

**Prueba manual**
- Enviar el formulario vacío y con espacios; comprobar que aparece la indicación y no se inicia una solicitud.
- Enviar texto no vacío y comprobar que el evento se procesa sin errores en la consola.

**Punto de revisión y commit:** revisar la separación entre coordinación y presentación; crear commit antes de T-03.

---

## T-03 — Cliente de geocodificación

**Dependencias:** T-02.

**Archivos a modificar**
- `js/api.js`
- `js/app.js`

**Requisitos relacionados**
- RF-01, RF-02, RF-05, RF-06, RF-07.

**Criterios de aceptación**
- `api.js` exporta una función para consultar Open-Meteo Geocoding API mediante `fetch`.
- La solicitud respeta el límite de cinco resultados.
- La función comprueba el estado HTTP y valida la estructura mínima de la respuesta.
- Una respuesta correcta sin coincidencias se devuelve como lista vacía, no como error de conexión.
- `app.js` activa y finaliza el indicador de carga durante la búsqueda, incluso si ocurre un error.
- Los errores de red, HTTP y formato se propagan para que la aplicación los pueda mostrar.

**Prueba manual**
- Buscar una ciudad conocida y comprobar en la pestaña de red que se consulta Geocoding API.
- Buscar un nombre sin coincidencias y comprobar que se distingue de un fallo de conexión.
- Desconectar la red y buscar; comprobar que aparece un error comprensible y que desaparece el indicador de carga.

**Punto de revisión y commit:** revisar solicitud y separación de errores; crear commit antes de T-04.

---

## T-04 — Presentar resultados y seleccionar ciudad

**Dependencias:** T-03.

**Archivos a modificar**
- `js/app.js`
- `js/ui.js`
- `css/styles.css`

**Requisitos relacionados**
- RF-01, RF-02, RF-06, RNF-03, RNF-04.

**Criterios de aceptación**
- Se presentan hasta los primeros cinco resultados, conservando el orden de la API.
- Cada resultado muestra los datos disponibles de ciudad, región y país.
- Las coordenadas distinguen visualmente ciudades homónimas.
- Al seleccionar una opción, `app.js` conserva las coordenadas completas recibidas, aunque la interfaz las muestre redondeadas.
- Una búsqueda sin coincidencias muestra un mensaje claro y permite volver a buscar sin recargar.

**Prueba manual**
- Buscar una ciudad con varias coincidencias.
- Comprobar que no se presenten más de cinco opciones y que se distingan las ubicaciones homónimas por coordenadas.
- Seleccionar un resultado y comprobar que queda identificado en la interfaz.
- Buscar una ciudad inexistente e iniciar una búsqueda nueva.

**Punto de revisión y commit:** revisar selección y desambiguación; crear commit antes de T-05.

---

## T-05 — Consulta y presentación del clima y pronóstico

**Dependencias:** T-04.

**Archivos a modificar**
- `js/api.js`
- `js/app.js`
- `js/ui.js`
- `css/styles.css`

**Requisitos relacionados**
- RF-03, RF-04, RF-05, RF-08, RN-02, RN-03, RN-04, RN-07.

**Criterios de aceptación**
- Al seleccionar una ciudad, el pronóstico se consulta usando sus coordenadas exactas.
- La solicitud de Forecast API incluye los campos actuales de temperatura, sensación térmica, código meteorológico, velocidad del viento y humedad relativa.
- La solicitud diaria cubre el día actual y los tres días posteriores; se muestran únicamente los tres días posteriores, interpretados según la zona horaria de la ubicación.
- No se pasan parámetros de unidades y se muestran las unidades devueltas por Open-Meteo.
- Se muestran los datos actuales solicitados y las temperaturas máximas y mínimas de los tres días futuros.
- Cada dato meteorológico ausente se representa como “No disponible”.
- Los códigos meteorológicos se presentan como descripciones legibles.
- Si faltan datos diarios para alguna fecha, se indica que el pronóstico está incompleto.

**Prueba manual**
- Seleccionar una ciudad y comprobar que la consulta usa sus coordenadas.
- Verificar que se muestra el clima actual y tres fechas posteriores al día local actual, sin contar hoy.
- Revisar que las unidades correspondan a las devueltas por Open-Meteo.
- Si es posible, usar una respuesta simulada o una ciudad/condición con datos ausentes para verificar “No disponible” y el aviso de pronóstico incompleto.

**Punto de revisión y commit:** revisar campos, unidades y fechas del pronóstico; crear commit antes de T-06.

---

## T-06 — Errores de API y protección contra respuestas obsoletas

**Dependencias:** T-05.

**Archivos a modificar**
- `js/app.js`
- `js/api.js`
- `js/ui.js`

**Requisitos relacionados**
- RF-05, RF-06, RF-07, RF-08, RN-06.

**Criterios de aceptación**
- Los fallos de conexión, respuestas HTTP no exitosas y JSON inválido muestran un mensaje comprensible.
- Un error de pronóstico no se presenta como ciudad inexistente.
- El usuario puede volver a intentar una búsqueda o consulta fallida.
- Cada nueva búsqueda invalida respuestas de geocodificación anteriores.
- Cada nueva selección invalida respuestas de pronóstico anteriores.
- Solo se presentan respuestas que correspondan a la búsqueda o selección vigente.
- La interfaz no muestra datos de una ciudad anterior como si fueran de la ciudad que se está cargando.
- El indicador de carga se finaliza correctamente tanto en éxito como en error.

**Prueba manual**
- Simular una búsqueda lenta seguida de otra; comprobar que los resultados de la primera no reemplazan los de la segunda.
- Seleccionar ciudades sucesivamente con la primera consulta retrasada; comprobar que solo se muestra el pronóstico de la última selección.
- Probar un error de red y volver a intentar sin recargar.

**Punto de revisión y commit:** revisar el control de concurrencia y errores; crear commit antes de T-07.

---

## T-07 — Guardar, quitar y recuperar favoritas

**Dependencias:** T-06.

**Archivos a modificar**
- `js/app.js`
- `js/ui.js`
- `css/styles.css`

**Requisitos relacionados**
- RF-09, RF-10, RN-08, RN-09, RN-10, RN-11.

**Criterios de aceptación**
- Una ciudad seleccionada puede guardarse y quitarse de favoritas.
- Las favoritas se guardan y recuperan mediante `localStorage`.
- Se evita guardar dos veces la misma ubicación comparando sus coordenadas exactas, no solo el nombre.
- Las favoritas muestran información identificable y permiten consultar el pronóstico al seleccionarlas.
- Si `localStorage` no está disponible, falla su lectura/escritura o los datos guardados son inválidos, se muestra exactamente: “No se pueden agregar favoritas por el momento, intentelo mas tarde”.
- Un fallo de favoritas no impide buscar ciudades ni consultar el pronóstico.
- Una favorita quitada sigue ausente después de recargar, mientras el almacenamiento del sitio se mantenga.

**Prueba manual**
- Guardar una ciudad, recargar la página y comprobar que sigue en favoritas.
- Cerrar y volver a abrir el navegador en el mismo perfil y comprobar que se conserva.
- Quitarla, recargar y comprobar que no reaparece.
- Intentar guardar dos resultados con las mismas coordenadas y comprobar que no se duplican.
- Probar con almacenamiento local bloqueado o datos inválidos y verificar el mensaje exacto y que la búsqueda siga funcionando.
- Borrar los datos del sitio y confirmar que no se exige conservar las favoritas.

**Punto de revisión y commit:** revisar persistencia y tolerancia a fallos; crear commit antes de T-08.

---

## T-08 — Revisión responsive y accesibilidad de interacción

**Dependencias:** T-07.

**Archivos a modificar**
- `index.html`
- `css/styles.css`
- `js/ui.js`
- `js/app.js` solo si se requieren ajustes de interacción accesible.

**Requisitos relacionados**
- RNF-03, RNF-04, RF-05, RF-07, RF-09.

**Criterios de aceptación**
- A 375 px no existe desbordamiento horizontal.
- El formulario, resultados, clima, pronóstico y favoritas son legibles y utilizables en móvil y escritorio.
- Los controles pueden operarse mediante teclado y tienen etiquetas accesibles.
- Los estados de carga y error se anuncian como texto y no dependen únicamente del color.
- El foco del teclado es visible.

**Prueba manual**
- Probar la aplicación a 375 px y en un viewport de escritorio.
- Completar búsqueda, selección, guardado y eliminación usando solo teclado.
- Comprobar visibilidad de foco, carga y mensajes de error.

**Punto de revisión y commit:** revisar la experiencia completa en móvil y teclado; crear commit antes de T-09.

---

## T-09 — Validación final de requisitos y documentación del proyecto

**Dependencias:** T-08.

**Archivos a modificar**
- `README.md`

**Requisitos relacionados**
- RF-01 a RF-10.
- RNF-01 a RNF-04.
- RN-01 a RN-11.

**Criterios de aceptación**
- Se verifica cada requisito funcional y no funcional contra su criterio de aceptación.
- Se registran los resultados de validación y cualquier requisito pendiente o con limitaciones conocidas.
- `README.md` explica el propósito de la aplicación, cómo abrirla y utilizarla, sus funciones principales y el uso de Open-Meteo.
- El README aclara que no se requiere backend ni credenciales, que las favoritas se guardan en el navegador y que pueden perderse al borrar los datos del sitio.
- La documentación no afirma funcionalidades que no estén implementadas.

**Prueba manual**
- Seguir las instrucciones del README desde una copia limpia del proyecto y comprobar que la aplicación inicia y puede buscar una ciudad.
- Recorrer la lista de criterios de `requirements.md` y comprobarlos manualmente; anotar cualquier fallo o limitación.
- Revisar el README para confirmar que sus instrucciones y descripciones coinciden con el comportamiento observado.

**Punto de revisión y commit:** revisar la matriz de requisitos y la documentación; crear un commit antes de dar por terminada la entrega.
