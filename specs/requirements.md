# Requisitos — Weather App

## 1. Objetivo

Desarrollar una aplicación web responsive para buscar una ciudad y consultar su clima actual y el pronóstico de los tres días posteriores al día actual. La aplicación consumirá la API pública de Open-Meteo, sin credenciales ni backend.

## 2. Alcance

- Buscar ciudades mediante Open-Meteo Geocoding API.
- Consultar el pronóstico mediante Open-Meteo Forecast API.
- Mostrar clima actual y pronóstico diario para los tres días posteriores al actual.
- Guardar ciudades favoritas localmente y conservarlas entre sesiones del navegador, mientras no se borren los datos del sitio.
- Informar al usuario sobre carga, resultados vacíos y errores.
- Adaptar la interfaz a pantallas móviles y de escritorio.

## 3. Requisitos funcionales

### RF-01 — Búsqueda de ciudades
La aplicación debe permitir ingresar el nombre de una ciudad e iniciar su búsqueda.

**Criterios de aceptación**
- Al enviar un nombre no vacío, se consulta el servicio de geocodificación de Open-Meteo.
- La búsqueda se envía al activar el formulario, mediante el botón de búsqueda o la tecla Enter.
- Una búsqueda vacía o compuesta solo por espacios no genera solicitudes y muestra una indicación para ingresar una ciudad.

### RF-02 — Resultados y desambiguación de ciudades
La aplicación debe mostrar como máximo los primeros cinco resultados devueltos por geocodificación y permitir seleccionar una ciudad.

**Criterios de aceptación**
- Se muestran hasta cinco resultados, respetando el orden recibido de Open-Meteo.
- Si hay más de cinco coincidencias, no se muestran resultados posteriores al quinto.
- Cada resultado presenta la información disponible de ciudad, región o división administrativa y país.
- Ciudades con el mismo nombre se distinguen visualmente por sus coordenadas. Si las coordenadas mostradas se redondean, la identificación interna conserva la precisión recibida.
- La consulta del pronóstico utiliza las coordenadas de la ciudad seleccionada, no solamente el nombre escrito.

### RF-03 — Clima actual
La aplicación debe mostrar para la ciudad seleccionada:

- Temperatura actual.
- Sensación térmica.
- Condición del cielo.
- Velocidad del viento.
- Humedad relativa.

**Criterios de aceptación**
- Se muestra cada dato cuando Open-Meteo lo proporciona.
- Se utilizan las unidades predeterminadas de Open-Meteo y se identifican junto a los valores.
- La condición del cielo se representa con una descripción legible, no únicamente con un código meteorológico.
- Si falta un dato, se muestra exactamente “No disponible” para ese dato, sin ocultar los demás datos disponibles ni inventar un valor.

### RF-04 — Pronóstico diario
La aplicación debe mostrar el pronóstico de los tres días calendario posteriores al día actual en la ubicación consultada. El día actual no cuenta entre esos tres días.

**Criterios de aceptación**
- Se presentan las fechas de los tres días posteriores a la fecha actual de la ubicación consultada.
- Cada día presenta fecha o nombre del día, temperatura máxima y temperatura mínima.
- Se utilizan las unidades predeterminadas de Open-Meteo y se identifican junto a las temperaturas.
- Si falta una temperatura, se muestra “No disponible” en ese campo.
- Si la respuesta válida de Open-Meteo no contiene datos para alguna de las tres fechas, se muestran las fechas y datos disponibles y se informa que el pronóstico está incompleto.

### RF-05 — Indicador de carga
La aplicación debe comunicar cuándo está procesando una búsqueda o consulta meteorológica.

**Criterios de aceptación**
- Se muestra un indicador mientras se espera una respuesta de geocodificación o pronóstico.
- El indicador desaparece cuando termina cada operación, tanto si finaliza correctamente como si falla.
- Mientras una solicitud está pendiente, la interfaz evita envíos equivalentes accidentales o comunica claramente su estado.

### RF-06 — Ciudad sin resultados
La aplicación debe informar cuando no se encuentran ciudades para la búsqueda.

**Criterios de aceptación**
- Una respuesta válida de geocodificación sin resultados produce un mensaje claro, por ejemplo: “No se encontraron ciudades con ese nombre”.
- El mensaje permite corregir la búsqueda sin recargar la página.
- Una respuesta válida con cero resultados no se presenta como error de conexión.

### RF-07 — Errores de conexión o del servicio
La aplicación debe comunicar errores al consultar geocodificación o pronóstico.

**Criterios de aceptación**
- Si la solicitud falla por conexión, respuesta HTTP no exitosa o respuesta inválida, se muestra un mensaje comprensible.
- Un error de pronóstico no se presenta como si significara que la ciudad no existe.
- Después del error, el usuario puede volver a intentar la operación.

### RF-08 — Actualización de resultados
Al seleccionar otra ciudad, la aplicación debe actualizar los datos meteorológicos mostrados.

**Criterios de aceptación**
- La ciudad seleccionada y sus datos corresponden a la misma selección.
- Una respuesta tardía de una búsqueda o consulta anterior no reemplaza los resultados de la operación más reciente.
- Mientras se carga una ciudad nueva, los resultados anteriores no se presentan como si pertenecieran a esa ciudad.

### RF-09 — Guardar y quitar ciudades favoritas
La aplicación debe permitir guardar una ciudad seleccionada como favorita y quitarla de favoritas.

