#!/usr/bin/env python3
"""Patch UI message JSON for Física Electrónica (6 locales)."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MSG = ROOT / "apps" / "web-public" / "messages"

GUIDE = {
    "es": {
        "titleElectronics": "Guía para enfocar un circuito",
        "descriptionElectronics": "Guía práctica para elegir el bloque de fórmulas de Física Electrónica según la señal del circuito.",
        "ogTitleElectronics": "Guía de enfoque · Física Electrónica",
        "sectionLabelElectronics": "Sección 18",
        "introElectronics": "Usa la señal del circuito (DC, transitorio, sinusoidal, dispositivo o digital) para abrir el bloque adecuado.",
    },
    "en": {
        "titleElectronics": "Guide to framing a circuit problem",
        "descriptionElectronics": "Practical guide to choose the Electronics formula block from the circuit cue.",
        "ogTitleElectronics": "Approach guide · Electronics",
        "sectionLabelElectronics": "Section 18",
        "introElectronics": "Use the circuit cue (DC, transient, sinusoidal, device or digital) to open the right block.",
    },
    "de": {
        "titleElectronics": "Leitfaden zur Schaltungsanalyse",
        "descriptionElectronics": "Praktischer Leitfaden zur Wahl des Elektronik-Formelblocks anhand des Schaltungssignals.",
        "ogTitleElectronics": "Ansatzleitfaden · Elektronik",
        "sectionLabelElectronics": "Abschnitt 18",
        "introElectronics": "Nutze das Schaltungssignal (DC, Transient, Sinus, Bauelement oder Digital), um den passenden Block zu öffnen.",
    },
    "fr": {
        "titleElectronics": "Guide pour cadrer un circuit",
        "descriptionElectronics": "Guide pratique pour choisir le bloc de formules d'Électronique selon le signal du circuit.",
        "ogTitleElectronics": "Guide d'approche · Électronique",
        "sectionLabelElectronics": "Section 18",
        "introElectronics": "Utilisez le signal du circuit (DC, transitoire, sinusoïdal, composant ou numérique) pour ouvrir le bon bloc.",
    },
    "it": {
        "titleElectronics": "Guida per impostare un circuito",
        "descriptionElectronics": "Guida pratica per scegliere il blocco di formule di Elettronica in base al segnale del circuito.",
        "ogTitleElectronics": "Guida di approccio · Elettronica",
        "sectionLabelElectronics": "Sezione 18",
        "introElectronics": "Usa il segnale del circuito (DC, transitorio, sinusoidale, dispositivo o digitale) per aprire il blocco giusto.",
    },
    "pt": {
        "titleElectronics": "Guia para enfocar um circuito",
        "descriptionElectronics": "Guia prática para escolher o bloco de fórmulas de Física Eletrônica segundo o sinal do circuito.",
        "ogTitleElectronics": "Guia de enfoque · Física Eletrônica",
        "sectionLabelElectronics": "Seção 18",
        "introElectronics": "Use o sinal do circuito (DC, transiente, senoidal, dispositivo ou digital) para abrir o bloco adequado.",
    },
}

HUBS = {
    "es": {
        "dividersThevenin": {
            "title": "Divisores y Thévenin",
            "description": "Divisor de tensión, carga y equivalentes Thévenin/Norton.",
            "intro": "Reduce la red resistiva a un puerto: divisor, VTh, RTh y la equivalencia con Norton.",
        },
        "rcTransients": {
            "title": "Transitorios RC",
            "description": "Carga, descarga y constante de tiempo de circuitos de primer orden.",
            "intro": "Sigue vC(t) desde el valor inicial continuo hasta el asentamiento con τ = RC.",
        },
        "phasorsImpedance": {
            "title": "Fasores e impedancia",
            "description": "Sinusoide RMS, fasor giratorio e impedancia compleja.",
            "intro": "Pasa de v(t) al fasor RMS y resume el elemento como Z = R + jX.",
        },
        "filtersBode": {
            "title": "Filtros y Bode",
            "description": "Pasa-bajos, pasa-altos y frecuencia de corte en el diagrama de Bode.",
            "intro": "Lee |H(jω)|, marca fc en −3 dB y observa la pendiente de primer orden.",
        },
        "diodesRectification": {
            "title": "Diodos y rectificación",
            "description": "Shockley, umbral de silicio y rectificadores de media y onda completa.",
            "intro": "El diodo conduce tras el umbral; el rectificador recorta o pliega la sinusoide.",
        },
        "opampBasic": {
            "title": "Operacional básico",
            "description": "Nudo virtual, inversor, no inversor y seguidor.",
            "intro": "Con realimentación negativa v+ ≈ v− y las resistencias fijan la ganancia.",
        },
        "combinationalLogic": {
            "title": "Lógica combinacional",
            "description": "Multiplexor, decodificador, sumador y mapa de Karnaugh en hardware.",
            "intro": "La tabla de verdad define el circuito; las identidades booleanas siguen en Álgebra.",
        },
        "flipFlops": {
            "title": "Flip-flops y temporización",
            "description": "Flip-flop D, tiempo de setup, hold y siguiente estado.",
            "intro": "El flanco muestrea D; tsu y th marcan la ventana que evita la metastabilidad.",
        },
    },
    "en": {
        "dividersThevenin": {
            "title": "Dividers and Thévenin",
            "description": "Voltage divider, loading, and Thévenin/Norton equivalents.",
            "intro": "Reduce a resistive network to one port: divider, VTh, RTh and the Norton swap.",
        },
        "rcTransients": {
            "title": "RC transients",
            "description": "Charging, discharging and the first-order time constant.",
            "intro": "Track vC(t) from the continuous initial value to the settled value with τ = RC.",
        },
        "phasorsImpedance": {
            "title": "Phasors and impedance",
            "description": "RMS sinusoid, rotating phasor and complex impedance.",
            "intro": "Move from v(t) to the RMS phasor and summarize the element as Z = R + jX.",
        },
        "filtersBode": {
            "title": "Filters and Bode plots",
            "description": "Low-pass, high-pass and cutoff on the Bode magnitude plot.",
            "intro": "Read |H(jω)|, mark fc at −3 dB and watch the first-order slope.",
        },
        "diodesRectification": {
            "title": "Diodes and rectification",
            "description": "Shockley, silicon threshold, and half- and full-wave rectifiers.",
            "intro": "The diode conducts past threshold; the rectifier clips or folds the sinusoid.",
        },
        "opampBasic": {
            "title": "Basic op-amp",
            "description": "Virtual node, inverting, non-inverting and voltage follower.",
            "intro": "With negative feedback v+ ≈ v− and the resistors set the gain.",
        },
        "combinationalLogic": {
            "title": "Combinational logic",
            "description": "Multiplexer, decoder, adder and Karnaugh maps in hardware.",
            "intro": "The truth table defines the circuit; Boolean identities stay in Algebra.",
        },
        "flipFlops": {
            "title": "Flip-flops and timing",
            "description": "D flip-flop, setup time, hold and next state.",
            "intro": "The edge samples D; tsu and th mark the window that avoids metastability.",
        },
    },
    "de": {
        "dividersThevenin": {
            "title": "Teiler und Thévenin",
            "description": "Spannungsteiler, Last und Thévenin/Norton-Ersatzschaltungen.",
            "intro": "Reduziere das Widerstandsnetz auf einen Tor: Teiler, VTh, RTh und Norton-Tausch.",
        },
        "rcTransients": {
            "title": "RC-Transienten",
            "description": "Laden, Entladen und Zeitkonstante erster Ordnung.",
            "intro": "Verfolge vC(t) vom stetigen Anfangswert zum Endwert mit τ = RC.",
        },
        "phasorsImpedance": {
            "title": "Zeiger und Impedanz",
            "description": "RMS-Sinus, drehender Zeiger und komplexe Impedanz.",
            "intro": "Gehe von v(t) zum RMS-Zeiger und fasse das Element als Z = R + jX zusammen.",
        },
        "filtersBode": {
            "title": "Filter und Bode",
            "description": "Tiefpass, Hochpass und Grenzfrequenz im Bode-Diagramm.",
            "intro": "Lies |H(jω)|, markiere fc bei −3 dB und beobachte die Steigung erster Ordnung.",
        },
        "diodesRectification": {
            "title": "Dioden und Gleichrichtung",
            "description": "Shockley, Siliziumschwellwert, Halb- und Vollweggleichrichter.",
            "intro": "Die Diode leitet nach der Schwelle; der Gleichrichter schneidet oder faltet die Sinuswelle.",
        },
        "opampBasic": {
            "title": "OPV-Grundschaltungen",
            "description": "Virtueller Knoten, Invertierer, Nichtinvertierer und Folger.",
            "intro": "Mit Gegenkopplung gilt v+ ≈ v− und die Widerstände setzen die Verstärkung.",
        },
        "combinationalLogic": {
            "title": "Kombinatorische Logik",
            "description": "Multiplexer, Dekodierer, Addierer und Karnaugh in Hardware.",
            "intro": "Die Wahrheitstabelle definiert die Schaltung; boolesche Identitäten bleiben in Algebra.",
        },
        "flipFlops": {
            "title": "Flipflops und Timing",
            "description": "D-Flipflop, Setup-Zeit, Hold und Folgezustand.",
            "intro": "Die Flanke tastet D; tsu und th markieren das Fenster gegen Metastabilität.",
        },
    },
    "fr": {
        "dividersThevenin": {
            "title": "Diviseurs et Thévenin",
            "description": "Diviseur de tension, charge et équivalents Thévenin/Norton.",
            "intro": "Réduisez le réseau résistif à un port : diviseur, VTh, RTh et l'échange Norton.",
        },
        "rcTransients": {
            "title": "Transitoires RC",
            "description": "Charge, décharge et constante de temps du premier ordre.",
            "intro": "Suivez vC(t) de la valeur initiale continue à l'établissement avec τ = RC.",
        },
        "phasorsImpedance": {
            "title": "Phaseurs et impédance",
            "description": "Sinusoïde RMS, phaseur tournant et impédance complexe.",
            "intro": "Passez de v(t) au phaseur RMS et résumez l'élément par Z = R + jX.",
        },
        "filtersBode": {
            "title": "Filtres et Bode",
            "description": "Passe-bas, passe-haut et fréquence de coupure sur le diagramme de Bode.",
            "intro": "Lisez |H(jω)|, marquez fc à −3 dB et observez la pente du premier ordre.",
        },
        "diodesRectification": {
            "title": "Diodes et redressement",
            "description": "Shockley, seuil silicium, redresseurs simple et double alternance.",
            "intro": "La diode conduit après le seuil ; le redresseur coupe ou replie la sinusoïde.",
        },
        "opampBasic": {
            "title": "AOP de base",
            "description": "Nœud virtuel, inverseur, non inverseur et suiveur.",
            "intro": "En contre-réaction, v+ ≈ v− et les résistances fixent le gain.",
        },
        "combinationalLogic": {
            "title": "Logique combinatoire",
            "description": "Multiplexeur, décodeur, additionneur et Karnaugh en matériel.",
            "intro": "La table de vérité définit le circuit ; les identités booléennes restent en Algèbre.",
        },
        "flipFlops": {
            "title": "Bascules et temporisation",
            "description": "Bascule D, temps de setup, hold et état suivant.",
            "intro": "Le front échantillonne D ; tsu et th marquent la fenêtre contre la métastabilité.",
        },
    },
    "it": {
        "dividersThevenin": {
            "title": "Partitori e Thévenin",
            "description": "Partitore di tensione, carico ed equivalenti Thévenin/Norton.",
            "intro": "Riduci la rete resistiva a una porta: partitore, VTh, RTh e lo scambio Norton.",
        },
        "rcTransients": {
            "title": "Transitori RC",
            "description": "Carica, scarica e costante di tempo del primo ordine.",
            "intro": "Segui vC(t) dal valore iniziale continuo all'assestamento con τ = RC.",
        },
        "phasorsImpedance": {
            "title": "Fasori e impedenza",
            "description": "Sinusoide RMS, fasore rotante e impedenza complessa.",
            "intro": "Passa da v(t) al fasore RMS e riassumi l'elemento come Z = R + jX.",
        },
        "filtersBode": {
            "title": "Filtri e Bode",
            "description": "Passa-basso, passa-alto e frequenza di taglio nel diagramma di Bode.",
            "intro": "Leggi |H(jω)|, segna fc a −3 dB e osserva la pendenza del primo ordine.",
        },
        "diodesRectification": {
            "title": "Diodi e raddrizzamento",
            "description": "Shockley, soglia del silicio, raddrizzatori a mezz'onda e onda intera.",
            "intro": "Il diodo conduce oltre la soglia; il raddrizzatore taglia o piega la sinusoide.",
        },
        "opampBasic": {
            "title": "Operazionale di base",
            "description": "Nodo virtuale, invertente, non invertente e inseguitore.",
            "intro": "In controreazione v+ ≈ v− e le resistenze fissano il guadagno.",
        },
        "combinationalLogic": {
            "title": "Logica combinatoria",
            "description": "Multiplexer, decodificatore, sommatore e Karnaugh in hardware.",
            "intro": "La tavola di verità definisce il circuito; le identità booleane restano in Algebra.",
        },
        "flipFlops": {
            "title": "Flip-flop e temporizzazione",
            "description": "Flip-flop D, tempo di setup, hold e stato successivo.",
            "intro": "Il fronte campiona D; tsu e th segnano la finestra contro la metastabilità.",
        },
    },
    "pt": {
        "dividersThevenin": {
            "title": "Divisores e Thévenin",
            "description": "Divisor de tensão, carga e equivalentes Thévenin/Norton.",
            "intro": "Reduz a rede resistiva a uma porta: divisor, VTh, RTh e a troca Norton.",
        },
        "rcTransients": {
            "title": "Transientes RC",
            "description": "Carga, descarga e constante de tempo de primeira ordem.",
            "intro": "Acompanhe vC(t) do valor inicial contínuo até o assentamento com τ = RC.",
        },
        "phasorsImpedance": {
            "title": "Fasores e impedância",
            "description": "Senoide RMS, fasor giratório e impedância complexa.",
            "intro": "Passe de v(t) ao fasor RMS e resuma o elemento como Z = R + jX.",
        },
        "filtersBode": {
            "title": "Filtros e Bode",
            "description": "Passa-baixo, passa-alto e frequência de corte no diagrama de Bode.",
            "intro": "Leia |H(jω)|, marque fc em −3 dB e observe a inclinação de primeira ordem.",
        },
        "diodesRectification": {
            "title": "Diodos e retificação",
            "description": "Shockley, limiar de silício e retificadores de meia e onda completa.",
            "intro": "O diodo conduz após o limiar; o retificador recorta ou dobra a senoide.",
        },
        "opampBasic": {
            "title": "Operacional básico",
            "description": "Nó virtual, inversor, não inversor e seguidor.",
            "intro": "Com realimentação negativa v+ ≈ v− e as resistências fixam o ganho.",
        },
        "combinationalLogic": {
            "title": "Lógica combinatória",
            "description": "Multiplexador, descodificador, somador e mapa de Karnaugh em hardware.",
            "intro": "A tabela verdade define o circuito; as identidades booleanas ficam na Álgebra.",
        },
        "flipFlops": {
            "title": "Flip-flops e temporização",
            "description": "Flip-flop D, tempo de setup, hold e estado seguinte.",
            "intro": "O flanco amostra D; tsu e th marcam a janela que evita a metastabilidade.",
        },
    },
}

SITE = {
    "es": {
        "tagline": "Cálculo Diferencial, Cálculo II, Física Básica, Física Electrónica y Álgebra",
        "description": "Fórmulas matemáticas en línea multi-materia: Cálculo Diferencial, Cálculo Integral, Física Básica, Física Electrónica y Álgebra para ingeniería y CS, con búsqueda, visualizaciones y LaTeX.",
        "about": "Cálculo Diferencial, Cálculo Integral, Física Básica, Física Electrónica y Álgebra",
    },
    "en": {
        "tagline": "Differential Calculus, Calculus II, Basic Physics, Electronics and Algebra",
        "description": "Multi-subject online mathematical formulas: Differential Calculus, Integral Calculus, Basic Physics, Electronics and Algebra for engineering and CS, with search, visualizations and LaTeX.",
        "about": "Differential Calculus, Integral Calculus, Basic Physics, Electronics and Algebra",
    },
    "de": {
        "tagline": "Differentialrechnung, Analysis II, Physik, Elektronik und Algebra",
        "description": "Mathematische Formeln online: Differentialrechnung, Integralrechnung, Physik, Elektronik und Algebra für Ingenieurwesen und Informatik.",
        "about": "Differentialrechnung, Integralrechnung, Physik, Elektronik und Algebra",
    },
    "fr": {
        "tagline": "Calcul différentiel, Calcul II, Physique de base, Électronique et Algèbre",
        "description": "Formules mathématiques en ligne : calcul différentiel, calcul intégral, physique de base, électronique et algèbre pour l'ingénierie et l'informatique.",
        "about": "Calcul différentiel, calcul intégral, physique de base, électronique et algèbre",
    },
    "it": {
        "tagline": "Calcolo differenziale, Calcolo II, Fisica di base, Elettronica e Algebra",
        "description": "Formule matematiche online: calcolo differenziale, calcolo integrale, fisica di base, elettronica e algebra per ingegneria e informatica.",
        "about": "Calcolo differenziale, calcolo integrale, fisica di base, elettronica e algebra",
    },
    "pt": {
        "tagline": "Cálculo Diferencial, Cálculo II, Física Básica, Física Eletrônica e Álgebra",
        "description": "Fórmulas matemáticas online: Cálculo Diferencial, Cálculo Integral, Física Básica, Física Eletrônica e Álgebra para engenharia e CS.",
        "about": "Cálculo Diferencial, Cálculo Integral, Física Básica, Física Eletrônica e Álgebra",
    },
}

SUPPORT = {
    "es": "Cálculo, física, electrónica y álgebra en un solo lugar: LaTeX legible, búsqueda rápida y visualizaciones que enseñan la idea.",
    "en": "Calculus, physics, electronics, and algebra in one place: readable LaTeX, fast search, and visuals that teach the idea.",
    "de": "Analysis, Physik, Elektronik und Algebra an einem Ort: lesbares LaTeX, schnelle Suche und Visualisierungen, die die Idee zeigen.",
    "fr": "Calcul, physique, électronique et algèbre au même endroit : LaTeX lisible, recherche rapide et visualisations qui enseignent l’idée.",
    "it": "Calcolo, fisica, elettronica e algebra in un unico posto: LaTeX leggibile, ricerca rapida e visualizzazioni che insegnano l’idea.",
    "pt": "Cálculo, física, eletrônica e álgebra num só lugar: LaTeX legível, pesquisa rápida e visualizações que ensinam a ideia.",
}

PLACEHOLDER = {
    "es": "Ej. DIF-041, INT-001, VEC-001, DIV-001, por partes…",
    "en": "E.g. DIF-041, INT-001, VEC-001, DIV-001, integration by parts…",
    "de": "z. B. DIF-041, INT-001, VEC-001, DIV-001, partielle Integration…",
    "fr": "Ex. DIF-041, INT-001, VEC-001, DIV-001, intégration par parties…",
    "it": "Es. DIF-041, INT-001, VEC-001, DIV-001, integrazione per parti…",
    "pt": "Ex. DIF-041, INT-001, VEC-001, DIV-001, por partes…",
}


def main() -> None:
    for loc in ("es", "en", "de", "fr", "it", "pt"):
        path = MSG / f"{loc}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        data["guide"].update(GUIDE[loc])
        data["topicHubs"].update(HUBS[loc])
        data["site"].update(SITE[loc])
        if "home" in data and "support" in data["home"]:
            data["home"]["support"] = SUPPORT[loc]
        if "search" in data and "placeholder" in data["search"]:
            data["search"]["placeholder"] = PLACEHOLDER[loc]
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"patched {path.name}")


if __name__ == "__main__":
    main()
