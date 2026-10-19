# Weather App

Aplicación web de clima construida con HTML5, CSS3 y JavaScript ES Modules. Permite buscar ubicaciones, consultar condiciones actuales y ver el pronóstico de los tres días calendario posteriores al día actual.

## Requisitos previos

- Python 3 para servir los archivos estáticos localmente.
- Un navegador moderno.
- Conexión a Internet para consultar Open-Meteo.

No se necesitan paquetes npm, frameworks ni credenciales de API. La aplicación no tiene backend; el servidor local indicado abajo solo entrega los archivos estáticos.

## Ejecutar el proyecto

Desde la raíz del proyecto, inicia el servidor estático:

```bash
python3 -m http.server 8000
```

Abre <http://localhost:8000/> en el navegador. Para detener el servidor, usa `Ctrl+C` en la terminal.

Se recomienda usar un servidor HTTP local en lugar de abrir `index.html` directamente como archivo, para que el navegador cargue los módulos ES y permita el almacenamiento local según su política de origen.

## Uso

1. Escribe el nombre de una ciudad en el campo de búsqueda y pulsa **Buscar** o Enter.
2. La aplicación consulta Open-Meteo Geocoding y muestra hasta los primeros cinco resultados. Cada resultado incluye la información de ubicación disponible y sus coordenadas.
3. Selecciona un resultado para consultar su clima. La ubicación seleccionada se identifica en la lista.
4. La vista muestra temperatura, sensación térmica, condición del cielo, viento y humedad relativa, además de las temperaturas máximas y mínimas de los tres días posteriores al día local actual. Se usan las unidades predeterminadas devueltas por Open-Meteo.
5. Pulsa **Agregar a favoritas** para guardar la ciudad seleccionada. En la lista de favoritas puedes usar **Consultar** para seleccionarla y actualizar el pronóstico, o **Quitar** para eliminarla.

Los campos meteorológicos ausentes se muestran como “No disponible”. Si la respuesta no contiene suficientes datos diarios, la interfaz indica que el pronóstico está incompleto. Los mensajes de carga y error se presentan en la página.

## Open-Meteo y conectividad

La app consulta directamente desde el navegador:

