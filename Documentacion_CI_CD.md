# Documentación de CI/CD para CONIITI

## 1. Branch Protection y Reglas de la Rama Principal

Se he creado/configurado la rama **`desarrollo-rediseño-david`**. A partir de ahora, todo el desarrollo debe realizarse en esta rama y **está prohibido hacer push directo a la rama `main`**.

Para asegurar esto en GitHub (ya que requiere permisos de administrador del repositorio), deben hacer lo siguiente:
1. Vayan a su repositorio en GitHub > **Settings** > **Branches**.
2. Hagan clic en **Add branch protection rule** o seleccionen la rama `main`.
3. Marquen la opción **Require a pull request before merging**.
4. Marquen la opción **Require status checks to pass before merging** y seleccionen los checks que deben pasar obligatoriamente (Linting, Pruebas Unitarias, Build).

## 2. Configuración de Calidad en el Pipeline (`.github/workflows/ci.yml`)

Hemos creado una configuración de GitHub Actions (`ci.yml`) que garantiza la calidad antes de aceptar cualquier código. El archivo realiza tres verificaciones principales:

1. **Linting (`npm run lint`)**: Usando ESLint super estricto, el robot revisará que no existan variables sin utilizar ni puntos y comas omitidos. Si falla, se interrumpe y mata el proceso.
2. **Pruebas Unitarias (`npm run test`)**: Se utiliza **Vitest** y **React Testing Library**. Se ha creado una prueba automatizada en `frontend/vite-project/src/Register.test.tsx` que renderiza el botón de Registro y confirma que exista con el texto **"Registrarse"** de CONIITI. Si algo rompe esa renderización, los tests fallan bloqueando todo.
3. **Build Estricto (`npm run build`)**: Se ejecuta mediante `CI=true npm run build`. Si hay alertas o errores graves tanto de TypeScript o CSS, se paraliza el paso a producción.

## 3. Elaborando su Entrega del Pull Request

Para entregar la pantalla al profesor y cumplir los requisitos, sigan estos pasos:

1. Suban todo este código mediante git a la rama `desarrollo-rediseño-david`:
   ```bash
   git add .
   git commit -m "Configurar CI/CD: Lint, Tests y Build de CONIITI"
   git checkout -b desarrollo-rediseño-david
   git push origin desarrollo-rediseño-david
   ```
2. En GitHub pulsen el botón **"Compare & pull request"** para intentar pasar su código hacia `main`.
3. **Tomen un Pantallazo / Evidencia 1**: Mostrando la validación del Pull Request donde GitHub **no permite darle al botón "Merge"** indicando que existen comprobaciones en progreso (o que fallaron y deben solucionarlas).
4. El robot de GitHub Actions ejecutará los Jobs. Cuando finalice y pasen de forma exitosa, las tres verificaciones se pondrán verdes.
5. **Tomen un Pantallazo / Evidencia 2**: Mostrando la pestaña "Actions" (o la sección inferior del PR) donde quede claro que los 3 pasos ("Linting", "Pruebas Unitarias", y "Build Estricto") están en verde.

Este documento y los cambios están listos para ser subidos.