**Criterios de aceptación**
- Una ciudad seleccionada puede agregarse a favoritas y una favorita puede quitarse.
- La interfaz indica cuáles ciudades están guardadas.
- La identidad de una favorita se determina por sus coordenadas, conservando su precisión; no solo por su nombre.
- Una misma ubicación no se guarda dos veces.
- El usuario puede seleccionar una favorita para consultar su clima.
- Si las favoritas no están disponibles —por ejemplo, porque no se puede leer o escribir el almacenamiento local— la interfaz muestra exactamente: “No se pueden agregar favoritas por el momento, intentelo mas tarde”.
- La indisponibilidad de favoritas no bloquea la búsqueda ni la consulta del pronóstico.

### RF-10 — Persistencia de favoritas
La aplicación debe conservar las ciudades favoritas entre sesiones del mismo navegador y perfil mediante almacenamiento local.

**Criterios de aceptación**
- Una favorita guardada permanece disponible al recargar y al cerrar y volver a abrir el navegador, siempre que no se hayan borrado los datos del sitio.
- Una favorita quitada no reaparece al recargar.
- Si los datos guardados son inválidos, se informa la indisponibilidad de favoritas con el mensaje definido en RF-09 y las búsquedas y consultas meteorológicas siguen disponibles.
- No se requiere conservar favoritas después de borrar los datos del sitio.

## 4. Requisitos no funcionales

### RNF-01 — Tecnologías
La aplicación se implementará con HTML5 semántico, CSS3 y JavaScript ES Modules, sin frameworks ni dependencias innecesarias.

### RNF-02 — Fuentes de datos
- La geocodificación se realizará con Open-Meteo Geocoding API.
- El pronóstico se realizará con Open-Meteo Forecast API.
- No se usarán credenciales ni se implementará un backend.

### RNF-03 — Diseño responsive
La interfaz debe adaptarse a pantallas móviles y de escritorio.

**Criterios de aceptación**
- En un viewport de 375 px de ancho no hay desbordamiento horizontal de la página.
- El formulario, el clima actual, el pronóstico y las favoritas son legibles y utilizables en móvil.
- En un viewport de escritorio, el contenido conserva una jerarquía visual clara.

### RNF-04 — Accesibilidad básica
Los controles y estados deben poder identificarse y utilizarse de forma clara.

**Criterios de aceptación**
- El campo de búsqueda tiene una etiqueta visible o accesible.
- El formulario puede enviarse mediante teclado.
- Los mensajes de carga y error son texto legible y no dependen únicamente del color.

## 5. Reglas de negocio

- **RN-01:** Una ciudad queda seleccionada cuando el usuario elige un resultado de geocodificación; escribir un nombre no determina por sí solo sus coordenadas.
- **RN-02:** Las consultas meteorológicas utilizan las coordenadas del resultado seleccionado.
- **RN-03:** Se utilizan las unidades predeterminadas de Open-Meteo y se muestran sus identificadores junto a los valores.
- **RN-04:** Los códigos meteorológicos se traducen a descripciones comprensibles.
- **RN-05:** Un dato individual ausente se presenta como “No disponible”; no invalida los demás datos ni se reemplaza por un valor supuesto.
- **RN-06:** Una búsqueda sin coincidencias y un fallo de conexión se comunican por separado.
- **RN-07:** El pronóstico corresponde a los tres días calendario posteriores al día actual de la ubicación; el día actual no cuenta.
- **RN-08:** Las favoritas se almacenan localmente en el navegador y no se envían a un backend.
- **RN-09:** La identidad de una ubicación favorita se determina por sus coordenadas con la precisión recibida.
- **RN-10:** Las favoritas pertenecen al navegador y perfil en que se guardaron; no se sincronizan. Borrar los datos del sitio puede eliminarlas.
- **RN-11:** Los datos recuperados del almacenamiento se validan antes de usarse. Si son inválidos o el almacenamiento no está disponible, se muestra el mensaje definido en RF-09 y no se bloquean las consultas meteorológicas.

## 6. Casos límite

- Campo vacío o compuesto solo por espacios.
- Nombre con acentos, espacios o caracteres no ASCII.
- Ciudad inexistente o búsqueda sin coincidencias.
- Más de cinco coincidencias.
- Ciudades homónimas con coordenadas distintas.
- Resultado sin región o país disponible.
- Geocodificación exitosa seguida de error en la consulta meteorológica.
- Error de red, respuesta HTTP no exitosa o JSON inválido.
- Respuesta meteorológica sin uno o más campos.
- Pronóstico sin datos para una o más de las tres fechas futuras.
- Búsquedas consecutivas o cambio de ciudad mientras hay una solicitud pendiente.
- Ventana móvil estrecha o nombres de ciudad largos.
- Almacenamiento local deshabilitado, inaccesible, lleno o con datos inválidos.
- Intento de guardar una ubicación favorita duplicada.
- Borrado de los datos del sitio y pérdida de favoritas.

## 7. Fuera de alcance

- Sincronización de favoritas entre dispositivos, navegadores o perfiles.
- Pronóstico por hora.
- Ubicación automática mediante GPS.
- Autenticación, backend o almacenamiento de usuarios.
- Mapas, alertas meteorológicas y notificaciones.
- Selector para cambiar las unidades predeterminadas de Open-Meteo.
