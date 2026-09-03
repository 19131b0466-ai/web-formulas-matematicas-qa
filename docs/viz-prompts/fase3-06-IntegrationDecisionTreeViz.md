# Prompt de desarrollo — `IntegrationDecisionTreeViz`

**Sección del curso:** §17.1 — Guía para elegir un método de integración  
**Fase:** 3 (Técnicas y aplicaciones)  
**Componente:** `apps/web-public/components/calculo/viz/IntegrationDecisionTreeViz.tsx`

---

## Contexto

Árbol de decisión interactivo (diagrama de flujo) que guía al estudiante hacia la técnica de integración apropiada según la forma del integrando. No es una gráfica cartesiana — es un diagrama de proceso navegable.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline (para el árbol), controles de `./controls`, variables CSS para temas.

---

## Estructura del árbol de decisión

```
¿Es inmediata (tabla básica)?
├── SÍ → Aplicar fórmula directa (§2.2)
└── NO
    ¿Hay u = g(x) con g'(x) visible?
    ├── SÍ → Sustitución u (§4)
    └── NO
        ¿Es un producto de dos tipos de funciones distintas?
        ├── SÍ → Integración por partes (§5)  [sugerencia LIATE]
        └── NO
            ¿Contiene potencias de sen/cos?
            ├── SÍ → Integrales trigonométricas (§6)
            └── NO
                ¿Contiene √(a²±x²) o √(x²−a²)?
                ├── SÍ → Sustitución trigonométrica (§7)
                └── NO
                    ¿Es una fracción polinomial (racional)?
                    ├── SÍ → Fracciones parciales (§8)
                    └── NO → Integración numérica / combinación de métodos (§11)
```

### Interacción
- Al cargar, el árbol muestra solo el nodo raíz
- El usuario hace clic en "SÍ" o "NO" en cada nodo y el árbol se expande animadamente
- El camino recorrido se resalta en color `--accent-strong`
- Al llegar a un nodo hoja (técnica final), se muestra:
  - Nombre de la técnica
  - Fórmula clave (en texto, sin KaTeX externo — usar Unicode/texto plano)
  - Enlace textual: "Ver sección §X.X del formulario"
  - Ejemplo representativo del tipo de integral

### Botón "Reiniciar"
Vuelve al nodo raíz con animación de colapso.

### Botón "Ver árbol completo"
Toggle que despliega todos los nodos simultáneamente (vista general sin interacción).

---

## Diseño visual del árbol

```
Nodos de pregunta: rectángulos redondeados, fondo --formula-bg, borde --border
Nodos hoja (técnica): rectángulos con fondo --accent-strong semitransparente
Aristas: líneas SVG con etiquetas "SÍ" (verde) y "NO" (rojo/naranja)
Nodo activo: borde más grueso + sombra ligera
Camino recorrido: aristas resaltadas en --accent-strong
```

---

## Estructura de datos del árbol

```typescript
type TreeNode = {
  id: string;
  question?: string;       // Si es nodo de pregunta
  technique?: string;      // Si es nodo hoja
  section?: string;        // e.g. "§4"
  formula?: string;        // Fórmula clave en texto plano
  example?: string;        // e.g. "∫ x·cos(x²) dx"
  yes?: string;            // id del nodo hijo "SÍ"
  no?: string;             // id del nodo hijo "NO"
};
```

---

## Especificaciones SVG

El árbol se dibuja con SVG dinámico:
```
Ancho total: 100% del contenedor (máx. 700px)
Alto: calculado según la profundidad del árbol visible
Nodos: 160px × 50px
Espacio horizontal entre hermanos: 20px
Espacio vertical entre niveles: 70px
```

Usar `foreignObject` para el texto dentro de los nodos si es necesario (para mejor wrapping), o calcular la posición del texto manualmente.

---

## Texto educativo

> **Idea clave:** No existe una técnica universal. La clave es reconocer la *forma* del integrando. Este árbol sistematiza las preguntas que un matemático hace (conscientemente o no) al enfrentar una integral.

> Practica con ejemplos concretos: dado `∫ x²·e^x dx`, ¿qué responderías a cada pregunta del árbol?

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/IntegrationDecisionTreeViz.tsx
```

Exportar como `export function IntegrationDecisionTreeViz()`.
