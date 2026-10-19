# Diseño — Weather App

## 1. Principios de arquitectura

La aplicación separa presentación, lógica de aplicación y comunicación con Open-Meteo en módulos pequeños. Se implementará con HTML5, CSS3 y JavaScript ES Modules, sin frameworks, dependencias innecesarias, credenciales ni backend.

Las favoritas se guardan en `localStorage`. No se garantiza que sobrevivan al borrado de los datos del sitio y no se sincronizan entre navegadores, perfiles o dispositivos.

## 2. Estructura de archivos

### `index.html` — estructura y punto de entrada

Contendrá la estructura semántica de la página:

- Formulario de búsqueda.
- Región para presentar y seleccionar resultados de geocodificación.
- Área de clima actual.
- Área de pronóstico para los tres días posteriores al actual.
- Lista de favoritas con controles para consultarlas o quitarlas.
- Regiones para mensajes de carga, errores y resultados vacíos.
- Referencia a `css/styles.css` y carga de `js/app.js` como módulo.

No contendrá lógica de negocio ni solicitudes a la API.

### `css/styles.css` — presentación y responsive

Definirá estilos para móviles y escritorio, jerarquía de contenido, estados de carga y error, resultados, favoritas, pronóstico y foco visible para teclado. No contendrá lógica de aplicación.

### `js/app.js` — coordinación, estado y reglas de aplicación

Será el punto de entrada de JavaScript y se encargará de:

- Registrar eventos del formulario, selección de resultados y acciones de favoritas.
- Mantener el estado de la búsqueda, resultados, ciudad seleccionada, clima, favoritas y carga.
- Validar la entrada de búsqueda antes de llamar a la API.
- Coordinar geocodificación, selección y consulta del pronóstico.
- Controlar que solo se presenten respuestas correspondientes a la operación más reciente.
- Leer, validar, actualizar y guardar favoritas en `localStorage`.
- Interpretar errores de API y almacenamiento, y pedir a `ui.js` que los presente.

Será el único módulo que coordine `api.js` y `ui.js`.

### `js/api.js` — comunicación con Open-Meteo

Exportará funciones para buscar ciudades y consultar pronóstico. Construirá las URL y parámetros, ejecutará `fetch`, comprobará el estado HTTP, interpretará el JSON y validará la estructura mínima de las respuestas. Convertirá errores de red, HTTP y formato en errores que `app.js` pueda manejar.

No manipulará el DOM ni accederá a `localStorage`.

Para geocodificación solicitará hasta cinco resultados y devolverá los resultados en el orden de la API.

Para el pronóstico solicitará datos actuales y diarios. Solicitará el día actual más los tres días posteriores, porque el día actual no cuenta entre los tres días requeridos. Utilizará la zona horaria local de la ubicación (`timezone=auto`) para interpretar las fechas del pronóstico. Los parámetros de unidades se omitirán para usar las unidades predeterminadas de Open-Meteo; la respuesta contiene las unidades que se mostrarán junto a los valores.

### `js/ui.js` — representación de interfaz

Exportará funciones para mostrar carga; resultados de búsqueda; ciudad seleccionada; clima actual; pronóstico; favoritas; errores; búsqueda sin coincidencias y datos faltantes. Recibirá datos de `app.js`, no hará solicitudes de red ni accederá a `localStorage`.

Cada dato meteorológico ausente se presentará como “No disponible”. Los códigos meteorológicos se traducirán a descripciones legibles antes de representarlos.

## 3. Flujo desde búsqueda hasta pronóstico

1. El usuario envía el formulario mediante el botón o Enter.
2. `app.js` recorta el texto. Si queda vacío, no inicia la solicitud y pide a `ui.js` mostrar una indicación.
3. `app.js` inicia el estado de carga y solicita la búsqueda a `api.js`.
4. `api.js` consulta Geocoding API con un límite de cinco resultados, valida la respuesta y devuelve hasta los primeros cinco resultados en el orden recibido.
5. Si la respuesta válida no contiene resultados, `app.js` solicita a `ui.js` mostrar que no se encontraron ciudades. Si hay coincidencias, `ui.js` las muestra, incluyendo las coordenadas para distinguir ciudades homónimas.
6. El usuario selecciona un resultado. `app.js` conserva la identidad y coordenadas exactas de esa ubicación y limpia o marca como obsoletos los datos meteorológicos previos.
7. `app.js` inicia la carga del pronóstico y llama a `api.js` con latitud y longitud.
8. `api.js` consulta Forecast API para el día actual y los tres días siguientes, solicitando clima actual y temperaturas diarias. Devuelve los datos y las unidades indicadas por Open-Meteo.
9. `app.js` comprueba que la respuesta pertenezca a la selección vigente, prepara descripciones de códigos meteorológicos y entrega los datos a `ui.js`.
10. `ui.js` presenta el clima actual y los tres días posteriores. Un campo individual ausente aparece como “No disponible”. Si la API no aporta datos para alguna fecha, se indica que el pronóstico está incompleto.
11. Tanto en éxito como en error, `app.js` finaliza el indicador de carga correspondiente.

