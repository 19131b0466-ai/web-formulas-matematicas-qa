#!/usr/bin/env python3
"""Generate calculo-diferencial-locale-phrases.json from EN baseline + locale tables."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "scripts" / "calculo-diferencial-locale-phrases.json"

# Spanish key -> {de, fr, it, pt}
TRANSLATIONS: dict[str, dict[str, str]] = {
    # --- Variable meanings ---
    "Variable independiente": {
        "de": "Unabhängige Variable",
        "fr": "Variable indépendante",
        "it": "Variabile indipendente",
        "pt": "Variável independente",
    },
    "Tiempo (interpretación física)": {
        "de": "Zeit (physikalische Interpretation)",
        "fr": "Temps (interprétation physique)",
        "it": "Tempo (interpretazione fisica)",
        "pt": "Tempo (interpretação física)",
    },
    "Posición o longitud de arco": {
        "de": "Position oder Bogenlänge",
        "fr": "Position ou longueur d'arc",
        "it": "Posizione o lunghezza d'arco",
        "pt": "Posição ou comprimento de arco",
    },
    "Velocidad o función auxiliar": {
        "de": "Geschwindigkeit oder Hilfsfunktion",
        "fr": "Vitesse ou fonction auxiliaire",
        "it": "Velocità o funzione ausiliaria",
        "pt": "Velocidade ou função auxiliar",
    },
    "Punto o constante real": {
        "de": "Punkt oder reelle Konstante",
        "fr": "Point ou constante réelle",
        "it": "Punto o costante reale",
        "pt": "Ponto ou constante real",
    },
    "Extremo de intervalo o constante": {
        "de": "Intervallendpunkt oder Konstante",
        "fr": "Extrémité d'intervalle ou constante",
        "it": "Estremo di intervallo o costante",
        "pt": "Extremo de intervalo ou constante",
    },
    "Punto intermedio (TVM, Rolle)": {
        "de": "Zwischenpunkt (MWS, Rolle)",
        "fr": "Point intermédiaire (TAF, Rolle)",
        "it": "Punto intermedio (TVM, Rolle)",
        "pt": "Ponto intermediário (TVM, Rolle)",
    },
    "Incremento en la definición de derivada": {
        "de": "Inkrement in der Ableitungsdefinition",
        "fr": "Accroissement dans la définition de la dérivée",
        "it": "Incremento nella definizione di derivata",
        "pt": "Incremento na definição de derivada",
    },
    "Función": {
        "de": "Funktion",
        "fr": "Fonction",
        "it": "Funzione",
        "pt": "Função",
    },
    "Segunda función o composición interna": {
        "de": "Zweite Funktion oder innere Verkettung",
        "fr": "Deuxième fonction ou composition interne",
        "it": "Seconda funzione o composizione interna",
        "pt": "Segunda função ou composição interna",
    },
    "Derivada de \\(f\\)": {
        "de": "Ableitung von \\(f\\)",
        "fr": "Dérivée de \\(f\\)",
        "it": "Derivata di \\(f\\)",
        "pt": "Derivada de \\(f\\)",
    },
    "Segunda derivada de \\(f\\)": {
        "de": "Zweite Ableitung von \\(f\\)",
        "fr": "Dérivée seconde de \\(f\\)",
        "it": "Derivata seconda di \\(f\\)",
        "pt": "Segunda derivada de \\(f\\)",
    },
    "Orden de derivada o exponente": {
        "de": "Ableitungsordnung oder Exponent",
        "fr": "Ordre de dérivation ou exposant",
        "it": "Ordine di derivazione o esponente",
        "pt": "Ordem de derivação ou expoente",
    },
    "Constante real": {
        "de": "Reelle Konstante",
        "fr": "Constante réelle",
        "it": "Costante reale",
        "pt": "Constante real",
    },
    "Radio en definición ε-δ": {
        "de": "Radius in der ε-δ-Definition",
        "fr": "Rayon dans la définition ε-δ",
        "it": "Raggio nella definizione ε-δ",
        "pt": "Raio na definição ε-δ",
    },
    "Tolerancia en definición ε-δ": {
        "de": "Toleranz in der ε-δ-Definition",
        "fr": "Tolérance dans la définition ε-δ",
        "it": "Tolleranza nella definizione ε-δ",
        "pt": "Tolerância na definição ε-δ",
    },
    "Valor del límite": {
        "de": "Grenzwert",
        "fr": "Valeur de la limite",
        "it": "Valore del limite",
        "pt": "Valor do limite",
    },
    "Variable auxiliar (cadena, sustitución)": {
        "de": "Hilfsvariable (Kette, Substitution)",
        "fr": "Variable auxiliaire (chaîne, substitution)",
        "it": "Variabile ausiliaria (catena, sostituzione)",
        "pt": "Variável auxiliar (cadeia, substituição)",
    },
    "Variable dependiente": {
        "de": "Abhängige Variable",
        "fr": "Variable dépendante",
        "it": "Variabile dipendente",
        "pt": "Variável dependente",
    },
    "Diferencial de \\(y\\)": {
        "de": "Differential von \\(y\\)",
        "fr": "Différentielle de \\(y\\)",
        "it": "Differenziale di \\(y\\)",
        "pt": "Diferencial de \\(y\\)",
    },
    "Diferencial de \\(x\\)": {
        "de": "Differential von \\(x\\)",
        "fr": "Différentielle de \\(x\\)",
        "it": "Differenziale di \\(x\\)",
        "pt": "Diferencial de \\(x\\)",
    },
    "Diferencial de \\(u\\)": {
        "de": "Differential von \\(u\\)",
        "fr": "Différentielle de \\(u\\)",
        "it": "Differenziale di \\(u\\)",
        "pt": "Diferencial de \\(u\\)",
    },
    "Ángulo o parámetro": {
        "de": "Winkel oder Parameter",
        "fr": "Angle ou paramètre",
        "it": "Angolo o parametro",
        "pt": "Ângulo ou parâmetro",
    },
    "Constante pi": {
        "de": "Kreiszahl π",
        "fr": "Constante pi",
        "it": "Costante pi greco",
        "pt": "Constante pi",
    },
    "Base del logaritmo natural": {
        "de": "Basis des natürlichen Logarithmus",
        "fr": "Base du logarithme naturel",
        "it": "Base del logaritmo naturale",
        "pt": "Base do logaritmo natural",
    },
    "Logaritmo natural": {
        "de": "Natürlicher Logarithmus",
        "fr": "Logarithme naturel",
        "it": "Logaritmo naturale",
        "pt": "Logaritmo natural",
    },
    # --- FAQ ---
    "¿Qué mide la derivada en un punto?": {
        "de": "Was misst die Ableitung in einem Punkt?",
        "fr": "Que mesure la dérivée en un point ?",
        "it": "Cosa misura la derivata in un punto?",
        "pt": "O que mede a derivada em um ponto?",
    },
    "La derivada \\(f'(a)\\) es la pendiente de la recta tangente a la gráfica de \\(f\\) en \\(x=a\\), y también el límite del cociente incremental cuando \\(h\\to0\\).": {
        "de": "Die Ableitung \\(f'(a)\\) ist die Steigung der Tangente an den Graphen von \\(f\\) bei \\(x=a\\) und auch der Grenzwert des Differenzenquotienten für \\(h\\to0\\).",
        "fr": "La dérivée \\(f'(a)\\) est la pente de la tangente au graphe de \\(f\\) en \\(x=a\\), et aussi la limite du taux d'accroissement lorsque \\(h\\to0\\).",
        "it": "La derivata \\(f'(a)\\) è la pendenza della retta tangente al grafico di \\(f\\) in \\(x=a\\), e anche il limite del rapporto incrementale quando \\(h\\to0\\).",
        "pt": "A derivada \\(f'(a)\\) é a inclinação da reta tangente ao gráfico de \\(f\\) em \\(x=a\\), e também o limite do quociente incremental quando \\(h\\to0\\).",
    },
    "¿Toda función derivable es continua?": {
        "de": "Ist jede differenzierbare Funktion stetig?",
        "fr": "Toute fonction dérivable est-elle continue ?",
        "it": "Ogni funzione derivabile è continua?",
        "pt": "Toda função derivável é contínua?",
    },
    "Sí: si \\(f\\) es derivable en \\(a\\), entonces \\(f\\) es continua en \\(a\\). El recíproco no siempre vale (p. ej. \\(|x|\\) en \\(0\\)).": {
        "de": "Ja: ist \\(f\\) in \\(a\\) differenzierbar, so ist \\(f\\) in \\(a\\) stetig. Die Umkehrung gilt nicht immer (z. B. \\(|x|\\) in \\(0\\)).",
        "fr": "Oui : si \\(f\\) est dérivable en \\(a\\), alors \\(f\\) est continue en \\(a\\). La réciproque n'est pas toujours vraie (p. ex. \\(|x|\\) en \\(0\\)).",
        "it": "Sì: se \\(f\\) è derivabile in \\(a\\), allora \\(f\\) è continua in \\(a\\). Il reciproco non vale sempre (es. \\(|x|\\) in \\(0\\)).",
        "pt": "Sim: se \\(f\\) é derivável em \\(a\\), então \\(f\\) é contínua em \\(a\\). O recíproco não vale sempre (p. ex. \\(|x|\\) em \\(0\\)).",
    },
    "¿Cuándo uso la regla de la cadena?": {
        "de": "Wann verwende ich die Kettenregel?",
        "fr": "Quand utiliser la règle de la chaîne ?",
        "it": "Quando uso la regola della catena?",
        "pt": "Quando uso a regra da cadeia?",
    },
    "Cuando derivas una composición \\(f(g(x))\\): la derivada es \\(f'(g(x))\\cdot g'(x)\\). También en notación Leibniz: \\(dy/dx=(dy/du)(du/dx)\\).": {
        "de": "Beim Ableiten einer Verkettung \\(f(g(x))\\): die Ableitung ist \\(f'(g(x))\\cdot g'(x)\\). Auch in Leibniz-Notation: \\(dy/dx=(dy/du)(du/dx)\\).",
        "fr": "Lors de la dérivation d'une composition \\(f(g(x))\\) : la dérivée est \\(f'(g(x))\\cdot g'(x)\\). Aussi en notation de Leibniz : \\(dy/dx=(dy/du)(du/dx)\\).",
        "it": "Derivando una composizione \\(f(g(x))\\): la derivata è \\(f'(g(x))\\cdot g'(x)\\). Anche in notazione di Leibniz: \\(dy/dx=(dy/du)(du/dx)\\).",
        "pt": "Ao derivar uma composição \\(f(g(x))\\): a derivada é \\(f'(g(x))\\cdot g'(x)\\). Também em notação de Leibniz: \\(dy/dx=(dy/du)(du/dx)\\).",
    },
    "¿Cuándo puedo aplicar L'Hôpital?": {
        "de": "Wann kann ich die Regel von L'Hôpital anwenden?",
        "fr": "Quand puis-je appliquer la règle de L'Hôpital ?",
        "it": "Quando posso applicare la regola di L'Hôpital?",
        "pt": "Quando posso aplicar a regra de L'Hôpital?",
    },
    "Cuando el límite tiene forma indeterminada \\(0/0\\) o \\(\\infty/\\infty\\), las funciones son derivables cerca del punto y \\(g'\\neq0\\) en una vecindad (salvo quizá el punto).": {
        "de": "Wenn der Grenzwert die unbestimmte Form \\(0/0\\) oder \\(\\infty/\\infty\\) hat, die Funktionen in der Nähe des Punkts differenzierbar sind und \\(g'\\neq0\\) in einer Umgebung gilt (außer evtl. am Punkt).",
        "fr": "Lorsque la limite a la forme indéterminée \\(0/0\\) ou \\(\\infty/\\infty\\), les fonctions sont dérivables près du point et \\(g'\\neq0\\) dans un voisinage (sauf peut-être au point).",
        "it": "Quando il limite ha forma indeterminata \\(0/0\\) o \\(\\infty/\\infty\\), le funzioni sono derivabili vicino al punto e \\(g'\\neq0\\) in un intorno (tranne forse nel punto).",
        "pt": "Quando o limite tem forma indeterminada \\(0/0\\) ou \\(\\infty/\\infty\\), as funções são deriváveis perto do ponto e \\(g'\\neq0\\) numa vizinhança (exceto talvez no ponto).",
    },
    "¿Para qué sirve el polinomio de Taylor?": {
        "de": "Wozu dient das Taylor-Polynom?",
        "fr": "À quoi sert le polynôme de Taylor ?",
        "it": "A cosa serve il polinomio di Taylor?",
        "pt": "Para que serve o polinômio de Taylor?",
    },
    "Aproxima \\(f(x)\\) cerca de \\(a\\) con un polinomio cuyos coeficientes dependen de las derivadas de \\(f\\) en \\(a\\). Es la base de series de potencias en Cálculo II.": {
        "de": "Es approximiert \\(f(x)\\) nahe \\(a\\) durch ein Polynom, dessen Koeffizienten von den Ableitungen von \\(f\\) in \\(a\\) abhängen. Grundlage von Potenzreihen in Analysis II.",
        "fr": "Il approche \\(f(x)\\) près de \\(a\\) par un polynôme dont les coefficients dépendent des dérivées de \\(f\\) en \\(a\\). Base des séries entières en Calcul II.",
        "it": "Approssima \\(f(x)\\) vicino a \\(a\\) con un polinomio i cui coefficienti dipendono dalle derivate di \\(f\\) in \\(a\\). Base delle serie di potenze in Calcolo II.",
        "pt": "Aproxima \\(f(x)\\) perto de \\(a\\) com um polinômio cujos coeficientes dependem das derivadas de \\(f\\) em \\(a\\). Base das séries de potências em Cálculo II.",
    },
    # --- Guide §16 strategies ---
    "Polinomio o potencia \\(x^n\\)": {
        "de": "Polynom oder Potenz \\(x^n\\)",
        "fr": "Polynôme ou puissance \\(x^n\\)",
        "it": "Polinomio o potenza \\(x^n\\)",
        "pt": "Polinômio ou potência \\(x^n\\)",
    },
    "Regla de la potencia": {
        "de": "Potenzregel",
        "fr": "Règle de la puissance",
        "it": "Regola della potenza",
        "pt": "Regra da potência",
    },
    "Producto de funciones": {
        "de": "Produkt von Funktionen",
        "fr": "Produit de fonctions",
        "it": "Prodotto di funzioni",
        "pt": "Produto de funções",
    },
    "Regla del producto": {
        "de": "Produktregel",
        "fr": "Règle du produit",
        "it": "Regola del prodotto",
        "pt": "Regra do produto",
    },
    "Cociente": {
        "de": "Quotient",
        "fr": "Quotient",
        "it": "Quoziente",
        "pt": "Quociente",
    },
    "Regla del cociente": {
        "de": "Quotientenregel",
        "fr": "Règle du quotient",
        "it": "Regola del quoziente",
        "pt": "Regra do quociente",
    },
    "Composición \\(f(g(x))\\)": {
        "de": "Verkettung \\(f(g(x))\\)",
        "fr": "Composition \\(f(g(x))\\)",
        "it": "Composizione \\(f(g(x))\\)",
        "pt": "Composição \\(f(g(x))\\)",
    },
    "Regla de la cadena": {
        "de": "Kettenregel",
        "fr": "Règle de la chaîne",
        "it": "Regola della catena",
        "pt": "Regra da cadeia",
    },
    "\\(f^g\\) con exponente variable": {
        "de": "\\(f^g\\) mit variablem Exponenten",
        "fr": "\\(f^g\\) avec exposant variable",
        "it": "\\(f^g\\) con esponente variabile",
        "pt": "\\(f^g\\) com expoente variável",
    },
    "Logaritmica": {
        "de": "Logarithmische Differentiation",
        "fr": "Différentiation logarithmique",
        "it": "Derivazione logaritmica",
        "pt": "Derivação logarítmica",
    },
    "Ecuación implícita \\(F(x,y)=0\\)": {
        "de": "Implizite Gleichung \\(F(x,y)=0\\)",
        "fr": "Équation implicite \\(F(x,y)=0\\)",
        "it": "Equazione implicita \\(F(x,y)=0\\)",
        "pt": "Equação implícita \\(F(x,y)=0\\)",
    },
    "Derivación implícita": {
        "de": "Implizite Differentiation",
        "fr": "Dérivation implicite",
        "it": "Derivazione implicita",
        "pt": "Derivação implícita",
    },
    "Límite \\(0/0\\) o \\(\\infty/\\infty\\)": {
        "de": "Grenzwert \\(0/0\\) oder \\(\\infty/\\infty\\)",
        "fr": "Limite \\(0/0\\) ou \\(\\infty/\\infty\\)",
        "it": "Limite \\(0/0\\) o \\(\\infty/\\infty\\)",
        "pt": "Limite \\(0/0\\) ou \\(\\infty/\\infty\\)",
    },
    "L'Hôpital o álgebra": {
        "de": "L'Hôpital oder Algebra",
        "fr": "L'Hôpital ou algèbre",
        "it": "L'Hôpital o algebra",
        "pt": "L'Hôpital ou álgebra",
    },
    "Optimizar en \\([a,b]\\)": {
        "de": "Optimieren auf \\([a,b]\\)",
        "fr": "Optimiser sur \\([a,b]\\)",
        "it": "Ottimizzare su \\([a,b]\\)",
        "pt": "Otimizar em \\([a,b]\\)",
    },
    "Críticos + extremos del intervalo": {
        "de": "Kritische Punkte + Intervallendpunkte",
        "fr": "Points critiques + extrémités de l'intervalle",
        "it": "Punti critici + estremi dell'intervallo",
        "pt": "Críticos + extremos do intervalo",
    },
    "Aproximar cerca de \\(a\\)": {
        "de": "Näherung nahe \\(a\\)",
        "fr": "Approcher près de \\(a\\)",
        "it": "Approssimare vicino a \\(a\\)",
        "pt": "Aproximar perto de \\(a\\)",
    },
    "Linealización o Taylor": {
        "de": "Linearisierung oder Taylor",
        "fr": "Linéarisation ou Taylor",
        "it": "Linearizzazione o Taylor",
        "pt": "Linearização ou Taylor",
    },
    "Dominio y simetrías.": {
        "de": "Definitionsbereich und Symmetrien.",
        "fr": "Domaine et symétries.",
        "it": "Dominio e simmetrie.",
        "pt": "Domínio e simetrias.",
    },
    "Intersecciones con ejes.": {
        "de": "Schnittpunkte mit den Achsen.",
        "fr": "Intersections avec les axes.",
        "it": "Intersezioni con gli assi.",
        "pt": "Interseções com os eixos.",
    },
    "Asíntotas verticales, horizontales y oblicuas.": {
        "de": "Vertikale, horizontale und schräge Asymptoten.",
        "fr": "Asymptotes verticales, horizontales et obliques.",
        "it": "Asintoti verticali, orizzontali e obliqui.",
        "pt": "Assíntotas verticais, horizontais e oblíquas.",
    },
    "f': intervalos de crecimiento/decrecimiento y puntos críticos.": {
        "de": "f': Intervalle von Zunahme/Abnahme und kritische Punkte.",
        "fr": "f' : intervalles de croissance/décroissance et points critiques.",
        "it": "f': intervalli di crescita/decrescita e punti critici.",
        "pt": "f': intervalos de crescimento/decrescimento e pontos críticos.",
    },
    "f'': concavidad y puntos de inflexión.": {
        "de": "f'': Konkavität und Wendepunkte.",
        "fr": "f'' : concavité et points d'inflexion.",
        "it": "f'': concavità e punti di flesso.",
        "pt": "f'': concavidade e pontos de inflexão.",
    },
    "Tabla de signos y esquema final.": {
        "de": "Vorzeichentabelle und endgültiger Skizze.",
        "fr": "Tableau de signes et schéma final.",
        "it": "Tabella dei segni e schema finale.",
        "pt": "Tabela de sinais e esquema final.",
    },
    "Guía para derivar y analizar": {
        "de": "Leitfaden zum Ableiten und Analysieren",
        "fr": "Guide pour dériver et analyser",
        "it": "Guida per derivare e analizzare",
        "pt": "Guia para derivar e analisar",
    },
    "> **Regla de uso:** aplicar solo donde las expresiones estén definidas; denominadores distintos de cero.": {
        "de": "> **Verwendungsregel:** nur anwenden, wo die Ausdrücke definiert sind; Nenner ungleich null.",
        "fr": "> **Règle d'usage :** appliquer seulement où les expressions sont définies ; dénominateurs non nuls.",
        "it": "> **Regola d'uso:** applicare solo dove le espressioni sono definite; denominatori diversi da zero.",
        "pt": "> **Regra de uso:** aplicar apenas onde as expressões estão definidas; denominadores diferentes de zero.",
    },
    # --- Formula details ---
    "Aceleración instantánea.": {
        "de": "Momentane Beschleunigung.",
        "fr": "Accélération instantanée.",
        "it": "Accelerazione istantanea.",
        "pt": "Aceleração instantânea.",
    },
    "Aproximación del incremento para \\(\\Delta x\\) pequeño.": {
        "de": "Näherung des Zuwachses für kleines \\(\\Delta x\\).",
        "fr": "Approximation de l'accroissement pour \\(\\Delta x\\) petit.",
        "it": "Approssimazione dell'incremento per \\(\\Delta x\\) piccolo.",
        "pt": "Aproximação do incremento para \\(\\Delta x\\) pequeno.",
    },
    "Aproximación lineal clásica.": {
        "de": "Klassische lineare Näherung.",
        "fr": "Approximation linéaire classique.",
        "it": "Approssimazione lineare classica.",
        "pt": "Aproximação linear clássica.",
    },
    "Comportamiento de cocientes de polinomios cuando \\(x\\to\\infty\\).": {
        "de": "Verhalten von Polynomquotienten für \\(x\\to\\infty\\).",
        "fr": "Comportement des quotients de polynômes lorsque \\(x\\to\\infty\\).",
        "it": "Comportamento dei quozienti di polinomi quando \\(x\\to\\infty\\).",
        "pt": "Comportamento de quocientes de polinômios quando \\(x\\to\\infty\\).",
    },
    "Composición de funciones; requiere \\(x\\in\\operatorname{Dom}(g)\\) y \\(g(x)\\in\\operatorname{Dom}(f)\\).": {
        "de": "Funktionsverkettung; erfordert \\(x\\in\\operatorname{Dom}(g)\\) und \\(g(x)\\in\\operatorname{Dom}(f)\\).",
        "fr": "Composition de fonctions ; requiert \\(x\\in\\operatorname{Dom}(g)\\) et \\(g(x)\\in\\operatorname{Dom}(f)\\).",
        "it": "Composizione di funzioni; richiede \\(x\\in\\operatorname{Dom}(g)\\) e \\(g(x)\\in\\operatorname{Dom}(f)\\).",
        "pt": "Composição de funções; requer \\(x\\in\\operatorname{Dom}(g)\\) e \\(g(x)\\in\\operatorname{Dom}(f)\\).",
    },
    "Criterio de la primera derivada.": {
        "de": "Kriterium der ersten Ableitung.",
        "fr": "Critère de la première dérivée.",
        "it": "Criterio della prima derivata.",
        "pt": "Critério da primeira derivada.",
    },
    "Criterio de la segunda derivada (máximo).": {
        "de": "Kriterium der zweiten Ableitung (Maximum).",
        "fr": "Critère de la dérivée seconde (maximum).",
        "it": "Criterio della seconda derivata (massimo).",
        "pt": "Critério da segunda derivada (máximo).",
    },
    "Criterio de la segunda derivada (mínimo).": {
        "de": "Kriterium der zweiten Ableitung (Minimum).",
        "fr": "Critère de la dérivée seconde (minimum).",
        "it": "Criterio della seconda derivata (minimo).",
        "pt": "Critério da segunda derivada (mínimo).",
    },
    "Cuando el límite original es \\(0/0\\) o \\(\\infty/\\infty\\) y se cumplen las hipótesis.": {
        "de": "Wenn der ursprüngliche Grenzwert \\(0/0\\) oder \\(\\infty/\\infty\\) ist und die Voraussetzungen gelten.",
        "fr": "Lorsque la limite originale est \\(0/0\\) ou \\(\\infty/\\infty\\) et que les hypothèses sont satisfaites.",
        "it": "Quando il limite originale è \\(0/0\\) o \\(\\infty/\\infty\\) e le ipotesi sono soddisfatte.",
        "pt": "Quando o limite original é \\(0/0\\) ou \\(\\infty/\\infty\\) e as hipóteses se cumpram.",
    },
    "Cuando el límite original es \\(0/0\\) o \\(\\infty/\\infty\\) y se cumplen las hipótesis de derivabilidad.": {
        "de": "Wenn der ursprüngliche Grenzwert \\(0/0\\) oder \\(\\infty/\\infty\\) ist und die Differenzierbarkeitsvoraussetzungen gelten.",
        "fr": "Lorsque la limite originale est \\(0/0\\) ou \\(\\infty/\\infty\\) et que les hypothèses de dérivabilité sont satisfaites.",
        "it": "Quando il limite originale è \\(0/0\\) o \\(\\infty/\\infty\\) e le ipotesi di derivabilità sono soddisfatte.",
        "pt": "Quando o limite original é \\(0/0\\) ou \\(\\infty/\\infty\\) e as hipóteses de derivabilidade se cumpram.",
    },
    "Cálculo de pendiente e intercepto para asíntotas oblicuas.": {
        "de": "Berechnung von Steigung und Achsenabschnitt für schräge Asymptoten.",
        "fr": "Calcul de pente et d'ordonnée à l'origine pour asymptotes obliques.",
        "it": "Calcolo di pendenza e intercetta per asintoti obliqui.",
        "pt": "Cálculo de inclinação e intercepto para assíntotas oblíquas.",
    },
    "Cálculo de pendiente e intercepto para asíntotas oblicuas (aplicar por separado en \\(+\\infty\\) y \\(-\\infty\\)).": {
        "de": "Berechnung von Steigung und Achsenabschnitt für schräge Asymptoten (getrennt für \\(+\\infty\\) und \\(-\\infty\\)).",
        "fr": "Calcul de pente et d'ordonnée à l'origine pour asymptotes obliques (séparément en \\(+\\infty\\) et \\(-\\infty\\)).",
        "it": "Calcolo di pendenza e intercetta per asintoti obliqui (separatamente in \\(+\\infty\\) e \\(-\\infty\\)).",
        "pt": "Cálculo de inclinação e intercepto para assíntotas oblíquas (separadamente em \\(+\\infty\\) e \\(-\\infty\\)).",
    },
    "Definición de derivada por límite del cociente incremental.": {
        "de": "Definition der Ableitung als Grenzwert des Differenzenquotienten.",
        "fr": "Définition de la dérivée par limite du taux d'accroissement.",
        "it": "Definizione di derivata come limite del rapporto incrementale.",
        "pt": "Definição de derivada pelo limite do quociente incremental.",
    },
    "Definición formal de límite finito.": {
        "de": "Formale Definition eines endlichen Grenzwerts.",
        "fr": "Définition formelle d'une limite finie.",
        "it": "Definizione formale di limite finito.",
        "pt": "Definição formal de limite finito.",
    },
    "Definición por casos del valor absoluto.": {
        "de": "Fallweise Definition des Betrags.",
        "fr": "Définition par cas de la valeur absolue.",
        "it": "Definizione per casi del valore assoluto.",
        "pt": "Definição por casos do valor absoluto.",
    },
    "Descomposición función = aproximación + resto.": {
        "de": "Zerlegung: Funktion = Näherung + Rest.",
        "fr": "Décomposition : fonction = approximation + reste.",
        "it": "Scomposizione: funzione = approssimazione + resto.",
        "pt": "Decomposição: função = aproximação + resto.",
    },
    "Diferencial de \\(y=f(x)\\).": {
        "de": "Differential von \\(y=f(x)\\).",
        "fr": "Différentielle de \\(y=f(x)\\).",
        "it": "Differenziale di \\(y=f(x)\\).",
        "pt": "Diferencial de \\(y=f(x)\\).",
    },
    "Distancia en el plano.": {
        "de": "Abstand in der Ebene.",
        "fr": "Distance dans le plan.",
        "it": "Distanza nel piano.",
        "pt": "Distância no plano.",
    },
    "Dominio natural de una función real.": {
        "de": "Natürlicher Definitionsbereich einer reellen Funktion.",
        "fr": "Domaine naturel d'une fonction réelle.",
        "it": "Dominio naturale di una funzione reale.",
        "pt": "Domínio natural de uma função real.",
    },
    "Ecuación de la recta normal.": {
        "de": "Gleichung der Normalen.",
        "fr": "Équation de la normale.",
        "it": "Equazione della retta normale.",
        "pt": "Equação da reta normal.",
    },
    "Ecuación de la recta tangente a \\(y=f(x)\\) en \\(x=a\\).": {
        "de": "Gleichung der Tangente an \\(y=f(x)\\) in \\(x=a\\).",
        "fr": "Équation de la tangente à \\(y=f(x)\\) en \\(x=a\\).",
        "it": "Equazione della tangente a \\(y=f(x)\\) in \\(x=a\\).",
        "pt": "Equação da reta tangente a \\(y=f(x)\\) em \\(x=a\\).",
    },
    "Ejemplo tipo: cilindro de superficie fija y volumen máximo.": {
        "de": "Typisches Beispiel: Zylinder mit fester Oberfläche und maximalem Volumen.",
        "fr": "Exemple type : cylindre à surface fixe et volume maximal.",
        "it": "Esempio tipo: cilindro con superficie fissa e volume massimo.",
        "pt": "Exemplo tipo: cilindro com superfície fixa e volume máximo.",
    },
    "Ejemplo tipo: área máxima con perímetro fijo (rectángulo → cuadrado).": {
        "de": "Typisches Beispiel: maximale Fläche bei festem Umfang (Rechteck → Quadrat).",
        "fr": "Exemple type : aire maximale à périmètre fixe (rectangle → carré).",
        "it": "Esempio tipo: area massima con perimetro fisso (rettangolo → quadrato).",
        "pt": "Exemplo tipo: área máxima com perímetro fixo (retângulo → quadrado).",
    },
    "Ejemplo: circunferencia.": {
        "de": "Beispiel: Kreis.",
        "fr": "Exemple : cercle.",
        "it": "Esempio: circonferenza.",
        "pt": "Exemplo: circunferência.",
    },
    "El límite bilateral existe si y solo si coinciden los laterales.": {
        "de": "Der zweiseitige Grenzwert existiert genau dann, wenn die einseitigen Grenzwerte übereinstimmen.",
        "fr": "La limite bilatérale existe si et seulement si les limites latérales coïncident.",
        "it": "Il limite bilaterale esiste se e solo se coincidono i limiti laterali.",
        "pt": "O limite bilateral existe se e somente se os laterais coincidem.",
    },
    "El valor \\(f(x)\\) se acerca a \\(L\\) cuando \\(x\\) se acerca a \\(a\\) (sin exigir \\(f(a)=L\\)).": {
        "de": "\\(f(x)\\) nähert sich \\(L\\), wenn \\(x\\) sich \\(a\\) nähert (ohne \\(f(a)=L\\) zu fordern).",
        "fr": "\\(f(x)\\) s'approche de \\(L\\) lorsque \\(x\\) s'approche de \\(a\\) (sans exiger \\(f(a)=L\\)).",
        "it": "\\(f(x)\\) si avvicina a \\(L\\) quando \\(x\\) si avvicina a \\(a\\) (senza richiedere \\(f(a)=L\\)).",
        "pt": "\\(f(x)\\) se aproxima de \\(L\\) quando \\(x\\) se aproxima de \\(a\\) (sem exigir \\(f(a)=L\\)).",
    },
    "Entorno simétrico de radio \\(\\delta\\) alrededor de \\(a\\).": {
        "de": "Symmetrische Umgebung mit Radius \\(\\delta\\) um \\(a\\).",
        "fr": "Voisinage symétrique de rayon \\(\\delta\\) autour de \\(a\\).",
        "it": "Intorno simmetrico di raggio \\(\\delta\\) attorno a \\(a\\).",
        "pt": "Vizinhança simétrica de raio \\(\\delta\\) em torno de \\(a\\).",
    },
    "Esfera inflándose.": {
        "de": "Aufblasende Kugel.",
        "fr": "Sphère en expansion.",
        "it": "Sfera in espansione.",
        "pt": "Esfera inflando.",
    },
    "Extensión a tres factores.": {
        "de": "Erweiterung auf drei Faktoren.",
        "fr": "Extension à trois facteurs.",
        "it": "Estensione a tre fattori.",
        "pt": "Extensão a três fatores.",
    },
    "Forma equivalente del TVM.": {
        "de": "Äquivalente Form des MWS.",
        "fr": "Forme équivalente du TAF.",
        "it": "Forma equivalente del TVM.",
        "pt": "Forma equivalente do TVM.",
    },
    "Fórmula general; \\(F_x=\\partial F/\\partial x\\), \\(F_y=\\partial F/\\partial y\\).": {
        "de": "Allgemeine Formel; \\(F_x=\\partial F/\\partial x\\), \\(F_y=\\partial F/\\partial y\\).",
        "fr": "Formule générale ; \\(F_x=\\partial F/\\partial x\\), \\(F_y=\\partial F/\\partial y\\).",
        "it": "Formula generale; \\(F_x=\\partial F/\\partial x\\), \\(F_y=\\partial F/\\partial y\\).",
        "pt": "Fórmula geral; \\(F_x=\\partial F/\\partial x\\), \\(F_y=\\partial F/\\partial y\\).",
    },
    "Identidad pitagórica fundamental.": {
        "de": "Fundamentale pythagoreische Identität.",
        "fr": "Identité pythagoricienne fondamentale.",
        "it": "Identità pitagorica fondamentale.",
        "pt": "Identidade pitagórica fundamental.",
    },
    "Identidades de una función biyectiva y su inversa en sus dominios respectivos.": {
        "de": "Identitäten einer bijektiven Funktion und ihrer Umkehrfunktion auf den jeweiligen Definitionsbereichen.",
        "fr": "Identités d'une fonction bijective et de son inverse sur leurs domaines respectifs.",
        "it": "Identità di una funzione biettiva e della sua inversa sui rispettivi domini.",
        "pt": "Identidades de uma função bijetiva e sua inversa nos respectivos domínios.",
    },
    "Imagen o rango de la función.": {
        "de": "Bild oder Wertebereich der Funktion.",
        "fr": "Image ou ensemble des valeurs de la fonction.",
        "it": "Immagine o codominio della funzione.",
        "pt": "Imagem ou contradomínio da função.",
    },
    "Incremento verdadero de la función.": {
        "de": "Wahrer Funktionszuwachs.",
        "fr": "Accroissement réel de la fonction.",
        "it": "Incremento vero della funzione.",
        "pt": "Incremento verdadeiro da função.",
    },
    "Máximo absoluto en \\([a,b]\\) comparando críticos \\(c_i\\) y extremos.": {
        "de": "Absolutes Maximum auf \\([a,b]\\) durch Vergleich kritischer Punkte \\(c_i\\) und Endpunkte.",
        "fr": "Maximum absolu sur \\([a,b]\\) en comparant les points critiques \\(c_i\\) et les extrémités.",
        "it": "Massimo assoluto su \\([a,b]\\) confrontando punti critici \\(c_i\\) e estremi.",
        "pt": "Máximo absoluto em \\([a,b]\\) comparando críticos \\(c_i\\) e extremos.",
    },
    "Misma regla que DIF-114 en el límite al infinito; requiere forma \\(0/0\\) o \\(\\infty/\\infty\\).": {
        "de": "Gleiche Regel wie DIF-114 für Grenzwerte im Unendlichen; erfordert Form \\(0/0\\) oder \\(\\infty/\\infty\\).",
        "fr": "Même règle que DIF-114 à l'infini ; requiert la forme \\(0/0\\) ou \\(\\infty/\\infty\\).",
        "it": "Stessa regola di DIF-114 al limite all'infinito; richiede forma \\(0/0\\) o \\(\\infty/\\infty\\).",
        "pt": "Mesma regra que DIF-114 no limite ao infinito; requer forma \\(0/0\\) ou \\(\\infty/\\infty\\).",
    },
    "Notación de Leibniz para composición.": {
        "de": "Leibniz-Notation für Verkettungen.",
        "fr": "Notation de Leibniz pour la composition.",
        "it": "Notazione di Leibniz per la composizione.",
        "pt": "Notação de Leibniz para composição.",
    },
    "Orden recomendado para esbozar \\(y=f(x)\\).": {
        "de": "Empfohlene Reihenfolge zum Skizzieren von \\(y=f(x)\\).",
        "fr": "Ordre recommandé pour esquisser \\(y=f(x)\\).",
        "it": "Ordine consigliato per disegnare \\(y=f(x)\\).",
        "pt": "Ordem recomendada para esboçar \\(y=f(x)\\).",
    },
    "Para todo \\(k\\) entre \\(f(a)\\) y \\(f(b)\\) (TVI).": {
        "de": "Für jedes \\(k\\) zwischen \\(f(a)\\) und \\(f(b)\\) (ZWVS).",
        "fr": "Pour tout \\(k\\) entre \\(f(a)\\) et \\(f(b)\\) (TVI).",
        "it": "Per ogni \\(k\\) tra \\(f(a)\\) e \\(f(b)\\) (TVI).",
        "pt": "Para todo \\(k\\) entre \\(f(a)\\) e \\(f(b)\\) (TVI).",
    },
    "Paso inicial para derivar \\(f^g\\) con exponente variable.": {
        "de": "Erster Schritt zum Ableiten von \\(f^g\\) mit variablem Exponenten.",
        "fr": "Première étape pour dériver \\(f^g\\) à exposant variable.",
        "it": "Passo iniziale per derivare \\(f^g\\) con esponente variabile.",
        "pt": "Passo inicial para derivar \\(f^g\\) com expoente variável.",
    },
    "Pendiente de la tangente.": {
        "de": "Steigung der Tangente.",
        "fr": "Pente de la tangente.",
        "it": "Pendenza della tangente.",
        "pt": "Inclinação da tangente.",
    },
    "Polinomio de Taylor de grado 1 (aproximación lineal en \\(a\\)).": {
        "de": "Taylor-Polynom vom Grad 1 (lineare Näherung in \\(a\\)).",
        "fr": "Polynôme de Taylor de degré 1 (approximation linéaire en \\(a\\)).",
        "it": "Polinomio di Taylor di grado 1 (approssimazione lineare in \\(a\\)).",
        "pt": "Polinômio de Taylor de grau 1 (aproximação linear em \\(a\\)).",
    },
    "Polinomio de Taylor de orden \\(n\\) centrado en \\(a\\).": {
        "de": "Taylor-Polynom der Ordnung \\(n\\) um \\(a\\).",
        "fr": "Polynôme de Taylor d'ordre \\(n\\) centré en \\(a\\).",
        "it": "Polinomio di Taylor di ordine \\(n\\) centrato in \\(a\\).",
        "pt": "Polinômio de Taylor de ordem \\(n\\) centrado em \\(a\\).",
    },
    "Reescritura para aplicar L'Hôpital.": {
        "de": "Umformung zur Anwendung von L'Hôpital.",
        "fr": "Réécriture pour appliquer L'Hôpital.",
        "it": "Riscrittura per applicare L'Hôpital.",
        "pt": "Reescrita para aplicar L'Hôpital.",
    },
    "Tasa relacionada en circunferencia (radio constante).": {
        "de": "Verwandte Rate am Kreis (konstanter Radius).",
        "fr": "Taux lié sur un cercle (rayon constant).",
        "it": "Tasso correlato su una circonferenza (raggio costante).",
        "pt": "Taxa relacionada na circunferência (raio constante).",
    },
    "Teorema del Valor Extremo.": {
        "de": "Satz vom Maximum und Minimum.",
        "fr": "Théorème des valeurs extrêmes.",
        "it": "Teorema del valore estremo.",
        "pt": "Teorema do valor extremo.",
    },
    "Teorema del Valor Intermedio (enunciado cualitativo).": {
        "de": "Zwischenwertsatz (qualitative Aussage).",
        "fr": "Théorème des valeurs intermédiaires (énoncé qualitatif).",
        "it": "Teorema del valore intermedio (enunciato qualitativo).",
        "pt": "Teorema do valor intermediário (enunciado qualitativo).",
    },
    "Velocidad instantánea como derivada de la posición.": {
        "de": "Momentane Geschwindigkeit als Ableitung der Position.",
        "fr": "Vitesse instantanée comme dérivée de la position.",
        "it": "Velocità istantanea come derivata della posizione.",
        "pt": "Velocidade instantânea como derivada da posição.",
    },
    "Válido si el límite de \\(f\\) existe. Si \\(n<0\\), además se requiere \\(\\lim_{x\\to a}f(x)\\neq0\\).": {
        "de": "Gültig, wenn der Grenzwert von \\(f\\) existiert. Für \\(n<0\\) zusätzlich \\(\\lim_{x\\to a}f(x)\\neq0\\).",
        "fr": "Valable si la limite de \\(f\\) existe. Si \\(n<0\\), on exige aussi \\(\\lim_{x\\to a}f(x)\\neq0\\).",
        "it": "Valido se esiste il limite di \\(f\\). Se \\(n<0\\), serve anche \\(\\lim_{x\\to a}f(x)\\neq0\\).",
        "pt": "Válido se o limite de \\(f\\) existe. Se \\(n<0\\), também se exige \\(\\lim_{x\\to a}f(x)\\neq0\\).",
    },
    "Válido si los límites de \\(f\\) y \\(g\\) existen.": {
        "de": "Gültig, wenn die Grenzwerte von \\(f\\) und \\(g\\) existieren.",
        "fr": "Valable si les limites de \\(f\\) et \\(g\\) existent.",
        "it": "Valido se esistono i limiti di \\(f\\) e \\(g\\).",
        "pt": "Válido se os limites de \\(f\\) e \\(g\\) existem.",
    },
    "Útil para potencias variables y productos/cocientes.": {
        "de": "Nützlich für variable Potenzen und Produkte/Quotienten.",
        "fr": "Utile pour puissances variables et produits/quotients.",
        "it": "Utile per potenze variabili e prodotti/quozienti.",
        "pt": "Útil para potências variáveis e produtos/quocientes.",
    },
    "Señal en la función": {
        "de": "Signal in der Funktion",
        "fr": "Signal dans la fonction",
        "it": "Segnale nella funzione",
        "pt": "Sinal na função",
    },
    "Técnica sugerida": {
        "de": "Vorgeschlagene Technik",
        "fr": "Technique suggérée",
        "it": "Tecnica suggerita",
        "pt": "Técnica sugerida",
    },
}


def main() -> None:
    out: dict[str, dict[str, str]] = {loc: {} for loc in ("de", "fr", "it", "pt")}
    for key, locs in TRANSLATIONS.items():
        for loc, val in locs.items():
            out[loc][key] = val
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT} ({sum(len(v) for v in out.values())} entries)")


if __name__ == "__main__":
    main()
