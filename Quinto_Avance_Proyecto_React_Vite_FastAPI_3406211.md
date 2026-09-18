# Quinto Avance – React + Vite + FastAPI

## Integración De Gestión Comercial, Analítica, Despliegue E Inteligencia Artificial

**Actividad Práctica**

### Requerimientos del Quinto Avance

Evolución del proyecto Full Stack con React + Vite, FastAPI, Base de Datos SQL e Inteligencia Artificial.

**Instructor:** Jhan Hader Muñoz  
**Ficha:** 3406211  
**Trimestre:** 03  
**Ambiente:** 702  
**Competencia:** React

## Contexto de la actividad

Una vez finalizados los requerimientos establecidos en los avances anteriores, el aprendiz deberá continuar con la evolución del proyecto desarrollado, conservando la arquitectura tecnológica implementada en el cuarto avance:

`React + Vite → FastAPI → Base de Datos SQL`

En el cuarto avance se estableció la integración entre el Frontend desarrollado con React + Vite, el Backend desarrollado con FastAPI y la base de datos relacional SQL, incorporando autenticación mediante JWT, control de roles, operaciones CRUD, protección de endpoints, validaciones y paneles diferenciados para los usuarios del sistema.

Para este quinto avance, el aprendiz deberá ampliar las funcionalidades existentes y transformar la aplicación en una solución con mayores capacidades de gestión comercial, generación de reportes, visualización de información, facturación, análisis de datos, despliegue en la nube e integración de un Chatbot basado en Inteligencia Artificial (IA).

El objetivo no es desarrollar una aplicación diferente, sino continuar evolucionando el proyecto construido durante los avances anteriores, aprovechando la estructura, componentes, base de datos, endpoints, autenticación, roles y funcionalidades previamente implementadas.

## Objetivo de aprendizaje

Desarrollar nuevas funcionalidades sobre la aplicación Full Stack existente, utilizando React + Vite, FastAPI y una base de datos SQL, mediante la implementación de módulos de ventas, facturación, generación de reportes, Dashboards, despliegue en la nube e integración de un Chatbot con Inteligencia Artificial para la atención de clientes y gestión de PQR.

## Objetivos específicos

- Ampliar la base de datos SQL incorporando las entidades necesarias para administrar ventas, facturas, detalle de ventas, PQR y demás información requerida por el proyecto.
- Desarrollar nuevos endpoints en FastAPI para gestionar las funcionalidades comerciales y administrativas.
- Implementar el registro y consulta de ventas de productos y servicios ofrecidos a través del sitio web.
- Generar reportes diarios de ventas en formatos PDF y Excel.
- Implementar un módulo de generación y consulta de facturas de venta.
- Desarrollar Dashboards diferenciados de acuerdo con los roles definidos en el proyecto.
- Incorporar elementos visuales como tarjetas informativas, gráficos de barras y gráficos lineales.
- Implementar mecanismos de filtrado y consulta de información para facilitar el análisis de los datos.
- Preparar la aplicación para su despliegue en un entorno de producción.
- Integrar un chatbot basado en Inteligencia Artificial para brindar atención a los usuarios y gestionar consultas, quejas, reclamos y PQR.

## Nuevos Requerimientos del Quinto Avance

El aprendiz deberá implementar como mínimo **20 nuevos requerimientos funcionales y/o técnicos**, los cuales deberán integrarse al proyecto existente.

### 1. Módulo de ventas

El sistema deberá permitir registrar las ventas realizadas desde el sitio web. La venta deberá relacionarse, como mínimo, con cliente, usuario que realiza la operación cuando corresponda, productos vendidos, servicios vendidos, cantidades, precios, descuentos cuando correspondan, subtotal, impuestos cuando correspondan, total, fecha y hora y estado de la venta. La información deberá almacenarse de manera persistente en la base de datos SQL.

### 2. Registro de productos y servicios vendidos

El sistema deberá permitir identificar los productos y/o servicios incluidos en cada venta. Deberá existir una relación entre la venta y su respectivo detalle, permitiendo almacenar cantidades, precios y valores correspondientes a cada elemento comercializado.

### 3. Historial de ventas

El sistema deberá disponer de un módulo que permita consultar el historial de ventas. Los usuarios autorizados podrán realizar consultas utilizando criterios como fecha, cliente, producto, servicio, estado y valor de la venta.

### 4. Reporte diario de ventas

El sistema deberá generar un reporte diario de ventas con la información registrada durante una fecha determinada. El reporte deberá incluir fecha, número de venta, cliente, productos y/o servicios, cantidad, valor, total de la venta y estado.

### 5. Exportación del reporte en PDF

El aprendiz deberá implementar la generación del reporte diario de ventas en formato PDF. El documento deberá presentar una estructura organizada, incluyendo como mínimo nombre o identificación del proyecto, fecha del reporte, información de las ventas, totales e información de generación del reporte.