## 4. Búsquedas concurrentes y respuestas obsoletas

`app.js` mantendrá identificadores incrementales separados para las búsquedas de ciudades y las consultas de pronóstico:

- Al iniciar una búsqueda, incrementará el identificador de búsqueda y asociará ese valor a la solicitud. Antes de renderizar resultados, comprobará que siga siendo el identificador más reciente. De lo contrario, descartará la respuesta.
- Al seleccionar una ciudad o favorita e iniciar un pronóstico, incrementará el identificador de pronóstico. Solo renderizará una respuesta cuyo identificador continúe vigente y cuya ubicación corresponda a la selección actual.
- Puede utilizarse `AbortController` para cancelar solicitudes anteriores como optimización, pero la comprobación de identificadores será la protección que evita renderizar respuestas obsoletas.

Así, una respuesta lenta anterior no reemplaza los resultados de una búsqueda o selección más reciente.

## 5. Validaciones y manejo de errores

### En `app.js`

- Rechazar búsquedas vacías o compuestas solo por espacios sin llamar a la API.
- Verificar que una ciudad seleccionada tenga coordenadas válidas antes de solicitar el pronóstico.
- Distinguir respuesta válida sin resultados de error de API.
- Controlar respuestas obsoletas mediante identificadores de operación.
- Validar los datos leídos de `localStorage` antes de usarlos y evitar duplicados por coordenadas.
- Capturar errores al leer o escribir `localStorage`. En esos casos, mostrar exactamente: “No se pueden agregar favoritas por el momento, intentelo mas tarde”. Las funciones de búsqueda y pronóstico deben seguir operativas.

### En `api.js`

- Comprobar `response.ok` antes de procesar una respuesta.
- Capturar fallos de red y errores al interpretar JSON.
- Comprobar la estructura básica esperada sin asumir que todos los valores meteorológicos están presentes.
- Tratar una lista válida vacía de geocodificación como resultado vacío, no como error de conexión.
- Propagar errores tipados o identificables para que `app.js` pueda elegir el mensaje adecuado.

### En `ui.js`

- Presentar estados distintos para carga, error de conexión o servicio, búsqueda sin resultados, datos faltantes y pronóstico incompleto.
- Mostrar “No disponible” por cada campo meteorológico faltante.
- No presentar valores inventados.
- Mantener legibles los mensajes y no depender solo del color para comunicar un estado.

## 6. Favoritas y persistencia

`app.js` será responsable de leer y escribir favoritas en `localStorage`. Cada favorita conservará al menos nombre, datos de ubicación disponibles y coordenadas con su precisión original. La identidad para detectar duplicados será el par de coordenadas, no el nombre de la ciudad.

Al iniciar la aplicación, `app.js` intentará leer y validar las favoritas y entregará el resultado a `ui.js`. Si el almacenamiento no está disponible o los datos no son válidos, se mostrará el mensaje definido en RF-09 y las consultas meteorológicas seguirán funcionando. Si el usuario borra los datos del sitio, no se espera que las favoritas se conserven.

## 7. Consideraciones de diseño responsive y accesibilidad

- El formulario, resultados, tarjetas de clima y favoritas deben ajustarse a pantallas móviles sin desbordamiento horizontal a 375 px.
- En escritorio, el contenido debe conservar jerarquía visual y aprovechar el espacio disponible.
- El campo de búsqueda tendrá etiqueta visible o accesible y el formulario será operable con teclado.
- Los indicadores de carga, errores y resultados vacíos se expresarán como texto legible.

## 8. Decisiones de arquitectura

- Se conservan tres módulos JavaScript porque separan coordinación (`app.js`), transporte y validación de respuestas (`api.js`) y presentación (`ui.js`), sin añadir dependencias.
- No se introduce un módulo separado para persistencia: guardar favoritas es una responsabilidad pequeña y local de `app.js` en esta escala.
- El pronóstico solicita cuatro días contando el actual, para presentar los tres días calendario posteriores. Las fechas se interpretan según la zona horaria de la ubicación.
