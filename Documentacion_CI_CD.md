# Reporte de Configuración CI/CD - Proyecto CONIITI

Este documento detalla los pasos y configuraciones que implementamos en equipo para asegurar que nadie pueda subir código "sucio" o roto a nuestra rama principal, cumpliendo con los requisitos de la entrega.

## 1. Protección de la Rama Principal (Branch Protection)

Para mantener nuestro código completamente a salvo, creamos una nueva rama de trabajo llamada **`desarrollo-rediseño-david`**. La regla a partir de ahora es clara: **está prohibido hacer push directo a `main`**. Absolutamente todos los cambios deben pasar primero por nuestra nueva rama de desarrollo y aprobar revisiones.

Para forzar esta regla en GitHub, configuramos las protecciones desde el panel de control del repositorio:
1. Entramos a la pestaña **Settings** > **Branches**.
2. Seleccionamos las reglas de protección para la rama `main` y activamos la casilla **"Require a pull request before merging"** (Exigir un PR).
3. Además, activamos la opción **"Require status checks to pass before merging"** para que GitHub bloquee cualquier mezcla de código si este no pasa primero nuestras validaciones automáticas.

## 2. El Pipeline Automatizado (Nuestro Archivo `.yml`)

Para automatizar la verificación de calidad, creamos el archivo `.github/workflows/ci.yml`. Este pipeline funciona como nuestro "robot revisor" que verifica el código antes de aceptar cualquier Pull Request mediante 3 filtros obligatorios:

1. **Linting estricto**: Configuramos ESLint para que analice que todo el código esté completamente limpio y estructurado. Si a alguien del grupo se le pasa un punto y coma mal puesto o deja alguna variable creada sin utilizar, el robot rechaza los cambios y mata el proceso inmediatamente.
2. **Pruebas Unitarias**: Implementamos una prueba automatizada utilizando **Vitest** en el archivo `Register.test.tsx`. El robot tiene la tarea específica de renderizar nuestra aplicación y confirmar que el componente **"Botón de Registro"** del CONIITI realmente exista en pantalla y tenga su texto correcto ("Registrarse"). Si alguien borra o daña este botón, la prueba falla y se detiene todo.
3. **Build Estricto**: Por último, el pipeline intenta compilar todo el proyecto para producción (`CI=true npm run build`). Si durante la construcción del proyecto se generan advertencias de compilación por TypeScript, alertas pesadas de CSS o imágenes inadecuadas, el pipeline se pone en rojo y el Action falla.

## 3. Demostración y Evidencias de nuestro Pull Request

Como constancia de nuestro trabajo exitoso, abrimos un **Pull Request** intentando pasar nuestros cambios desde `desarrollo-rediseño-david` hacia `main`. 

Acompañando a esta entrega, adjuntamos nuestras capturas donde demostramos el bloqueo y posterior éxito de nuestro "robot":
* **Pantallazo Evidencia 1**: Mostramos el Pull Request recién abierto, donde GitHub nos inhabilita el botón de "Merge Pull Request", demostrando que el robot está trabajando y no deja subir el código hasta comprobar que no esté sucio.
* **Pantallazo Evidencia 2**: El historial final del panel de Actions donde se ven claramente nuestros 3 pasos de control (**Linting, Pruebas Unitarias / Test, y Build Estricto**) todos en verde, comprobando que nuestra prueba evaluó el botón exitosamente y nuestro código es totalmente seguro.