- [Geocoding API](https://open-meteo.com/en/docs/geocoding-api) para buscar ciudades.
- [Weather Forecast API](https://open-meteo.com/en/docs) para el clima actual y pronóstico.

Para el uso público no comercial de esta aplicación no se solicitan credenciales. Se requiere conexión a Internet para las consultas. No se envían datos a un backend.

## Favoritas y almacenamiento

Las favoritas se guardan en `localStorage` del navegador y perfil actual. Se recuperan al volver a abrir la aplicación y se identifican por sus coordenadas, no solo por el nombre. No se sincronizan entre dispositivos. Borrar los datos del sitio puede eliminarlas.

Si el almacenamiento no está disponible, falla la lectura o escritura, o los datos guardados no son válidos, la aplicación muestra:

> No se pueden agregar favoritas por el momento, intentelo mas tarde

Ese fallo no debería impedir buscar ciudades ni consultar su pronóstico.

## Validación de requisitos

Se revisaron `specs/requirements.md`, `specs/design.md`, `specs/tasks.md` y el código correspondiente a T-01–T-08. La matriz diferencia la inspección del código de una prueba real de interfaz. **Parcialmente cumplido** indica que la implementación correspondiente está presente, pero falta confirmar su comportamiento end-to-end. **No verificable** indica que requiere una prueba visual o interactiva que este entorno no pudo ejecutar.

Los estados «Cumplido (inspección estática)» se limitan a decisiones directamente verificables en los archivos. Los demás requisitos interactivos no se marcan como plenamente cumplidos porque no se pudieron probar en un navegador.

### Requisitos funcionales

| Criterio | Estado | Evidencia y limitación |
| --- | --- | --- |
| RF-01.a: texto no vacío consulta geocodificación | Parcialmente cumplido | El manejador de formulario llama a `searchCities`; la interacción de la app no se pudo ejecutar. |
| RF-01.b: envío por botón y Enter | Parcialmente cumplido | El formulario nativo tiene botón y `submit`; no se probó en navegador. |
| RF-01.c: vacío no consulta y muestra indicación | Parcialmente cumplido | El código recorta y valida el texto antes de la llamada; no se probó el mensaje en pantalla. |
| RF-02.a: primeros cinco, orden de la API | Parcialmente cumplido | API y UI limitan a cinco y conservan el orden del array; no se verificó el renderizado. |
| RF-02.b: no mostrar resultados después del quinto | Cumplido (inspección estática) | Hay límite `count=5` y `slice(0, 5)` en la presentación. |
| RF-02.c: nombre, región y país disponibles | Parcialmente cumplido | La presentación usa nombre y campos administrativos/país disponibles; falta prueba visual. |
| RF-02.d: distinguir homónimas por coordenadas y consultar la selección | Parcialmente cumplido | Las coordenadas se muestran y la selección conserva el objeto original; no se verificó en Network desde la app. |
| RF-03.a: mostrar los cinco campos actuales | Parcialmente cumplido | Se solicitan y mapean temperatura, sensación, código, viento y humedad; falta ejecutar la UI. |
| RF-03.b: unidades de Open-Meteo identificadas | Parcialmente cumplido | Los valores se combinan con las unidades de respuesta; no se verificó el texto renderizado. |
| RF-03.c: condición en descripción legible | Cumplido (inspección estática) | Existe el mapa WMO a descripciones en español. |
| RF-03.d: faltantes como “No disponible” | Parcialmente cumplido | La UI sustituye valores nulos o ausentes; falta probar una respuesta incompleta en el navegador. |
| RF-04.a: tres fechas posteriores al día local actual | Parcialmente cumplido | El código filtra por la fecha local de Forecast API y toma tres días; falta verificar en la página. |
| RF-04.b: fecha, máxima y mínima | Parcialmente cumplido | La presentación construye tarjetas por fecha con ambos valores; falta prueba de renderizado. |
| RF-04.c: unidades devueltas | Parcialmente cumplido | Se utilizan `daily_units`; no se comprobó la salida visual de la app. |
| RF-04.d: temperatura ausente como “No disponible” | Parcialmente cumplido | La UI maneja valores ausentes; falta respuesta de prueba desde la app. |
| RF-04.e: avisar si faltan días o valores diarios | Parcialmente cumplido | La lógica marca pronóstico incompleto si hay menos de tres días o falta una temperatura; no se simuló en navegador. |
| RF-05.a: mostrar carga durante solicitudes | Parcialmente cumplido | Se actualiza una región `role=status` y `aria-busy`; falta observar la interacción. |
| RF-05.b: finalizar carga en éxito/error | Parcialmente cumplido | Búsqueda y pronóstico usan `finally`; no se probó en navegador. |
| RF-05.c: impedir duplicados o comunicar operación pendiente | Parcialmente cumplido | Hay control de carga visible y cancelación/invalidez de solicitudes; falta prueba concurrente. |
| RF-06.a: mensaje claro sin resultados | Parcialmente cumplido | La respuesta vacía produce el mensaje específico; falta probar la UI. |
| RF-06.b: corregir búsqueda sin recargar | Parcialmente cumplido | El manejador previene el envío nativo y permite nuevos submits; no se probó. |
| RF-06.c: distinguir cero resultados de conexión | Parcialmente cumplido | API distingue array vacío de errores; falta ver el comportamiento de pantalla. |
| RF-07.a: mensajes para conexión, HTTP y formato | Parcialmente cumplido | API clasifica esos errores y app los transforma en mensajes; no se simularon desde navegador. |
| RF-07.b: error de pronóstico no parece ciudad inexistente | Cumplido (inspección estática) | `getForecastErrorMessage` conserva el mensaje de Forecast API separado del flujo de búsqueda. |
| RF-07.c: reintentar sin recarga | Parcialmente cumplido | El formulario y la selección siguen disponibles tras error según el código; no se probó en vivo. |
| RF-08.a: datos de la ubicación seleccionada | Parcialmente cumplido | La ciudad seleccionada se conserva en estado y se pasa al pronóstico; falta prueba end-to-end. |
| RF-08.b: ignorar respuestas antiguas | Cumplido (inspección estática) | Se comparan identificadores de solicitudes y se cancelan peticiones previas. |
| RF-08.c: no mostrar clima previo como nuevo | Cumplido (inspección estática) | Al cambiar de búsqueda/ciudad se limpian resultados meteorológicos anteriores. |
| RF-09.a: guardar y quitar favorita | Parcialmente cumplido | Hay manejadores de guardado y eliminación; no se probaron en navegador. |
| RF-09.b: indicar favoritas guardadas | Parcialmente cumplido | La lista muestra información y acciones; falta verificación visual. |
| RF-09.c: identidad por coordenadas exactas | Cumplido (inspección estática) | La igualdad compara latitud y longitud numéricas, no nombres. |
| RF-09.d: impedir duplicados | Cumplido (inspección estática) | Se verifica la pareja de coordenadas antes de agregar. |
| RF-09.e: seleccionar favorita para consultar clima | Parcialmente cumplido | El manejador establece la ciudad elegida y llama al flujo de pronóstico; falta prueba interactiva. |
| RF-09.f: mensaje exacto ante fallo de storage | Parcialmente cumplido | El texto solicitado está definido exactamente en app; no se provocó un fallo real. |
| RF-09.g: storage no bloquea búsqueda ni pronóstico | Parcialmente cumplido | Accesos al storage están aislados con `try/catch`; falta probar el caso en ejecución. |
| RF-10.a: persistir al recargar/cerrar | Parcialmente cumplido | Se usa `localStorage`; no se realizó recarga en navegador. |
| RF-10.b: quitar y recargar sin reaparición | Parcialmente cumplido | La lista actualizada se escribe en storage; falta prueba manual. |
| RF-10.c: validar datos inválidos y mantener búsquedas | Parcialmente cumplido | La validación y captura están implementadas; no se cargó un fixture inválido en navegador. |
| RF-10.d: no conservar tras borrar datos del sitio | Cumplido (inspección estática) | Las favoritas dependen de `localStorage`; no hay sincronización o respaldo externo. |

### Requisitos no funcionales y reglas de negocio

| Criterio | Estado | Evidencia y limitación |
| --- | --- | --- |
| RNF-01: HTML5, CSS3, ES Modules, sin frameworks/dependencias | Cumplido (inspección estática) | La estructura y los módulos revisados usan tecnologías nativas; no se encontró manifiesto de paquetes. |
| RNF-02.a: Geocoding API de Open-Meteo | Cumplido (inspección estática) | Endpoint configurado en `js/api.js`; consulta directa al servicio también respondió durante esta validación. |
| RNF-02.b: Forecast API de Open-Meteo | Cumplido (inspección estática) | Endpoint configurado en `js/api.js`; una consulta directa devolvió la estructura prevista. |
| RNF-02.c: sin credenciales ni backend | Cumplido (inspección estática) | Las llamadas son desde el navegador y no se encontraron credenciales ni código backend. |
| RNF-03.a: responsive | No verificable | Sin navegador no se pudo medir el layout a 375 px ni escritorio. |
| RNF-03.b: formulario, clima, forecast y favoritas legibles en móvil | No verificable | Hay reglas de layout pero no fue posible inspección visual. |
| RNF-03.c: jerarquía clara en escritorio | No verificable | Requiere inspección visual con viewport de escritorio. |
| RNF-04.a: campo etiquetado | Cumplido (inspección estática) | El campo tiene una etiqueta asociada, visualmente oculta pero accesible. |
| RNF-04.b: formulario operable con teclado | Parcialmente cumplido | Formulario y acciones son controles nativos; no se pudo completar el flujo solo con teclado. |
| RNF-04.c: mensajes legibles y no solo color | Cumplido (inspección estática) | Carga, errores, selección y estados incompletos incluyen texto y roles ARIA. |
| RN-01: selección ocurre al elegir resultado | Parcialmente cumplido | El listener usa un resultado de la lista; interacción no ejecutada. |
| RN-02: consultas usan coordenadas del resultado | Parcialmente cumplido | Código pasa latitud/longitud originales a Forecast API; no se inspeccionó la petición de la app. |
| RN-03: unidades predeterminadas y etiquetadas | Parcialmente cumplido | No se fijan unidades en URL y se formatean los campos `_units`; falta comprobación visual. |
| RN-04: traducir códigos meteorológicos | Cumplido (inspección estática) | El mapa de códigos WMO está definido en español. |
| RN-05: faltante no invalida otros campos | Parcialmente cumplido | UI maneja campos por separado; no se probó una respuesta parcialmente ausente. |
| RN-06: diferenciar cero resultados y error de red | Parcialmente cumplido | Hay rutas/tipos separados en API y UI; falta prueba interactiva. |
| RN-07: tres días futuros según zona horaria local | Parcialmente cumplido | Se solicita `timezone=auto` y se filtra por fecha local devuelta; presentación no verificada. |
| RN-08: favoritas locales, no enviadas al backend | Cumplido (inspección estática) | Se guardan únicamente en `localStorage`; no hay envío de favoritas. |
| RN-09: identidad por coordenadas exactas | Cumplido (inspección estática) | La comparación de ubicación se basa en ambos valores de coordenadas. |
| RN-10: favoritas por navegador/perfil y borrables | Cumplido (inspección estática) | No hay sincronización y los datos dependen de `localStorage`. |
| RN-11: validar storage e aislar sus fallos | Parcialmente cumplido | Validación y capturas existen; no se pudo provocar storage inválido/bloqueado ni probar el resto de la app en ese estado. |

### Limitaciones conocidas

- La aplicación necesita Internet para obtener geocodificación y pronóstico; las respuestas pueden contener datos incompletos según ubicación o disponibilidad del servicio.
- Si se bloquea `localStorage`, las favoritas no estarán disponibles, aunque búsqueda y pronóstico están diseñados para seguir funcionando.
- El repositorio no incluye una suite automatizada de pruebas. En la validación disponible no había navegador ni runtime JavaScript, así que los flujos interactivos, consola y presentación en distintos viewports siguen pendientes de comprobación manual.