### 6. Exportación del reporte en Excel

El mismo reporte de ventas deberá poder exportarse en formato Excel (`.xlsx`). El archivo deberá contener información organizada en columnas y permitir posteriormente realizar procesos de análisis o filtrado de datos.

### 7. Generación de facturas de venta

El sistema deberá generar una factura de venta a partir de una operación comercial registrada. La factura deberá contener como mínimo número de factura, fecha, datos del cliente, productos y/o servicios, cantidad, precio unitario, subtotal, impuestos cuando correspondan, total y estado de la factura.

### 8. Consulta de facturas

Los usuarios autorizados deberán poder consultar las facturas generadas. El sistema deberá permitir buscar facturas mediante diferentes criterios, como número de factura, cliente o fecha.

### 9. Descarga de facturas

El aprendiz deberá implementar la posibilidad de generar o descargar la factura en un formato apropiado, preferiblemente PDF.

### 10. Dashboard administrativo

El Administrador deberá disponer de un dashboard con información consolidada del sistema. Como mínimo deberá presentar indicadores relacionados con total de usuarios, productos, servicios, ventas, facturación y PQR recibidas y pendientes. Los indicadores deberán representarse mediante componentes visuales tipo Card.

### 11. Dashboard de ventas

El sistema deberá incorporar gráficos que permitan analizar el comportamiento de las ventas. Como mínimo deberá implementar gráfico de barras, gráfico lineal e indicadores numéricos mediante Cards. Los gráficos podrán representar información por día, semana o mes.

### 12. Dashboard de acuerdo con los roles

Los Dashboards deberán respetar el sistema de roles desarrollado en el cuarto avance. Administrador, empleado y cliente deberán visualizar únicamente la información y funcionalidades que correspondan a sus permisos.

### 13. Filtros para los Dashboards

Los gráficos e indicadores deberán permitir, cuando sea aplicable, filtrar información mediante criterios como fecha inicial, fecha final, producto, servicio, estado y cliente.

### 14. Nuevos endpoints en FastAPI

El aprendiz deberá crear los endpoints necesarios para soportar las nuevas funcionalidades, incluyendo, según corresponda, ventas, detalle de ventas, facturas, reportes, PQR, chatbot y estadísticas.

### 15. Integración del Dashboard con FastAPI

La información presentada en los Dashboards no deberá estar escrita manualmente en el Frontend. React deberá consumir los endpoints de FastAPI para obtener la información almacenada en la base de datos y generar los indicadores y gráficos dinámicamente.

### 16. Módulo de PQR (Petición de Quejas y Reclamos)

El sistema deberá incorporar un módulo para la gestión de peticiones, quejas y reclamos. El cliente deberá poder registrar una solicitud y consultar su estado. El sistema deberá permitir estados como pendiente, en proceso, respondida y cerrada, adaptables a las características del proyecto.

### 17. Chatbot para atención al cliente

El aprendiz deberá implementar un Chatbot integrado al sitio web para proporcionar atención inicial a los clientes. Deberá permitir resolver preguntas frecuentes, orientar sobre productos y servicios, proporcionar información general, orientar procesos de compra y recibir u orientar solicitudes relacionadas con PQR.

### 18. Integración del Chatbot con Inteligencia Artificial

El Chatbot deberá utilizar un servicio de Inteligencia Artificial que permita generar respuestas más naturales y contextualizadas. El aprendiz podrá utilizar una API de IA, como OpenAI API, o cualquier otro proveedor equivalente que sea técnicamente viable. La integración deberá realizarse preferiblemente desde FastAPI.

### 19. Gestión segura de la API Key

Para utilizar el servicio de Inteligencia Artificial, el aprendiz deberá configurar la clave de acceso mediante variables de entorno. La clave deberá mantenerse privada y no deberá publicarse en GitHub ni incorporarse directamente al código fuente.

### 20. Integración completa y despliegue del proyecto

El aprendiz deberá realizar el despliegue de la aplicación para demostrar que el proyecto puede funcionar fuera del entorno local. Railway será una plataforma recomendada, aunque podrá utilizarse otra plataforma técnicamente viable. El despliegue deberá contemplar, según la arquitectura utilizada, Frontend React + Vite, Backend FastAPI, base de datos SQL, variables de entorno, configuración de URLs, CORS y credenciales de forma segura. Se deberá presentar la URL pública de la aplicación y evidencias de funcionamiento.

## Requerimientos técnicos adicionales

### Base de datos

La base de datos deberá evolucionar respecto a los avances anteriores para soportar las nuevas funcionalidades. Podrán incorporarse tablas como:

- `ventas`
- `detalle_ventas`
- `facturas`
- `detalle_facturas`
- `pqr`
- `conversaciones`
- `mensajes`
- u otras que sean necesarias según el proyecto.

### FastAPI

Las nuevas funcionalidades deberán contar con endpoints, modelos y esquemas correspondientes. Se deberá mantener la separación entre modelos de base de datos y esquemas de validación.

### React + Vite

Las nuevas funcionalidades deberán integrarse mediante componentes reutilizables y mantener la estructura visual desarrollada durante los avances anteriores.

### Seguridad

- JWT.
- Control de roles.
- Protección de endpoints.
- Hashing de contraseñas.
- Variables de entorno.
- Protección de claves y credenciales.

### Pruebas

El aprendiz deberá probar los nuevos endpoints mediante Postman o una herramienta equivalente. Deberán presentarse evidencias de las solicitudes y respuestas correspondientes.

## Entregables del quinto avance

- Proyecto completo actualizado.
- Frontend React + Vite.
- Backend FastAPI.
- Base de datos SQL actualizada.
- Script SQL actualizado.
- Nuevas tablas y relaciones.
- Módulo de ventas.
- Historial de ventas.
- Reporte diario de ventas.
- Reporte en PDF.
- Reporte en Excel.
- Módulo de facturación.
- Facturas de venta.
- Dashboard administrativo.
- Dashboard de ventas.
- Dashboards diferenciados por roles.
- Gráficos de barras.
- Gráficos lineales.
- Cards de indicadores.
- Módulo de PQR.
- Chatbot integrado al sitio web.
- Integración del Chatbot con Inteligencia Artificial.
- Configuración segura de la API Key mediante variables de entorno.
- Nuevos endpoints desarrollados en FastAPI.
- Pruebas mediante Postman.
- Despliegue del proyecto.
- URL pública de la aplicación.
- Evidencias del funcionamiento en producción.
- Evidencias de los reportes.
- Evidencias de las facturas.
- Evidencias de los Dashboards.
- Evidencias del Chatbot.
- Evidencias de la integración con IA.
- Código fuente organizado.
- Documentación técnica de las nuevas funcionalidades.

## Evidencias requeridas

- Registro de una venta.
- Consulta del historial de ventas.
- Generación del reporte diario.
- Exportación a PDF.
- Exportación a Excel.
- Generación de una factura.
- Consulta de una factura.
- Dashboard administrativo.
- Dashboard de empleado, cuando corresponda.
- Dashboard de cliente, cuando corresponda.
- Gráficos de barras.
- Gráficos lineales.
- Cards de indicadores.
- Registro de una PQR.
- Gestión de una PQR.
- Funcionamiento del Chatbot.
- Conversación con el chatbot mediante IA.
- Configuración de variables de entorno, sin exponer las claves.
- Pruebas de los nuevos endpoints mediante Postman.
- Aplicación desplegada.
- URL pública funcionando correctamente.

## Resultado esperado

Al finalizar el quinto avance, el aprendiz deberá contar con una aplicación web Full Stack funcional y desplegada, construida sobre la arquitectura:

`React + Vite → FastAPI → Base de Datos SQL`

La aplicación deberá demostrar la evolución progresiva del proyecto desarrollado durante los avances anteriores, incorporando nuevas capacidades orientadas a la gestión comercial, generación de reportes, facturación, análisis visual de información, gestión de PQR, atención mediante chatbot, integración de Inteligencia Artificial y despliegue en la nube.

El proyecto deberá permitir registrar y consultar ventas de productos y servicios, generar reportes diarios en PDF y Excel, emitir facturas, visualizar información mediante Dashboards diferenciados por roles y atender consultas de los clientes mediante un Chatbot integrado con un servicio de Inteligencia Artificial.

Finalmente, el aprendiz deberá demostrar que la solución puede ejecutarse en un entorno de producción, manteniendo buenas prácticas de seguridad, especialmente en el manejo de credenciales, variables de entorno y claves de acceso a servicios externos.

## Recomendaciones para la presentación

- Conservar la estructura y funcionalidades desarrolladas en los avances anteriores.
- Evitar exponer contraseñas, tokens, API Keys o credenciales en capturas, repositorios o documentos públicos.
- Presentar evidencias claras y organizadas de cada requerimiento.
- Verificar que el Frontend, Backend y base de datos funcionen correctamente de manera integrada.
- Comprobar que los Dashboards obtengan información real desde FastAPI y la base de datos.
- Probar las funcionalidades tanto en entorno local como en el entorno desplegado.
- Documentar los endpoints nuevos y sus respectivas pruebas.
- Presentar la URL pública del proyecto desplegado.
- Explicar durante la sustentación el flujo de información entre React, FastAPI, SQL, el sistema de reportes y el Chatbot con IA.
