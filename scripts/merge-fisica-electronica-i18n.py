#!/usr/bin/env python3
"""Patch Física Electrónica pedagogy and merge phrase translations into content-i18n."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD = ROOT / "content" / "formulas-fisica-electronica.md"
I18N_DIR = ROOT / "apps" / "web-public" / "content-i18n"
LOCALES = ("en", "de", "fr", "it", "pt")
PHRASES_PATH = ROOT / "scripts" / "fisica-electronica-locale-phrases.json"
SUBTITLES_PATH = ROOT / "scripts" / "fisica-electronica-subtopic-titles.json"
WORKED_PATH = ROOT / "scripts" / "fisica-electronica-worked-i18n.json"

GENERIC_DETAIL = "expresa la relación principal entre las magnitudes del modelo y orienta su cálculo o verificación"

TITLES: dict[str, dict[str, str]] = {
    "en": {},
    "de": {},
    "fr": {},
    "it": {},
    "pt": {},
}

# Spanish title -> (en, de, fr, it, pt)
TITLE_ROWS: list[tuple[str, str, str, str, str, str]] = [
    ("Mapa del curso y prerrequisitos", "Course map and prerequisites", "Kurskarte und Voraussetzungen", "Carte du cours et prérequis", "Mappa del corso e prerequisiti", "Mapa do curso e pré-requisitos"),
    ("Redes resistivas", "Resistive networks", "Widerstandsnetzwerke", "Réseaux résistifs", "Reti resistive", "Redes de resistências"),
    ("Capacitores e inductores en circuitos", "Capacitors and inductors in circuits", "Kondensatoren und Induktivitäten in Schaltungen", "Condensateurs et inductances dans les circuits", "Condensatori e induttori nei circuiti", "Capacitores e indutores em circuitos"),
    ("Transitorios de primer orden", "First-order transients", "Transienten erster Ordnung", "Transitoires du premier ordre", "Transitori del primo ordine", "Transientes de primeira ordem"),
    ("Circuitos RLC de segundo orden", "Second-order RLC circuits", "RLC-Schaltungen zweiter Ordnung", "Circuits RLC du second ordre", "Circuiti RLC del secondo ordine", "Circuitos RLC de segunda ordem"),
    ("Corriente alterna y fasores", "AC and phasors", "Wechselstrom und Zeiger", "Courant alternatif et phaseurs", "Corrente alternata e fasori", "Corrente alternada e fasores"),
    ("Potencia en CA y resonancia", "AC power and resonance", "Wechselstromleistung und Resonanz", "Puissance alternative et résonance", "Potenza in CA e risonanza", "Potência em CA e ressonância"),
    ("Filtros y respuesta en frecuencia", "Filters and frequency response", "Filter und Frequenzgang", "Filtres et réponse en fréquence", "Filtri e risposta in frequenza", "Filtros e resposta em frequência"),
    ("Transformadores", "Transformers", "Transformatoren", "Transformateurs", "Trasformatori", "Transformadores elétricos"),
    ("Semiconductores y diodos", "Semiconductors and diodes", "Halbleiter und Dioden", "Semiconducteurs et diodes", "Semiconduttori e diodi", "Semicondutores e diodos"),
    ("Transistores BJT", "BJT transistors", "Bipolartransistoren", "Transistors bipolaires", "Transistor BJT", "Transistores bipolares"),
    ("Transistores FET", "FET transistors", "Feldeffekttransistoren", "Transistors à effet de champ", "Transistor FET", "Transistores de efeito de campo"),
    ("Amplificadores y operacional", "Amplifiers and op-amps", "Verstärker und Operationsverstärker", "Amplificateurs et AOP", "Amplificatori e operazionali", "Amplificadores e operacionais"),
    ("Familias lógicas y puertas", "Logic families and gates", "Logikfamilien und Gatter", "Familles logiques et portes", "Famiglie logiche e porte", "Famílias lógicas e portas"),
    ("Lógica combinacional", "Combinational logic", "Kombinatorische Logik", "Logique combinatoire", "Logica combinatoria", "Lógica combinatória"),
    ("Lógica secuencial", "Sequential logic", "Sequenzielle Logik", "Logique séquentielle", "Logica sequenziale", "Lógica sequencial"),
    ("Conversión A/D–D/A y muestreo", "A/D–D/A conversion and sampling", "A/D–D/A-Wandlung und Abtastung", "Conversion A/N–N/A et échantillonnage", "Conversione A/D–D/A e campionamento", "Conversão A/D–D/A e amostragem"),
    ("Guía para enfocar un circuito", "Guide to framing a circuit problem", "Leitfaden zur Schaltungsanalyse", "Guide pour cadrer un circuit", "Guida per impostare un circuito", "Guia para enfocar um circuito"),
    ("Divisor de tensión", "Voltage divider", "Spannungsteiler", "Diviseur de tension", "Partitore di tensione", "Divisor de tensão"),
    ("Divisor de corriente", "Current divider", "Stromteiler", "Diviseur de courant", "Partitore di corrente", "Divisor de corrente"),
    ("Divisor de tensión con carga", "Loaded voltage divider", "Belasteter Spannungsteiler", "Diviseur de tension chargé", "Partitore di tensione con carico", "Divisor de tensão com carga"),
    ("Puente de Wheatstone", "Wheatstone bridge", "Wheatstone-Brücke", "Pont de Wheatstone", "Ponte di Wheatstone", "Ponte de Wheatstone"),
    ("Equilibrio del puente de Wheatstone", "Wheatstone bridge balance", "Abgleich der Wheatstone-Brücke", "Équilibre du pont de Wheatstone", "Equilibrio del ponte di Wheatstone", "Equilíbrio da ponte de Wheatstone"),
    ("Tensión de Thévenin", "Thévenin voltage", "Thévenin-Spannung", "Tension de Thévenin", "Tensione di Thévenin", "Tensão de Thévenin"),
    ("Resistencia de Thévenin", "Thévenin resistance", "Thévenin-Widerstand", "Résistance de Thévenin", "Resistenza di Thévenin", "Resistência de Thévenin"),
    ("Corriente de Norton", "Norton current", "Norton-Strom", "Courant de Norton", "Corrente di Norton", "Corrente de Norton"),
    ("Resistencia de Norton", "Norton resistance", "Norton-Widerstand", "Résistance de Norton", "Resistenza di Norton", "Resistência de Norton"),
    ("Equivalencia Thévenin–Norton", "Thévenin–Norton equivalence", "Thévenin–Norton-Äquivalenz", "Équivalence Thévenin–Norton", "Equivalenza Thévenin–Norton", "Equivalência Thévenin–Norton"),
    ("Máxima transferencia de potencia", "Maximum power transfer", "Maximale Leistungsübertragung", "Transfert maximal de puissance", "Massima trasferimento di potenza", "Máxima transferência de potência"),
    ("Principio de superposición", "Superposition principle", "Superpositionsprinzip", "Principe de superposition", "Principio di sovrapposizione", "Princípio da superposição"),
    ("Análisis nodal por KCL", "Nodal analysis with KCL", "Knotenanalyse mit KCL", "Analyse nodale par LKC", "Analisi nodale con LKC", "Análise nodal por LKC"),
    ("Análisis de mallas por KVL", "Mesh analysis with KVL", "Maschenanalyse mit KVL", "Analyse des mailles par LKV", "Analisi delle maglie con LKT", "Análise de malhas por LKT"),
    ("Capacitores en serie", "Series capacitors", "Kondensatoren in Reihe", "Condensateurs en série", "Condensatori in serie", "Capacitores em série"),
    ("Capacitores en paralelo", "Parallel capacitors", "Kondensatoren parallel", "Condensateurs en parallèle", "Condensatori in parallelo", "Capacitores em paralelo"),
    ("Inductores en serie", "Series inductors", "Induktivitäten in Reihe", "Inductances en série", "Induttori in serie", "Indutores em série"),
    ("Inductores en paralelo", "Parallel inductors", "Induktivitäten parallel", "Inductances en parallèle", "Induttori in parallelo", "Indutores em paralelo"),
    ("Energía almacenada en un capacitor", "Energy stored in a capacitor", "Im Kondensator gespeicherte Energie", "Énergie stockée dans un condensateur", "Energia immagazzinata in un condensatore", "Energia armazenada num capacitor"),
    ("Energía almacenada en un inductor", "Energy stored in an inductor", "In einer Spule gespeicherte Energie", "Énergie stockée dans une inductance", "Energia immagazzinata in un induttore", "Energia armazenada num indutor"),
    ("Constante de tiempo RC", "RC time constant", "RC-Zeitkonstante", "Constante de temps RC", "Costante di tempo RC", "Constante de tempo RC"),
    ("Constante de tiempo RL", "RL time constant", "RL-Zeitkonstante", "Constante de temps RL", "Costante di tempo RL", "Constante de tempo RL"),
    ("Inductancia mutua", "Mutual inductance", "Gegeninduktivität", "Inductance mutuelle", "Induttanza mutua", "Indutância mútua"),
    ("Coeficiente de acoplamiento", "Coupling coefficient", "Kopplungsfaktor", "Coefficient de couplage", "Coefficiente di accoppiamento", "Coeficiente de acoplamento"),
    ("Continuidad de la tensión del capacitor", "Capacitor voltage continuity", "Stetigkeit der Kondensatorspannung", "Continuité de la tension du condensateur", "Continuità della tensione del condensatore", "Continuidade da tensão do capacitor"),
    ("Continuidad de la corriente del inductor", "Inductor current continuity", "Stetigkeit des Spulenstroms", "Continuité du courant d'inductance", "Continuità della corrente dell'induttore", "Continuidade da corrente do indutor"),
    ("Respuesta completa de primer orden", "Complete first-order response", "Vollständige Antwort erster Ordnung", "Réponse complète du premier ordre", "Risposta completa del primo ordine", "Resposta completa de primeira ordem"),
    ("Carga de un capacitor", "Capacitor charging", "Aufladen eines Kondensators", "Charge d'un condensateur", "Carica di un condensatore", "Carga de um capacitor"),
    ("Descarga de un capacitor", "Capacitor discharging", "Entladen eines Kondensators", "Décharge d'un condensateur", "Scarica di un condensatore", "Descarga de um capacitor"),
    ("Corriente del capacitor", "Capacitor current", "Kondensatorstrom", "Courant du condensateur", "Corrente del condensatore", "Corrente do capacitor"),
    ("Respuesta general de corriente RL", "General RL current response", "Allgemeine RL-Stromantwort", "Réponse générale de courant RL", "Risposta generale di corrente RL", "Resposta geral de corrente RL"),
    ("Establecimiento de corriente en un inductor", "Inductor current build-up", "Stromaufbau in einer Spule", "Établissement du courant dans une inductance", "Stabilirsi della corrente in un induttore", "Estabelecimento de corrente num indutor"),
    ("Descarga de corriente en un inductor", "Inductor current decay", "Stromabbau in einer Spule", "Décroissance du courant dans une inductance", "Decadimento della corrente in un induttore", "Decaimento de corrente num indutor"),
    ("Tensión del inductor", "Inductor voltage", "Spulenspannung", "Tension d'inductance", "Tensione dell'induttore", "Tensão do indutor"),
    ("Valor a una constante de tiempo", "Value at one time constant", "Wert nach einer Zeitkonstante", "Valeur à une constante de temps", "Valore a una costante di tempo", "Valor a uma constante de tempo"),
    ("Tiempo práctico de asentamiento", "Practical settling time", "Praktische Einschwingzeit", "Temps d'établissement pratique", "Tempo pratico di assestamento", "Tempo prático de acomodação"),
    ("Condición inicial del capacitor", "Capacitor initial condition", "Anfangswert des Kondensators", "Condition initiale du condensateur", "Condizione iniziale del condensatore", "Condição inicial do capacitor"),
    ("Condición inicial del inductor", "Inductor initial condition", "Anfangswert der Spule", "Condition initiale de l'inductance", "Condizione iniziale dell'induttore", "Condição inicial do indutor"),
    ("Frecuencia natural no amortiguada", "Undamped natural frequency", "Ungedämpfte Eigenfrequenz", "Fréquence naturelle non amortie", "Frequenza naturale non smorzata", "Frequência natural não amortecida"),
    ("Factor de amortiguamiento serie", "Series damping factor", "Reihendämpfungsfaktor", "Facteur d'amortissement série", "Fattore di smorzamento serie", "Fator de amortecimento série"),
    ("Razón de amortiguamiento", "Damping ratio", "Dämpfungsgrad", "Taux d'amortissement", "Rapporto di smorzamento", "Razão de amortecimento"),
    ("Respuesta sobreamortiguada", "Overdamped response", "Überdämpfte Antwort", "Réponse suramortie", "Risposta sovrasmorzata", "Resposta superamortecida"),
    ("Respuesta críticamente amortiguada", "Critically damped response", "Kritisch gedämpfte Antwort", "Réponse amortie de façon critique", "Risposta criticamente smorzata", "Resposta criticamente amortecida"),
    ("Respuesta subamortiguada", "Underdamped response", "Unterdämpfte Antwort", "Réponse sous-amortie", "Risposta sottosmorzata", "Resposta subamortecida"),
    ("Frecuencia natural amortiguada", "Damped natural frequency", "Gedämpfte Eigenfrequenz", "Fréquence naturelle amortie", "Frequenza naturale smorzata", "Frequência natural amortecida"),
    ("Factor de calidad", "Quality factor", "Gütefaktor", "Facteur de qualité", "Fattore di qualità", "Fator de qualidade"),
    ("Frecuencia natural RLC paralelo", "Parallel RLC natural frequency", "Eigenfrequenz des parallelen RLC", "Fréquence naturelle RLC parallèle", "Frequenza naturale RLC parallelo", "Frequência natural RLC paralelo"),
    ("Ancho de banda resonante", "Resonant bandwidth", "Resonanzbandbreite", "Largeur de bande résonante", "Larghezza di banda risonante", "Largura de banda ressonante"),
    ("Señal sinusoidal", "Sinusoidal signal", "Sinussignal", "Signal sinusoïdal", "Segnale sinusoidale", "Sinal senoidal"),
    ("Frecuencia angular", "Angular frequency", "Kreisfrequenz", "Fréquence angulaire", "Frequenza angolare", "Frequência angular"),
    ("Valor eficaz de una sinusoide", "RMS value of a sinusoid", "Effektivwert einer Sinuswelle", "Valeur efficace d'une sinusoïde", "Valore efficace di una sinusoide", "Valor eficaz de uma senóide"),
    ("Valor medio de seno rectificado", "Average of a rectified sine", "Mittelwert eines gleichgerichteten Sinus", "Valeur moyenne d'un sinus redressé", "Valore medio di un seno raddrizzato", "Valor médio de um seno retificado"),
    ("Fasor RMS", "RMS phasor", "Effektivwertzeiger", "Phaseur RMS", "Fasore RMS", "Fasor eficaz RMS"),
    ("Derivación en fasores", "Phasor differentiation", "Zeigerableitung", "Dérivation des phaseurs", "Derivazione dei fasori", "Derivação em fasores"),
    ("Integración en fasores", "Phasor integration", "Zeigerintegration", "Intégration des phaseurs", "Integrazione dei fasori", "Integração em fasores"),
    ("Impedancia", "Impedance", "Impedanz", "Impédance", "Impedenza", "Impedância"),
    ("Admitancia", "Admittance", "Admittanz", "Admittance", "Ammittanza", "Admitância"),
    ("Ley de Ohm fasorial", "Phasor Ohm's law", "Ohmsches Gesetz für Zeiger", "Loi d'Ohm en phaseurs", "Legge di Ohm fasoriale", "Lei de Ohm fasorial"),
    ("Magnitud de la reactancia capacitiva", "Capacitive-reactance magnitude", "Betrag des kapazitiven Blindwiderstands", "Module de la réactance capacitive", "Modulo della reattanza capacitiva", "Magnitude da reatância capacitiva"),
    ("Reactancia capacitiva", "Capacitive reactance", "Kapazitiver Blindwiderstand", "Réactance capacitive", "Reattanza capacitiva", "Reatância capacitiva"),
    ("Reactancia inductiva", "Inductive reactance", "Induktiver Blindwiderstand", "Réactance inductive", "Reattanza induttiva", "Reatância indutiva"),
    ("Ángulo de impedancia", "Impedance angle", "Impedanzwinkel", "Angle d'impédance", "Angolo di impedenza", "Ângulo de impedância"),
    ("Suma fasorial", "Phasor sum", "Zeigersumme", "Somme de phaseurs", "Somma fasoriale", "Soma fasorial"),
    ("Potencia instantánea", "Instantaneous power", "Momentanleistung", "Puissance instantanée", "Potenza istantanea", "Potência instantânea"),
    ("Potencia activa", "Active power", "Wirkleistung", "Puissance active", "Potenza attiva", "Potência ativa"),
    ("Potencia reactiva", "Reactive power", "Blindleistung", "Puissance réactive", "Potenza reattiva", "Potência reativa"),
    ("Potencia aparente", "Apparent power", "Scheinleistung", "Puissance apparente", "Potenza apparente", "Potência aparente"),
    ("Triángulo de potencias", "Power triangle", "Leistungsdreieck", "Triangle des puissances", "Triangolo delle potenze", "Triângulo de potências"),
    ("Factor de potencia", "Power factor", "Leistungsfaktor", "Facteur de puissance", "Fattore di potenza", "Fator de potência"),
    ("Corrección del factor de potencia", "Power-factor correction", "Blindleistungskompensation", "Correction du facteur de puissance", "Correzione del fattore di potenza", "Correção do fator de potência"),
    ("Resonancia serie", "Series resonance", "Reihenresonanz", "Résonance série", "Risonanza serie", "Ressonância série"),
    ("Resonancia paralelo", "Parallel resonance", "Parallelresonanz", "Résonance parallèle", "Risonanza parallelo", "Ressonância paralelo"),
    ("Factor de calidad RLC serie", "Series RLC quality factor", "Gütefaktor der RLC-Reihe", "Facteur de qualité RLC série", "Fattore di qualità RLC serie", "Fator de qualidade RLC série"),
    ("Filtro RC pasa-bajos", "RC low-pass filter", "RC-Tiefpassfilter", "Filtre RC passe-bas", "Filtro RC passa-basso", "Filtro RC passa-baixa"),
    ("Frecuencia de corte RC", "RC cutoff frequency", "RC-Grenzfrequenz", "Fréquence de coupure RC", "Frequenza di taglio RC", "Frequência de corte RC"),
    ("Filtro RC pasa-altos", "RC high-pass filter", "RC-Hochpassfilter", "Filtre RC passe-haut", "Filtro RC passa-alto", "Filtro RC passa-alta"),
    ("Filtro RL pasa-bajos", "RL low-pass filter", "RL-Tiefpassfilter", "Filtre RL passe-bas", "Filtro RL passa-basso", "Filtro RL passa-baixa"),
    ("Ganancia en decibelios", "Gain in decibels", "Gewinn in Dezibel", "Gain en décibels", "Guadagno in decibel", "Ganho em decibéis"),
    ("Pendiente de primer orden", "First-order slope", "Steigung erster Ordnung", "Pente du premier ordre", "Pendenza del primo ordine", "Inclinação de primeira ordem"),
    ("Magnitud pasa-banda RLC", "RLC band-pass magnitude", "RLC-Bandpassbetrag", "Module passe-bande RLC", "Modulo passa-banda RLC", "Magnitude passa-faixa RLC"),
    ("Ancho de banda de filtro", "Filter bandwidth", "Filterbandbreite", "Largeur de bande du filtre", "Larghezza di banda del filtro", "Largura de banda do filtro"),
    ("Factor de calidad del filtro", "Filter quality factor", "Filtergüte", "Facteur de qualité du filtre", "Fattore di qualità del filtro", "Fator de qualidade do filtro"),
    ("Frecuencia central RLC", "RLC center frequency", "RLC-Mittenfrequenz", "Fréquence centrale RLC", "Frequenza centrale RLC", "Frequência central RLC"),
    ("Relación de tensiones", "Voltage ratio", "Spannungsübersetzung", "Rapport de tensions", "Rapporto di tensioni", "Relação de tensões"),
    ("Relación de corrientes", "Current ratio", "Stromübersetzung", "Rapport de courants", "Rapporto di correnti", "Relação de correntes"),
    ("Impedancia reflejada", "Reflected impedance", "Transformierte Impedanz", "Impédance ramenée", "Impedenza riportata", "Impedância refletida"),
    ("Conservación de potencia ideal", "Ideal power conservation", "Ideale Leistungserhaltung", "Conservation idéale de la puissance", "Conservazione ideale della potenza", "Conservação ideal de potência"),
    ("Relación de transformación", "Turns ratio", "Übersetzungsverhältnis", "Rapport de transformation", "Rapporto di trasformazione", "Relação de transformação"),
    ("Relación del autotransformador", "Autotransformer ratio", "Spartransformatorverhältnis", "Rapport de l'autotransformateur", "Rapporto dell'autotrasformatore", "Relação do autotransformador"),
    ("Eficiencia del transformador", "Transformer efficiency", "Transformatorwirkungsgrad", "Rendement du transformateur", "Rendimento del trasformatore", "Eficiência do transformador"),
    ("Ley de Faraday en el devanado", "Faraday's law in the winding", "Faradaysches Gesetz in der Wicklung", "Loi de Faraday dans l'enroulement", "Legge di Faraday nell'avvolgimento", "Lei de Faraday no enrolamento"),
    ("Energía de banda prohibida", "Band-gap energy", "Bandlückenenergie", "Énergie de bande interdite", "Energia di gap", "Energia de banda proibida"),
    ("Tensión de polarización del diodo", "Diode bias voltage", "Diodenvorspannung", "Tension de polarisation de la diode", "Tensione di polarizzazione del diodo", "Tensão de polarização do diodo"),
    ("Ecuación de Shockley", "Shockley equation", "Shockley-Gleichung", "Équation de Shockley", "Equazione di Shockley", "Equação de Shockley"),
    ("Tensión térmica", "Thermal voltage", "Thermische Spannung", "Tension thermique", "Tensione termica", "Tensão térmica"),
    ("Modelo de umbral del diodo de silicio", "Silicon diode threshold model", "Schwellwertmodell der Siliziumdiode", "Modèle de seuil de la diode silicium", "Modello di soglia del diodo al silicio", "Modelo de limiar do diodo de silício"),
    ("Rectificador de media onda", "Half-wave rectifier", "Einweggleichrichter", "Redresseur simple alternance", "Raddrizzatore a una semionda", "Retificador de meia onda"),
    ("Rectificador de onda completa", "Full-wave rectifier", "Vollweggleichrichter", "Redresseur double alternance", "Raddrizzatore a onda intera", "Retificador de onda completa"),
    ("Rizado con filtro capacitivo", "Ripple with capacitive filter", "Restwelligkeit mit Kondensatorfilter", "Ondulation avec filtre capacitif", "Ripple con filtro capacitivo", "Ondulação com filtro capacitivo"),
    ("Tensión Zener", "Zener voltage", "Zener-Spannung", "Tension Zener", "Tensione Zener", "Tensão Zener"),
    ("Regulación Zener", "Zener regulation", "Zener-Stabilisierung", "Régulation Zener", "Regolazione Zener", "Regulação Zener"),
    ("Caída directa de LED", "LED forward drop", "LED-Durchlassspannung", "Chute directe de LED", "Caduta diretta del LED", "Queda direta de LED"),
    ("Modelo lineal por tramos", "Piecewise-linear model", "Stückweise lineares Modell", "Modèle linéaire par morceaux", "Modello lineare a tratti", "Modelo linear por trechos"),
    ("Recortador con diodo", "Diode clipper", "Diodenbegrenzer", "Écréteur à diode", "Limitatore a diodo", "Recortador com diodo"),
    ("Puente de Graetz", "Graetz bridge", "Graetz-Brücke", "Pont de Graetz", "Ponte di Graetz", "Ponte de Graetz"),
    ("Corrientes del BJT", "BJT currents", "BJT-Ströme", "Courants du BJT", "Correnti del BJT", "Correntes do BJT"),
    ("Ganancia de corriente alfa", "Current gain alpha", "Stromverstärkung alpha", "Gain en courant alpha", "Guadagno di corrente alfa", "Ganho de corrente alfa"),
    ("Ganancia de corriente beta", "Current gain beta", "Stromverstärkung beta", "Gain en courant bêta", "Guadagno di corrente beta", "Ganho de corrente beta"),
    ("Relación entre beta y alfa", "Relation between beta and alpha", "Beziehung zwischen beta und alpha", "Relation entre bêta et alpha", "Relazione tra beta e alfa", "Relação entre beta e alfa"),
    ("Región activa del BJT", "BJT active region", "Aktiver Bereich des BJT", "Région active du BJT", "Regione attiva del BJT", "Região ativa do BJT"),
    ("Región de corte del BJT", "BJT cutoff region", "Sperrbereich des BJT", "Région de blocage du BJT", "Regione di interdizione del BJT", "Região de corte do BJT"),
    ("Región de saturación del BJT", "BJT saturation region", "Sättigungsbereich des BJT", "Région de saturation du BJT", "Regione di saturazione del BJT", "Região de saturação do BJT"),
    ("Recta de carga del BJT", "BJT load line", "Arbeitsgerade des BJT", "Droite de charge du BJT", "Retta di carico del BJT", "Reta de carga do BJT"),
    ("Polarización por divisor del BJT", "BJT divider bias", "Spannungsteiler-Arbeitspunkt des BJT", "Polarisation par diviseur du BJT", "Polarizzazione a partitore del BJT", "Polarização por divisor do BJT"),
    ("Transconductancia del BJT", "BJT transconductance", "Steilheit des BJT", "Transconductance du BJT", "Transconduttanza del BJT", "Transcondutância do BJT"),
    ("Resistencia de entrada de pequeña señal", "Small-signal input resistance", "Kleinsignal-Eingangswiderstand", "Résistance d'entrée petit signal", "Resistenza di ingresso di piccolo segnale", "Resistência de entrada de pequeno sinal"),
    ("BJT como interruptor", "BJT as a switch", "BJT als Schalter", "BJT comme interrupteur", "BJT come interruttore", "BJT como chave"),
    ("Corriente MOSFET en saturación", "MOSFET saturation current", "MOSFET-Sättigungsstrom", "Courant MOSFET en saturation", "Corrente MOSFET in saturazione", "Corrente MOSFET em saturação"),
    ("Tensión de sobreexcitación MOSFET", "MOSFET overdrive voltage", "MOSFET-Overdrive-Spannung", "Tension d'overdrive MOSFET", "Tensione di overdrive MOSFET", "Tensão de sobreexcitação MOSFET"),
    ("Corriente MOSFET en región triodo", "MOSFET triode-region current", "MOSFET-Strom im Triodenbereich", "Courant MOSFET en région triode", "Corrente MOSFET in regione triodo", "Corrente MOSFET na região tríodo"),
    ("Condición de saturación MOSFET", "MOSFET saturation condition", "MOSFET-Sättigungsbedingung", "Condition de saturation MOSFET", "Condizione di saturazione MOSFET", "Condição de saturação MOSFET"),
    ("Condición de corte MOSFET", "MOSFET cutoff condition", "MOSFET-Sperrbedingung", "Condition de blocage MOSFET", "Condizione di interdizione MOSFET", "Condição de corte MOSFET"),
    ("Resistencia de encendido", "On-resistance", "Einschaltwiderstand", "Résistance à l'état passant", "Resistenza di conduzione", "Resistência de condução"),
    ("MOSFET como interruptor", "MOSFET as a switch", "MOSFET als Schalter", "MOSFET comme interrupteur", "MOSFET come interruttore", "MOSFET como chave"),
    ("Transconductancia MOSFET", "MOSFET transconductance", "MOSFET-Steilheit", "Transconductance MOSFET", "Transconduttanza MOSFET", "Transcondutância MOSFET"),
    ("Corriente de saturación JFET", "JFET saturation current", "JFET-Sättigungsstrom", "Courant de saturation JFET", "Corrente di saturazione JFET", "Corrente de saturação JFET"),
    ("Polarización MOSFET", "MOSFET biasing", "MOSFET-Arbeitspunkteinstellung", "Polarisation MOSFET", "Polarizzazione MOSFET", "Polarização MOSFET"),
    ("Ecuación en lazo abierto", "Open-loop equation", "Gleichung im offenen Regelkreis", "Équation en boucle ouverte", "Equazione ad anello aperto", "Equação em malha aberta"),
    ("Ganancia infinita ideal", "Ideal infinite gain", "Ideale unendliche Verstärkung", "Gain infini idéal", "Guadagno infinito ideale", "Ganho infinito ideal"),
    ("Cortocircuito virtual", "Virtual short", "Virtueller Kurzschluss", "Court-circuit virtuel", "Cortocircuito virtuale", "Curto-circuito virtual"),
    ("Amplificador inversor", "Inverting amplifier", "Invertierender Verstärker", "Amplificateur inverseur", "Amplificatore invertente", "Amplificador inversor de tensão"),
    ("Amplificador no inversor", "Non-inverting amplifier", "Nichtinvertierender Verstärker", "Amplificateur non inverseur", "Amplificatore non invertente", "Amplificador não inversor"),
    ("Seguidor de tensión", "Voltage follower", "Spannungsfolger", "Suiveur de tension", "Inseguitore di tensione", "Seguidor de tensão"),
    ("Sumador inversor", "Inverting summer", "Invertierender Summierer", "Sommateur inverseur", "Sommator invertente", "Somador inversor"),
    ("Amplificador diferencial", "Differential amplifier", "Differenzverstärker", "Amplificateur différentiel", "Amplificatore differenziale", "Amplificador diferencial de tensão"),
    ("Integrador inversor", "Inverting integrator", "Invertierender Integrator", "Intégrateur inverseur", "Integratore invertente", "Integrador inversor de tensão"),
    ("Derivador inversor", "Inverting differentiator", "Invertierender Differenziator", "Dérivateur inverseur", "Derivatore invertente", "Derivador inversor de tensão"),
    ("Comparador en lazo abierto", "Open-loop comparator", "Komparator im offenen Kreis", "Comparateur en boucle ouverte", "Comparatore ad anello aperto", "Comparador em malha aberta"),
    ("Saturación del operacional", "Op-amp saturation", "Operationsverstärker-Sättigung", "Saturation de l'AOP", "Saturazione dell'operazionale", "Saturação do operacional"),
    ("Rechazo de modo común", "Common-mode rejection", "Gleichtaktunterdrückung", "Réjection de mode commun", "Reiezione di modo comune", "Rejeição de modo comum"),
    ("Impedancia de entrada ideal", "Ideal input impedance", "Ideale Eingangsimpedanz", "Impédance d'entrée idéale", "Impedenza di ingresso ideale", "Impedância de entrada ideal"),
    ("Niveles eléctricos lógicos", "Logic voltage levels", "Logische Spannungspegel", "Niveaux logiques de tension", "Livelli elettrici logici", "Níveis elétricos lógicos"),
    ("Margen de ruido alto", "High noise margin", "Hohe Rauschreserve", "Marge au bruit haute", "Margine di rumore alto", "Margem de ruído alta"),
    ("Margen de ruido bajo", "Low noise margin", "Niedrige Rauschreserve", "Marge au bruit basse", "Margine di rumore basso", "Margem de ruído baixa"),
    ("Retardo de propagación alto a bajo", "High-to-low propagation delay", "Gatterlaufzeit High-Low", "Délai de propagation haut-bas", "Ritardo di propagazione alto-basso", "Atraso de propagação alto-baixo"),
    ("Retardo medio de propagación", "Average propagation delay", "Mittlere Gatterlaufzeit", "Délai de propagation moyen", "Ritardo medio di propagazione", "Atraso médio de propagação"),
    ("Fan-out", "Logic fan-out", "Fan-out (Lastfaktor)", "Fan-out logique", "Fan-out logico", "Fan-out lógico"),
    ("Característica de transferencia CMOS", "CMOS transfer characteristic", "CMOS-Übertragungskennlinie", "Caractéristique de transfert CMOS", "Caratteristica di trasferimento CMOS", "Característica de transferência CMOS"),
    ("Umbral de conmutación", "Switching threshold", "Schaltwelle", "Seuil de commutation", "Soglia di commutazione", "Limiar de comutação"),
    ("Resistencia de pull-up", "Pull-up resistance", "Pull-up-Widerstand", "Résistance de rappel haut", "Resistenza di pull-up", "Resistência de pull-up"),
    ("Niveles CMOS frente a TTL", "CMOS versus TTL levels", "CMOS- und TTL-Pegel", "Niveaux CMOS et TTL", "Livelli CMOS e TTL", "Níveis CMOS versus TTL"),
    ("Producto potencia-retardo", "Power-delay product", "Leistungs-Verzögerungs-Produkt", "Produit puissance-délai", "Prodotto potenza-ritardo", "Produto potência-atraso"),
    ("Fan-in", "Logic fan-in", "Fan-in (Eingangslast)", "Fan-in logique", "Fan-in logico", "Fan-in lógico"),
    ("Multiplexor de dos entradas", "Two-input multiplexer", "2-zu-1-Multiplexer", "Multiplexeur à deux entrées", "Multiplexer a due ingressi", "Multiplexador de duas entradas"),
    ("Demultiplexor uno a dos", "One-to-two demultiplexer", "1-zu-2-Demultiplexer", "Démultiplexeur un vers deux", "Demultiplexer uno-a-due", "Demultiplexador um-para-dois"),
    ("Decodificador de dos a cuatro", "Two-to-four decoder", "2-zu-4-Dekodierer", "Décodeur deux vers quatre", "Decodificatore due-a-quattro", "Decodificador dois-para-quatro"),
    ("Codificador binario", "Binary encoder", "Binärkodierer", "Codeur binaire", "Codificatore binario", "Codificador binário"),
    ("Sumador completo", "Full adder", "Volladdierer", "Additionneur complet", "Sommatore completo", "Somador completo"),
    ("Acarreo de salida", "Output carry", "Übertragausgang", "Retenue de sortie", "Riporto in uscita", "Vai-um de saída"),
    ("Comparador de magnitud", "Magnitude comparator", "Größenvergleicher", "Comparateur de magnitude", "Comparatore di ampiezza", "Comparador de magnitude"),
    ("Peligro estático", "Static hazard", "Statische Hazard", "Aléa statique", "Alea statico", "Hazard estático"),
    ("Método de Karnaugh", "Karnaugh-map method", "Karnaugh-Verfahren", "Méthode de Karnaugh", "Metodo di Karnaugh", "Método do mapa de Karnaugh"),
    ("Salida tri-state", "Tri-state output", "Tri-State-Ausgang", "Sortie trois états", "Uscita tri-state", "Saída tri-state"),
    ("Codificador de prioridad", "Priority encoder", "Prioritätskodierer", "Codeur de priorité", "Codificatore di priorità", "Codificador de prioridade"),
    ("Puerta XOR en hardware", "XOR gate in hardware", "XOR-Gatter in Hardware", "Porte XOR matérielle", "Porta XOR in hardware", "Porta XOR em hardware"),
    ("Latch SR", "SR latch", "SR-Latch", "Bascule SR", "Latch SR asincrono", "Latch SR assíncrono"),
    ("Latch D", "D latch", "D-Latch", "Bascule D transparente", "Latch D trasparente", "Latch D transparente"),
    ("Flip-flop D", "D flip-flop", "D-Flipflop", "Bascule D", "Flip-flop di tipo D", "Flip-flop tipo D"),
    ("Flip-flop JK", "JK flip-flop", "JK-Flipflop", "Bascule JK", "Flip-flop di tipo JK", "Flip-flop tipo JK"),
    ("Flip-flop T", "T flip-flop", "T-Flipflop", "Bascule T", "Flip-flop di tipo T", "Flip-flop tipo T"),
    ("Tiempo de setup", "Setup time", "Setup-Zeit", "Temps de setup", "Tempo di setup", "Tempo de setup"),
    ("Tiempo de hold", "Hold time", "Hold-Zeit", "Temps de hold", "Tempo di hold", "Tempo de hold"),
    ("Registro de n bits", "n-bit register", "n-Bit-Register", "Registre de n bits", "Registro a n bit", "Registrador de n bits"),
    ("Contador binario", "Binary counter", "Binärzähler", "Compteur binaire", "Contatore binario", "Contador binário"),
    ("Contador módulo n", "Modulo-n counter", "Modulo-n-Zähler", "Compteur modulo n", "Contatore modulo n", "Contador módulo-n"),
    ("Máquina de Moore", "Moore machine", "Moore-Automat", "Machine de Moore", "Macchina di Moore", "Autómato de Moore"),
    ("Máquina de Mealy", "Mealy machine", "Mealy-Automat", "Machine de Mealy", "Macchina di Mealy", "Autómato de Mealy"),
    ("Frecuencia máxima síncrona", "Maximum synchronous frequency", "Maximale Taktfrequenz", "Fréquence synchrone maximale", "Frequenza sincrona massima", "Frequência síncrona máxima"),
    ("Metastabilidad", "Metastability", "Metastabilität", "Métastabilité", "Metastabilità", "Metastabilidade"),
    ("Criterio de Nyquist", "Nyquist criterion", "Nyquist-Kriterium", "Critère de Nyquist", "Criterio di Nyquist", "Critério de Nyquist"),
    ("Frecuencia de Nyquist", "Nyquist frequency", "Nyquist-Frequenz", "Fréquence de Nyquist", "Frequenza di Nyquist", "Frequência de Nyquist"),
    ("Paso de cuantización", "Quantization step", "Quantisierungsstufe", "Pas de quantification", "Passo di quantizzazione", "Passo de quantização"),
    ("Error de cuantización", "Quantization error", "Quantisierungsfehler", "Erreur de quantification", "Errore di quantizzazione", "Erro de quantização"),
    ("Ciclo de trabajo PWM", "PWM duty cycle", "PWM-Tastgrad", "Rapport cyclique PWM", "Ciclo di lavoro PWM", "Ciclo de trabalho PWM"),
    ("DAC de escalera R-2R", "R-2R ladder DAC", "R-2R-Leiternetz-DAC", "CNA en échelle R-2R", "DAC a scala R-2R", "DAC em escada R-2R"),
    ("Peso del bit menos significativo", "Least-significant-bit weight", "Gewicht des LSB", "Poids du bit de poids faible", "Peso del bit meno significativo", "Peso do bit menos significativo"),
    ("Número de niveles digitales", "Number of digital levels", "Anzahl digitaler Stufen", "Nombre de niveaux numériques", "Numero di livelli digitali", "Número de níveis digitais"),
    ("Comparadores de un ADC flash", "Flash-ADC comparators", "Komparatoren eines Flash-ADC", "Comparateurs d'un CAN flash", "Comparatori di un ADC flash", "Comparadores de um ADC flash"),
    ("Conversión por aproximaciones sucesivas", "Successive-approximation conversion", "Wandler mit sukzessiver Approximation", "Conversion par approximations successives", "Conversione ad approssimazioni successive", "Conversão por aproximações sucessivas"),
    ("Física Electrónica", "Electronic Physics", "Elektronik", "Physique électronique", "Fisica elettronica", "Física eletrônica"),
    ("Circuitos, semiconductores, amplificadores y electrónica digital", "Circuits, semiconductors, amplifiers and digital electronics", "Schaltungen, Halbleiter, Verstärker und digitale Elektronik", "Circuits, semiconducteurs, amplificateurs et électronique numérique", "Circuiti, semiconduttori, amplificatori ed elettronica digitale", "Circuitos, semicondutores, amplificadores e eletrônica digital"),
]

for es, en, de, fr, it, pt in TITLE_ROWS:
    TITLES["en"][es] = en
    TITLES["de"][es] = de
    TITLES["fr"][es] = fr
    TITLES["it"][es] = it
    TITLES["pt"][es] = pt

ANCHOR_DETAILS: dict[str, tuple[str, str, str, str, str, str]] = {
    "DIV-001": (
        "Muestra Vo vs R2 en el divisor de tensión descargado: Vo es la fracción R2/(R1+R2) de Vi.",
        "Shows Vo vs R2 on the unloaded voltage divider: Vo is the fraction R2/(R1+R2) of Vi.",
        "Zeigt Vo gegen R2 im unbelasteten Spannungsteiler: Vo ist der Anteil R2/(R1+R2) von Vi.",
        "Montre Vo en fonction de R2 dans le diviseur de tension à vide : Vo est la fraction R2/(R1+R2) de Vi.",
        "Mostra Vo rispetto a R2 nel partitore di tensione a vuoto: Vo è la frazione R2/(R1+R2) di Vi.",
        "Mostra Vo versus R2 no divisor de tensão em vazio: Vo é a fração R2/(R1+R2) de Vi.",
    ),
    "DIV-002": (
        "Reparte la corriente total entre ramas: por R1 circula IT R2/(R1+R2).",
        "Splits the total current between branches: I1 = IT R2/(R1+R2).",
        "Teilt den Gesamtstrom: durch R1 fließt IT R2/(R1+R2).",
        "Répartit le courant total : I1 = IT R2/(R1+R2).",
        "Ripartisce la corrente totale: I1 = IT R2/(R1+R2).",
        "Reparte a corrente total: I1 = IT R2/(R1+R2).",
    ),
    "DIV-003": (
        "La carga RL en paralelo con R2 baja Vo respecto del divisor descargado.",
        "Load RL in parallel with R2 lowers Vo versus the unloaded divider.",
        "Die Last RL parallel zu R2 senkt Vo gegenüber dem unbelasteten Teiler.",
        "La charge RL en parallèle avec R2 abaisse Vo par rapport au diviseur à vide.",
        "Il carico RL in parallelo a R2 abbassa Vo rispetto al partitore a vuoto.",
        "A carga RL em paralelo com R2 reduz Vo em relação ao divisor em vazio.",
    ),
    "DIV-006": (
        "VTh es la tensión en vacío del equivalente Thévenin que sustituye a la red.",
        "VTh is the open-circuit voltage of the Thévenin equivalent that replaces the network.",
        "VTh ist die Leerlaufspannung des Thévenin-Ersatzes der Schaltung.",
        "VTh est la tension à vide de l'équivalent de Thévenin qui remplace le réseau.",
        "VTh è la tensione a vuoto dell'equivalente di Thévenin che sostituisce la rete.",
        "VTh é a tensão em vazio do equivalente de Thévenin que substitui a rede.",
    ),
    "DIV-007": (
        "RTh es la resistencia vista desde los bornes con fuentes independientes anuladas.",
        "RTh is the resistance seen at the terminals with independent sources killed.",
        "RTh ist der Widerstand an den Klemmen bei abgeschalteten unabhängigen Quellen.",
        "RTh est la résistance vue aux bornes sources indépendantes annulées.",
        "RTh è la resistenza vista ai morsetti con le sorgenti indipendenti annullate.",
        "RTh é a resistência vista nos terminais com fontes independentes anuladas.",
    ),
    "DIV-008": (
        "IN es la corriente de cortocircuito del equivalente Norton.",
        "IN is the short-circuit current of the Norton equivalent.",
        "IN ist der Kurzschlussstrom des Norton-Ersatzes.",
        "IN est le courant de court-circuit de l'équivalent de Norton.",
        "IN è la corrente di corto circuito dell'equivalente di Norton.",
        "IN é a corrente de curto-circuito do equivalente de Norton.",
    ),
    "DIV-009": (
        "RN coincide con RTh: misma resistencia en el equivalente Norton.",
        "RN equals RTh: the same resistance in the Norton equivalent.",
        "RN ist gleich RTh: derselbe Widerstand im Norton-Ersatz.",
        "RN vaut RTh : même résistance dans l'équivalent de Norton.",
        "RN coincide con RTh: stessa resistenza nell'equivalente di Norton.",
        "RN coincide com RTh: a mesma resistência no equivalente de Norton.",
    ),
    "DIV-010": (
        "Los equivalentes cumplen VTh = IN RN y se intercambian sin cambiar Vo sobre RL.",
        "The equivalents satisfy VTh = IN RN and swap without changing Vo on RL.",
        "Die Ersatzschaltungen erfüllen VTh = IN RN und sind für RL gleichwertig.",
        "Les équivalents vérifient VTh = IN RN et se substituent sans changer Vo sur RL.",
        "Gli equivalenti soddisfano VTh = IN RN e si scambiano senza cambiare Vo su RL.",
        "Os equivalentes cumprem VTh = IN RN e se trocam sem mudar Vo em RL.",
    ),
    "TRN-001": (
        "La respuesta completa es una exponencial que interpola v0 y v∞ con constante τ.",
        "The complete response is an exponential interpolating v0 and v∞ with time constant τ.",
        "Die vollständige Antwort interpoliert v0 und v∞ exponentiell mit τ.",
        "La réponse complète est une exponentielle entre v0 et v∞ avec τ.",
        "La risposta completa è un esponenziale tra v0 e v∞ con τ.",
        "A resposta completa é uma exponencial entre v0 e v∞ com τ.",
    ),
    "TRN-002": (
        "Carga del capacitor: v(t)=V(1−e^{−t/τ}) sube desde 0 hacia V en una exponencial.",
        "Capacitor charging: v(t)=V(1−e^{−t/τ}) rises from 0 toward V exponentially.",
        "Kondensatorladung: v(t)=V(1−e^{−t/τ}) steigt exponentiell von 0 nach V.",
        "Charge du condensateur : v(t)=V(1−e^{−t/τ}) croît de 0 vers V.",
        "Carica del condensatore: v(t)=V(1−e^{−t/τ}) sale da 0 verso V.",
        "Carga do capacitor: v(t)=V(1−e^{−t/τ}) sobe de 0 até V.",
    ),
    "TRN-003": (
        "Descarga del capacitor: v(t)=V e^{−t/τ} cae exponencialmente hacia 0.",
        "Capacitor discharge: v(t)=V e^{−t/τ} falls exponentially toward 0.",
        "Kondensatorentladung: v(t)=V e^{−t/τ} fällt exponentiell gegen 0.",
        "Décharge du condensateur : v(t)=V e^{−t/τ} décroît vers 0.",
        "Scarica del condensatore: v(t)=V e^{−t/τ} scende verso 0.",
        "Descarga do capacitor: v(t)=V e^{−t/τ} cai em direção a 0.",
    ),
    "TRN-005": (
        "La corriente RL interpola i0 e i∞ con τ=L/R.",
        "The RL current interpolates i0 and i∞ with τ=L/R.",
        "Der RL-Strom interpoliert i0 und i∞ mit τ=L/R.",
        "Le courant RL interpole i0 et i∞ avec τ=L/R.",
        "La corrente RL interpola i0 e i∞ con τ=L/R.",
        "A corrente RL interpola i0 e i∞ com τ=L/R.",
    ),
    "TRN-006": (
        "Establecimiento de iL: la corriente del inductor crece como 1−e^{−t/τ}.",
        "iL build-up: inductor current grows as 1−e^{−t/τ}.",
        "iL-Aufbau: der Spulenstrom wächst wie 1−e^{−t/τ}.",
        "Établissement de iL : le courant croît comme 1−e^{−t/τ}.",
        "Stabilirsi di iL: la corrente cresce come 1−e^{−t/τ}.",
        "Estabelecimento de iL: a corrente cresce como 1−e^{−t/τ}.",
    ),
    "TRN-007": (
        "Descarga de iL: la corriente del inductor cae como e^{−t/τ}.",
        "iL decay: inductor current falls as e^{−t/τ}.",
        "iL-Abbau: der Spulenstrom fällt wie e^{−t/τ}.",
        "Décroissance de iL : le courant tombe comme e^{−t/τ}.",
        "Decadimento di iL: la corrente scende come e^{−t/τ}.",
        "Decaimento de iL: a corrente cai como e^{−t/τ}.",
    ),
    "RLC-004": (
        "Sobreamortiguado (ζ>1): suma de dos exponenciales sin oscilar.",
        "Overdamped (ζ>1): sum of two exponentials with no oscillation.",
        "Überdämpft (ζ>1): Summe zweier Exponentiale ohne Schwingung.",
        "Suramorti (ζ>1) : somme de deux exponentielles sans oscillation.",
        "Sovrasmorzato (ζ>1): somma di due esponenziali senza oscillazione.",
        "Superamortecido (ζ>1): soma de duas exponenciais sem oscilação.",
    ),
    "RLC-005": (
        "Críticamente amortiguado (ζ=1): frontera más rápida sin cruzar el eje oscilando.",
        "Critically damped (ζ=1): fastest return that does not oscillate.",
        "Kritisch gedämpft (ζ=1): schnellste Rückkehr ohne Schwingung.",
        "Amorti critique (ζ=1) : retour le plus rapide sans osciller.",
        "Criticamente smorzato (ζ=1): ritorno più rapido senza oscillare.",
        "Criticamente amortecido (ζ=1): retorno mais rápido sem oscilar.",
    ),
    "RLC-006": (
        "Subamortiguado (ζ<1): oscilación que decae a frecuencia ωd.",
        "Underdamped (ζ<1): oscillation that decays at ωd.",
        "Unterdämpft (ζ<1): abklingende Schwingung mit ωd.",
        "Sous-amorti (ζ<1) : oscillation qui décroît à ωd.",
        "Sottosmorzato (ζ<1): oscillazione che decade a ωd.",
        "Subamortecido (ζ<1): oscilação que decai em ωd.",
    ),
    "FAS-001": (
        "La sinusoide v(t)=Vp cos(ωt+φ) es la proyección del fasor giratorio.",
        "The sinusoid v(t)=Vp cos(ωt+φ) is the projection of the rotating phasor.",
        "Die Sinuswelle v(t)=Vp cos(ωt+φ) ist die Projektion des Zeigers.",
        "La sinusoïde v(t)=Vp cos(ωt+φ) est la projection du phaseur tournant.",
        "La sinusoide v(t)=Vp cos(ωt+φ) è la proiezione del fasore rotante.",
        "A senóide v(t)=Vp cos(ωt+φ) é a projeção do fasor giratório.",
    ),
    "FAS-003": (
        "El valor RMS Vp/√2 es la longitud del fasor eficaz.",
        "The RMS value Vp/√2 is the length of the RMS phasor.",
        "Der Effektivwert Vp/√2 ist die Länge des Zeigers.",
        "La valeur RMS Vp/√2 est la longueur du phaseur efficace.",
        "Il valore RMS Vp/√2 è la lunghezza del fasore efficace.",
        "O valor RMS Vp/√2 é o comprimento do fasor eficaz.",
    ),
    "FAS-008": (
        "Z=R+jX es el cateto R y el cateto X del triángulo de impedancia.",
        "Z=R+jX is the R and X legs of the impedance triangle.",
        "Z=R+jX sind die Katheten R und X des Impedanzdreiecks.",
        "Z=R+jX sont les côtés R et X du triangle d'impédance.",
        "Z=R+jX sono i cateti R e X del triangolo di impedenza.",
        "Z=R+jX são os catetos R e X do triângulo de impedância.",
    ),
    "FAS-009": (
        "La admitancia Y=1/Z invierte el módulo y cambia de signo el ángulo.",
        "Admittance Y=1/Z inverts the magnitude and flips the angle sign.",
        "Die Admittanz Y=1/Z kehrt den Betrag um und ändert das Vorzeichen des Winkels.",
        "L'admittance Y=1/Z inverse le module et change le signe de l'angle.",
        "L'ammettenza Y=1/Z inverte il modulo e cambia il segno dell'angolo.",
        "A admitância Y=1/Z inverte o módulo e troca o sinal do ângulo.",
    ),
    "FAS-011": (
        "Con Z=R+jX la reactancia capacitiva es negativa: X_C=-1/(ωC). La magnitud es |X_C|=1/(ωC) y Z_C=-j/(ωC).",
        "With Z=R+jX capacitive reactance is negative: X_C=-1/(ωC). The magnitude is |X_C|=1/(ωC) and Z_C=-j/(ωC).",
        "Mit Z=R+jX ist die kapazitive Reaktanz negativ: X_C=-1/(ωC). Der Betrag ist |X_C|=1/(ωC) und Z_C=-j/(ωC).",
        "Avec Z=R+jX la réactance capacitive est négative : X_C=-1/(ωC). Le module est |X_C|=1/(ωC) et Z_C=-j/(ωC).",
        "Con Z=R+jX la reattanza capacitiva è negativa: X_C=-1/(ωC). Il modulo è |X_C|=1/(ωC) e Z_C=-j/(ωC).",
        "Com Z=R+jX a reatância capacitiva é negativa: X_C=-1/(ωC). A magnitude é |X_C|=1/(ωC) e Z_C=-j/(ωC).",
    ),
    "PAC-005": (
        "El triángulo de potencias relaciona P, Q y S=√(P²+Q²).",
        "The power triangle relates P, Q and S=√(P²+Q²).",
        "Das Leistungsdreieck verbindet P, Q und S=√(P²+Q²).",
        "Le triangle des puissances relie P, Q et S=√(P²+Q²).",
        "Il triangolo delle potenze collega P, Q e S=√(P²+Q²).",
        "O triângulo de potências relaciona P, Q e S=√(P²+Q²).",
    ),
    "PAC-008": (
        "En resonancia serie XL=XC y |Z| es mínimo en ω0.",
        "At series resonance XL=XC and |Z| is minimum at ω0.",
        "Bei Reihenresonanz gilt XL=XC und |Z| ist minimal bei ω0.",
        "À la résonance série XL=XC et |Z| est minimal en ω0.",
        "In risonanza serie XL=XC e |Z| è minimo in ω0.",
        "Na ressonância série XL=XC e |Z| é mínimo em ω0.",
    ),
    "PAC-009": (
        "En resonancia paralelo |Z| es máximo en ω0.",
        "At parallel resonance |Z| is maximum at ω0.",
        "Bei Parallelresonanz ist |Z| maximal bei ω0.",
        "À la résonance parallèle |Z| est maximal en ω0.",
        "In risonanza parallelo |Z| è massimo in ω0.",
        "Na ressonância paralelo |Z| é máximo em ω0.",
    ),
    "FIL-001": (
        "El pasa-bajos RC |H|=1/√(1+(ωRC)²) cae tras el corte en el Bode.",
        "The RC low-pass |H|=1/√(1+(ωRC)²) rolls off after cutoff on the Bode plot.",
        "Der RC-Tiefpass |H|=1/√(1+(ωRC)²) fällt nach der Grenzfrequenz im Bode-Diagramm.",
        "Le passe-bas RC |H|=1/√(1+(ωRC)²) chute après la coupure sur le Bode.",
        "Il passa-basso RC |H|=1/√(1+(ωRC)²) scende dopo il taglio sul Bode.",
        "O passa-baixa RC |H|=1/√(1+(ωRC)²) cai após o corte no Bode.",
    ),
    "FIL-002": (
        "fc=1/(2π RC) es el corte donde |H| vale 1/√2 (−3 dB) en el Bode.",
        "fc=1/(2π RC) is the cutoff where |H| is 1/√2 (−3 dB) on the Bode plot.",
        "fc=1/(2π RC) ist die Grenzfrequenz mit |H|=1/√2 (−3 dB) im Bode-Diagramm.",
        "fc=1/(2π RC) est la coupure où |H|=1/√2 (−3 dB) sur le Bode.",
        "fc=1/(2π RC) è il taglio dove |H|=1/√2 (−3 dB) sul Bode.",
        "fc=1/(2π RC) é o corte onde |H|=1/√2 (−3 dB) no Bode.",
    ),
    "FIL-003": (
        "El pasa-altos RC sube +20 dB/dec por debajo de fc y se aproxima a 0 dB por encima del corte.",
        "The RC high-pass rises +20 dB/dec below fc and approaches 0 dB above cutoff.",
        "Der RC-Hochpass steigt unterhalb von fc mit +20 dB/dec und nähert sich oberhalb 0 dB.",
        "Le passe-haut RC monte de +20 dB/dec sous fc et tend vers 0 dB au-dessus de la coupure.",
        "Il passa-alto RC sale di +20 dB/dec sotto fc e tende a 0 dB sopra il taglio.",
        "O passa-alta RC sobe +20 dB/dec abaixo de fc e aproxima-se de 0 dB acima do corte.",
    ),
    "FIL-004": (
        "El pasa-bajos RL tiene el mismo Bode de primer orden que el RC pasa-bajos.",
        "The RL low-pass has the same first-order Bode shape as the RC low-pass.",
        "Der RL-Tiefpass hat denselben Bode-Verlauf erster Ordnung wie der RC-Tiefpass.",
        "Le passe-bas RL a la même pente de Bode du premier ordre que le RC.",
        "Il passa-basso RL ha lo stesso Bode del primo ordine del RC.",
        "O passa-baixa RL tem o mesmo Bode de primeira ordem do RC.",
    ),
    "DIO-003": (
        "La curva de Shockley I=Is(e^{v/(n VT)}−1) crece fuerte en directa.",
        "The Shockley curve I=Is(e^{v/(n VT)}−1) rises steeply in forward bias.",
        "Die Shockley-Kurve I=Is(e^{v/(n VT)}−1) steigt in Durchlassrichtung steil.",
        "La courbe de Shockley I=Is(e^{v/(n VT)}−1) croît fortement en direct.",
        "La curva di Shockley I=Is(e^{v/(n VT)}−1) cresce in diretta.",
        "A curva de Shockley I=Is(e^{v/(n VT)}−1) cresce em direta.",
    ),
    "DIO-005": (
        "El umbral ~0.7 V del silicio aproxima la rodilla de la curva IV.",
        "The ~0.7 V silicon threshold approximates the knee of the IV curve.",
        "Die Siliziumschwelle ~0,7 V nähert das Knie der IV-Kennlinie an.",
        "Le seuil ~0,7 V du silicium approxime le coude de la courbe IV.",
        "La soglia ~0,7 V del silicio approssima il ginocchio della curva IV.",
        "O limiar ~0,7 V do silício aproxima o joelho da curva IV.",
    ),
    "DIO-006": (
        "El rectificador de media onda deja pasar solo las alternancias positivas.",
        "The half-wave rectifier passes only the positive half-cycles.",
        "Der Einweggleichrichter lässt nur die positiven Halbwellen durch.",
        "Le redresseur simple alternance ne laisse passer que les alternances positives.",
        "Il raddrizzatore a una semionda lascia passare solo le semionde positive.",
        "O retificador de meia onda deixa passar só as alternâncias positivas.",
    ),
    "DIO-007": (
        "El rectificador de onda completa pliega ambas alternancias hacia positivo.",
        "The full-wave rectifier folds both half-cycles to positive.",
        "Der Vollweggleichrichter faltet beide Halbwellen ins Positive.",
        "Le redresseur double alternance rabat les deux alternances vers le positif.",
        "Il raddrizzatore a onda intera piega entrambe le semionde al positivo.",
        "O retificador de onda completa dobra ambas as alternâncias para o positivo.",
    ),
    "BJT-005": (
        "En la región activa de la recta de carga IC=β IB con VCE por encima de saturación.",
        "In the active region of the load line IC=β IB with VCE above saturation.",
        "Im aktiven Bereich der Arbeitsgeraden gilt IC=β IB bei VCE oberhalb der Sättigung.",
        "Dans la région active de la droite de charge IC=β IB avec VCE au-dessus de la saturation.",
        "Nella regione attiva della retta di carico IC=β IB con VCE sopra la saturazione.",
        "Na região ativa da reta de carga IC=β IB com VCE acima da saturação.",
    ),
    "BJT-006": (
        "En corte IB≈0 e IC≈0: el punto Q está en el extremo de VCE=VCC.",
        "In cutoff IB≈0 and IC≈0: the Q-point sits at VCE=VCC.",
        "Im Sperrbereich sind IB≈0 und IC≈0: der Arbeitspunkt liegt bei VCE=VCC.",
        "En blocage IB≈0 et IC≈0 : le point Q est à VCE=VCC.",
        "In interdizione IB≈0 e IC≈0: il punto Q è a VCE=VCC.",
        "No corte IB≈0 e IC≈0: o ponto Q está em VCE=VCC.",
    ),
    "BJT-007": (
        "En saturación VCE sat es pequeño e IC ya no sigue β IB.",
        "In saturation VCE sat is small and IC no longer follows β IB.",
        "In Sättigung ist VCE sat klein und IC folgt nicht mehr β IB.",
        "En saturation VCE sat est petit et IC ne suit plus β IB.",
        "In saturazione VCE sat è piccolo e IC non segue più β IB.",
        "Na saturação VCE sat é pequeno e IC já não segue β IB.",
    ),
    "BJT-008": (
        "La recta de carga une (VCC,0) con (0,VCC/RC); el punto Q recorre corte, activa y saturación.",
        "The load line joins (VCC,0) to (0,VCC/RC); the Q-point travels cutoff, active and saturation.",
        "Die Arbeitsgerade verbindet (VCC,0) mit (0,VCC/RC); Q durchläuft Sperr, Aktiv und Sättigung.",
        "La droite de charge joint (VCC,0) à (0,VCC/RC) ; Q parcourt blocage, actif et saturation.",
        "La retta di carico unisce (VCC,0) e (0,VCC/RC); Q percorre interdizione, attiva e saturazione.",
        "A reta de carga une (VCC,0) a (0,VCC/RC); Q percorre corte, ativa e saturação.",
    ),
    "OPA-004": (
        "El inversor usa el nudo virtual: Vo=−(Rf/Rin) Vin con v+≈v− a tierra.",
        "The inverting amp uses the virtual short: Vo=−(Rf/Rin) Vin with v+≈v− at ground.",
        "Der Invertierer nutzt den virtuellen Kurzschluss: Vo=−(Rf/Rin) Vin mit v+≈v− auf Masse.",
        "L'inverseur utilise le court-circuit virtuel : Vo=−(Rf/Rin) Vin avec v+≈v− à la masse.",
        "L'invertente usa il cortocircuito virtuale: Vo=−(Rf/Rin) Vin con v+≈v− a massa.",
        "O inversor usa o curto virtual: Vo=−(Rf/Rin) Vin com v+≈v− à massa.",
    ),
    "OPA-005": (
        "El no inversor da ganancia 1+Rf/Rg con entrada en v+ y nudo virtual.",
        "The non-inverting amp has gain 1+Rf/Rg with input on v+ and a virtual short.",
        "Der Nichtinvertierer hat Verstärkung 1+Rf/Rg mit Eingang an v+.",
        "Le non-inverseur a un gain 1+Rf/Rg, entrée sur v+.",
        "Il non invertente ha guadagno 1+Rf/Rg, ingresso su v+.",
        "O não inversor tem ganho 1+Rf/Rg, entrada em v+.",
    ),
    "OPA-006": (
        "El seguidor es un no inversor con ganancia 1: Vo=Vin.",
        "The follower is a non-inverting amp with gain 1: Vo=Vin.",
        "Der Folger ist ein Nichtinvertierer mit Verstärkung 1: Vo=Vin.",
        "Le suiveur est un non-inverseur de gain 1 : Vo=Vin.",
        "L'inseguitore è un non invertente con guadagno 1: Vo=Vin.",
        "O seguidor é um não inversor com ganho 1: Vo=Vin.",
    ),
    "FET-002": (
        "La sobreexcitación Vov=VGS−Vth mide cuánto supera VGS al umbral Vth, no es la tensión umbral.",
        "Overdrive Vov=VGS−Vth is how far VGS exceeds threshold Vth; it is not Vth itself.",
        "Die Overdrive-Spannung Vov=VGS−Vth misst, wie weit VGS über Vth liegt, nicht die Schwellspannung.",
        "L'overdrive Vov=VGS−Vth mesure l'écart de VGS au-dessus de Vth, ce n'est pas le seuil.",
        "L'overdrive Vov=VGS−Vth misura quanto VGS supera Vth; non è la soglia.",
        "A sobreexcitação Vov=VGS−Vth mede quanto VGS excede Vth; não é a tensão de limiar.",
    ),
    "FIL-006": (
        "La pendiente −20 dB/dec vale en la banda de caída de un pasa-bajos de primer orden; un pasa-altos sube +20 dB/dec por debajo de fc.",
        "The −20 dB/dec slope applies in the roll-off band of a first-order low-pass; a high-pass rises +20 dB/dec below fc.",
        "Die Steigung −20 dB/dec gilt im Abfallbereich eines Tiefpasses 1. Ordnung; ein Hochpass steigt unterhalb von fc mit +20 dB/dec.",
        "La pente −20 dB/dec vaut dans la bande de descente d'un passe-bas du 1er ordre ; un passe-haut monte de +20 dB/dec sous fc.",
        "La pendenza −20 dB/dec vale nella banda di discesa di un passa-basso del 1° ordine; un passa-alto sale di +20 dB/dec sotto fc.",
        "A pendente −20 dB/dec vale na banda de queda de um passa-baixa de 1.ª ordem; um passa-alta sobe +20 dB/dec abaixo de fc.",
    ),
    "OPA-009": (
        "El integrador produce una rampa Vo=−(1/RC)∫Vin dt en lazo negativo.",
        "The integrator produces a ramp Vo=−(1/RC)∫Vin dt with negative feedback.",
        "Der Integrator erzeugt eine Rampe Vo=−(1/RC)∫Vin dt.",
        "L'intégrateur produit une rampe Vo=−(1/RC)∫Vin dt.",
        "L'integratore produce una rampa Vo=−(1/RC)∫Vin dt.",
        "O integrador produz uma rampa Vo=−(1/RC)∫Vin dt.",
    ),
    "LGC-001": (
        "Los niveles VOH VOL VIH VIL delimitan alto y bajo válidos en la VTC.",
        "Levels VOH VOL VIH VIL bound valid high and low on the VTC.",
        "Die Pegel VOH VOL VIH VIL begrenzen gültiges High und Low auf der VTC.",
        "Les niveaux VOH VOL VIH VIL bornent le haut et le bas valides sur la VTC.",
        "I livelli VOH VOL VIH VIL delimitano alto e basso validi sulla VTC.",
        "Os níveis VOH VOL VIH VIL delimitam alto e baixo válidos na VTC.",
    ),
    "LGC-002": (
        "NMH=VOH−VIH es el margen de ruido alto entre salida alta y umbral de entrada alta.",
        "NMH=VOH−VIH is the high noise margin between a high output and VIH.",
        "NMH=VOH−VIH ist der hohe Rauschabstand zwischen High-Ausgang und VIH.",
        "NMH=VOH−VIH est la marge au bruit haute entre sortie haute et VIH.",
        "NMH=VOH−VIH è il margine di rumore alto tra uscita alta e VIH.",
        "NMH=VOH−VIH é a margem de ruído alta entre saída alta e VIH.",
    ),
    "LGC-007": (
        "La VTC CMOS invierte: Vin bajo da VOH y Vin alto da VOL, con umbral cerca de VDD/2.",
        "The CMOS VTC inverts: low Vin yields VOH and high Vin yields VOL, threshold near VDD/2.",
        "Die CMOS-VTC invertiert: kleines Vin ergibt VOH, großes Vin VOL, Schwelle nahe VDD/2.",
        "La VTC CMOS inverse : Vin bas donne VOH, Vin haut VOL, seuil près de VDD/2.",
        "La VTC CMOS inverte: Vin basso dà VOH, Vin alto VOL, soglia vicino a VDD/2.",
        "A VTC CMOS inverte: Vin baixo dá VOH, Vin alto VOL, limiar perto de VDD/2.",
    ),
    "SEQ-003": (
        "El flip-flop D muestrea D en el flanco de reloj y retiene Q hasta el siguiente.",
        "The D flip-flop samples D on the clock edge and holds Q until the next edge.",
        "Das D-Flipflop tastet D an der Taktflanke ab und hält Q bis zur nächsten.",
        "La bascule D échantillonne D sur le front d'horloge et retient Q.",
        "Il flip-flop D campiona D sul fronte di clock e mantiene Q.",
        "O flip-flop D amostra D na borda do clock e retém Q.",
    ),
    "SEQ-006": (
        "El tiempo de setup tsu es la ventana en que D debe ser estable antes del flanco.",
        "Setup time tsu is the window in which D must be stable before the clock edge.",
        "Die Setup-Zeit tsu ist das Fenster, in dem D vor der Flanke stabil sein muss.",
        "Le temps de setup tsu est la fenêtre où D doit être stable avant le front.",
        "Il tempo di setup tsu è la finestra in cui D deve essere stabile prima del fronte.",
        "O tempo de setup tsu é a janela em que D deve estar estável antes da borda.",
    ),
    "SEQ-007": (
        "El hold th es la ventana en que D debe permanecer estable después del flanco.",
        "Hold time th is the window in which D must stay stable after the clock edge.",
        "Die Hold-Zeit th ist das Fenster nach der Flanke, in dem D stabil bleiben muss.",
        "Le hold th est la fenêtre après le front pendant laquelle D reste stable.",
        "Il hold th è la finestra dopo il fronte in cui D resta stabile.",
        "O hold th é a janela após a borda em que D permanece estável.",
    ),
    "ADC-001": (
        "Nyquist exige fs>2 fmax para muestrear sin aliasing.",
        "Nyquist requires fs>2 fmax to sample without aliasing.",
        "Nyquist verlangt fs>2 fmax, um ohne Aliasing abzutasten.",
        "Nyquist exige fs>2 fmax pour échantillonner sans repliement.",
        "Nyquist richiede fs>2 fmax per campionare senza aliasing.",
        "Nyquist exige fs>2 fmax para amostrar sem aliasing.",
    ),
    "ADC-003": (
        "El paso de cuantización Δ=VFS/2^n es la altura de cada escalón digital.",
        "The quantization step Δ=VFS/2^n is the height of each digital stair.",
        "Die Quantisierungsstufe Δ=VFS/2^n ist die Höhe jeder digitalen Stufe.",
        "Le pas de quantification Δ=VFS/2^n est la hauteur de chaque palier.",
        "Il passo di quantizzazione Δ=VFS/2^n è l'altezza di ogni scalino.",
        "O passo de quantização Δ=VFS/2^n é a altura de cada degrau.",
    ),
    "ADC-005": (
        "El ciclo útil PWM δ=ton/T es la fracción de periodo en alto.",
        "PWM duty δ=ton/T is the fraction of the period spent high.",
        "Der PWM-Tastgrad δ=ton/T ist der Hochanteil der Periode.",
        "Le rapport cyclique PWM δ=ton/T est la fraction haute de la période.",
        "Il duty PWM δ=ton/T è la frazione alta del periodo.",
        "O duty PWM δ=ton/T é a fração alta do período.",
    ),
    "ADC-006": (
        "El DAC R-2R suma pesos binarios de la escalera para reconstruir la tensión.",
        "The R-2R DAC sums binary ladder weights to reconstruct the voltage.",
        "Der R-2R-DAC summiert binäre Leitergewichte zur Spannung.",
        "Le CNA R-2R somme les poids binaires de l'échelle.",
        "Il DAC R-2R somma i pesi binari della scala.",
        "O DAC R-2R soma os pesos binários da escada.",
    ),
}

PREFIX_VARS = {
    "DIV": r"\(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).",
    "REA": r"\(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).",
    "TRN": r"\(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.",
    "RLC": r"\(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.",
    "FAS": r"\(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.",
    "PAC": r"\(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.",
    "FIL": r"\(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.",
    "XFR": r"\(V_1,V_2\): V; \(I_1,I_2\): A; \(N_1,N_2,n\): espiras o relación; \(Z_L,Z_{\mathrm{in}}\): Ω; \(\eta\): adimensional.",
    "DIO": r"\(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.",
    "BJT": r"\(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.",
    "FET": r"\(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.",
    "OPA": r"\(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.",
    "LGC": r"\(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.",
    "CMB": r"Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).",
    "SEQ": r"\(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.",
    "ADC": r"\(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): adimensional; \(t_{\mathrm{on}},T\): s.",
}

PREFIX_COND = {
    "DIV": "Red lineal resistiva en DC; divisor descargado salvo que se indique RL.",
    "REA": "Elementos lineales ideales; polaridad pasiva.",
    "TRN": "Circuito de primer orden lineal a trozos constantes; τ>0.",
    "RLC": "RLC lineal; valores positivos de R, L y C.",
    "FAS": "Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.",
    "PAC": "Sinusoides RMS de la misma frecuencia; convención pasiva.",
    "FIL": "Filtro lineal invariante; carga alta salvo indicación.",
    "XFR": "Transformador ideal salvo que se cite rendimiento o Faraday.",
    "DIO": "Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.",
    "BJT": "NPN de señal salvo indicación; respetar la región (activa, corte, saturación).",
    "FET": "NMOS de enriquecimiento salvo JFET; polarización en la región citada.",
    "OPA": "Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.",
    "LGC": "Familia lógica con alimentación fija; niveles medidos en estático.",
    "CMB": "Lógica combinacional sin memoria; hazards dependen del retardo de puertas.",
    "SEQ": "Flanco activo indicado; respetar tsu y th.",
    "ADC": "Convertidor ideal, señal limitada en banda y rango.",
}

PREFIX_UNIT = {
    "DIV": "V, A u Ω según el lado izquierdo",
    "REA": "F, H, J o s según el lado izquierdo",
    "TRN": "V, A o s según el lado izquierdo",
    "RLC": "rad/s o adimensional según el lado izquierdo",
    "FAS": "V, rad/s, Ω o S según el lado izquierdo",
    "PAC": "W, var, VA o adimensional",
    "FIL": "adimensional, Hz o dB",
    "XFR": "V, A, Ω o adimensional",
    "DIO": "V, A o eV",
    "BJT": "A, V, S u Ω",
    "FET": "A, V, S u Ω",
    "OPA": "V o adimensional",
    "LGC": "V, s o adimensional",
    "CMB": "adimensional (lógica)",
    "SEQ": "s, Hz o adimensional",
    "ADC": "Hz, V o adimensional",
}

VARS_I18N = {
    "en": {
        "DIV": r"\(V_i,V_o\): voltages (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistances (Ω); \(I_T,I_N\): currents (A).",
        "REA": r"\(C,C_{\mathrm{eq}}\): capacitances (F); \(L,M\): inductances (H); \(v,i\): voltage (V) and current (A); \(\tau\): time constant (s); \(k\): coupling (dimensionless).",
        "TRN": r"\(v(t),v_0,v_\infty\): voltages (V); \(i(t),i_0,i_\infty\): currents (A); \(\tau\): time constant (s); \(t\): time (s); \(R,C,L\): Ω, F, H.",
        "RLC": r"\(\omega_0,\omega_d\): frequencies (rad/s); \(\alpha\): damping (s^{-1}); \(\zeta,Q\): dimensionless; \(R,L,C\): Ω, H, F.",
        "FAS": r"\(V_p\): peak (V); \(V_{\mathrm{rms}}\): RMS (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.",
        "PAC": r"\(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.",
        "FIL": r"\(H(j\omega)\): dimensionless; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): dimensionless.",
        "XFR": r"\(V_1,V_2\): V; \(I_1,I_2\): A; \(N_1,N_2,n\): turns or ratio; \(Z_L,Z_{\mathrm{in}}\): Ω; \(\eta\): dimensionless.",
        "DIO": r"\(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): ideality factor; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.",
        "BJT": r"\(I_C,I_B,I_E\): A; \(\alpha,\beta\): dimensionless; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.",
        "FET": r"\(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.",
        "OPA": r"\(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): gain (dimensionless); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): dimensionless.",
        "LGC": r"\(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out and fan-in: dimensionless.",
        "CMB": r"Logic inputs and outputs \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. The Karnaugh map minimizes; it does not recatalog identities (`ALG-BOO-*`).",
        "SEQ": r"\(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits or modulus; \(f_{\max}\): Hz.",
        "ADC": r"\(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): dimensionless; \(t_{\mathrm{on}},T\): s.",
    }
}

# Fill de/fr/it/pt variables with EN as fallback then overlay a few corrections later.
for loc in ("de", "fr", "it", "pt"):
    VARS_I18N[loc] = dict(VARS_I18N["en"])

COND_I18N = {
    "en": {k: v.replace("Red lineal resistiva en DC; divisor descargado salvo que se indique RL.", "Linear resistive DC network; unloaded divider unless RL is stated.")
           for k, v in PREFIX_COND.items()}
}
COND_I18N["en"] = {
    "DIV": "Linear resistive DC network; unloaded divider unless RL is stated.",
    "REA": "Ideal linear elements; passive sign convention.",
    "TRN": "Piecewise-constant linear first-order circuit; τ>0.",
    "RLC": "Linear RLC; positive R, L and C.",
    "FAS": "Sinusoidal steady state; RMS phasors unless a peak is stated.",
    "PAC": "RMS sinusoids of the same frequency; passive convention.",
    "FIL": "Linear time-invariant filter; light load unless stated.",
    "XFR": "Ideal transformer unless efficiency or Faraday is cited.",
    "DIO": "Stated model (Shockley, threshold or Zener); temperature sits in VT.",
    "BJT": "Small-signal NPN unless stated; stay in the named region.",
    "FET": "Enhancement NMOS unless JFET; bias in the cited region.",
    "OPA": "Ideal op-amp with negative feedback except comparator; |Vo| < Vsat.",
    "LGC": "Logic family on a fixed supply; static levels.",
    "CMB": "Combinational logic with no memory; hazards depend on gate delay.",
    "SEQ": "Named active edge; obey tsu and th.",
    "ADC": "Ideal converter, band-limited in-range signal.",
}
COND_I18N["de"] = {k: v for k, v in COND_I18N["en"].items()}
COND_I18N["fr"] = {k: v for k, v in COND_I18N["en"].items()}
COND_I18N["it"] = {k: v for k, v in COND_I18N["en"].items()}
COND_I18N["pt"] = {k: v for k, v in COND_I18N["en"].items()}
COND_I18N["de"] = {
    "DIV": "Lineares resistives DC-Netz; unbelasteter Teiler, sofern RL nicht genannt ist.",
    "REA": "Ideale lineare Elemente; passive Vorzeichenkonvention.",
    "TRN": "Stückweise konstantes lineares Netzwerk erster Ordnung; τ>0.",
    "RLC": "Lineares RLC; positive R, L und C.",
    "FAS": "Sinusförmiger eingeschwungener Zustand; RMS-Zeiger, falls kein Peak genannt ist.",
    "PAC": "RMS-Sinus gleicher Frequenz; passive Konvention.",
    "FIL": "Lineares zeitinvariantes Filter; hohe Lastimpedanz, falls nicht anders angegeben.",
    "XFR": "Idealtransformator, sofern nicht Wirkungsgrad oder Faraday genannt wird.",
    "DIO": "Genanntes Modell (Shockley, Schwellwert oder Zener); Temperatur steckt in VT.",
    "BJT": "NPN-Kleinsignal, sofern nicht anders; in der genannten Region bleiben.",
    "FET": "Anreicherungs-NMOS, außer JFET; Arbeitspunkt in der genannten Region.",
    "OPA": "Idealer OPV mit Gegenkopplung außer Komparator; |Vo| < Vsat.",
    "LGC": "Logikfamilie mit fester Versorgung; statische Pegel.",
    "CMB": "Kombinatorik ohne Speicher; Hazards hängen von Gatterlaufzeiten ab.",
    "SEQ": "Genannte aktive Flanke; tsu und th einhalten.",
    "ADC": "Idealer Wandler, bandbegrenztes Signal im Bereich.",
}
COND_I18N["fr"] = {
    "DIV": "Réseau résistif linéaire en DC ; diviseur à vide sauf si RL est indiquée.",
    "REA": "Éléments linéaires idéaux ; convention passive.",
    "TRN": "Circuit du premier ordre linéaire par morceaux ; τ>0.",
    "RLC": "RLC linéaire ; R, L et C positifs.",
    "FAS": "Régime sinusoïdal permanent ; phaseurs RMS sauf pic indiqué.",
    "PAC": "Sinusoïdes RMS de même fréquence ; convention passive.",
    "FIL": "Filtre linéaire invariant ; charge élevée sauf indication.",
    "XFR": "Transformateur idéal sauf rendement ou Faraday cités.",
    "DIO": "Modèle indiqué (Shockley, seuil ou Zener) ; la température est dans VT.",
    "BJT": "NPN petit signal sauf indication ; rester dans la région nommée.",
    "FET": "NMOS à enrichissement sauf JFET ; polarisation dans la région citée.",
    "OPA": "AOP idéal en contre-réaction sauf comparateur ; |Vo| < Vsat.",
    "LGC": "Famille logique à alimentation fixe ; niveaux statiques.",
    "CMB": "Logique combinatoire sans mémoire ; les aléas dépendent des délais.",
    "SEQ": "Front actif indiqué ; respecter tsu et th.",
    "ADC": "Convertisseur idéal, signal limité en bande et en amplitude.",
}
COND_I18N["it"] = {
    "DIV": "Rete resistiva lineare in DC; partitore a vuoto salvo RL indicata.",
    "REA": "Elementi lineari ideali; convenzione passiva.",
    "TRN": "Circuito del primo ordine lineare a tratti; τ>0.",
    "RLC": "RLC lineare; R, L e C positivi.",
    "FAS": "Regime sinusoidale permanente; fasori RMS salvo picco indicato.",
    "PAC": "Sinusoidi RMS alla stessa frequenza; convenzione passiva.",
    "FIL": "Filtro lineare invariante; carico elevato salvo indicazione.",
    "XFR": "Trasformatore ideale salvo rendimento o Faraday.",
    "DIO": "Modello indicato (Shockley, soglia o Zener); la temperatura è in VT.",
    "BJT": "NPN di piccolo segnale salvo indicazione; restare nella regione nominata.",
    "FET": "NMOS a arricchimento salvo JFET; polarizzazione nella regione citata.",
    "OPA": "Operazionale ideale in controreazione salvo comparatore; |Vo| < Vsat.",
    "LGC": "Famiglia logica a alimentazione fissa; livelli statici.",
    "CMB": "Logica combinatoria senza memoria; gli alea dipendono dai ritardi.",
    "SEQ": "Fronte attivo indicato; rispettare tsu e th.",
    "ADC": "Convertitore ideale, segnale limitato in banda e ampiezza.",
}
COND_I18N["pt"] = {
    "DIV": "Rede resistiva linear em DC; divisor em vazio salvo se RL for indicada.",
    "REA": "Elementos lineares ideais; convenção passiva.",
    "TRN": "Circuito de primeira ordem linear por trechos; τ>0.",
    "RLC": "RLC linear; R, L e C positivos.",
    "FAS": "Regime senoidal permanente; fasores RMS salvo pico indicado.",
    "PAC": "Senoides RMS da mesma frequência; convenção passiva.",
    "FIL": "Filtro linear invariante; carga elevada salvo indicação.",
    "XFR": "Transformador ideal salvo rendimento ou Faraday.",
    "DIO": "Modelo indicado (Shockley, limiar ou Zener); a temperatura está em VT.",
    "BJT": "NPN de pequeno sinal salvo indicação; permanecer na região nomeada.",
    "FET": "NMOS de enriquecimento salvo JFET; polarização na região citada.",
    "OPA": "Operacional ideal em realimentação negativa salvo comparador; |Vo| < Vsat.",
    "LGC": "Família lógica com alimentação fixa; níveis estáticos.",
    "CMB": "Lógica combinacional sem memória; hazards dependem dos atrasos.",
    "SEQ": "Borda ativa indicada; respeitar tsu e th.",
    "ADC": "Conversor ideal, sinal limitado em banda e amplitude.",
}

UNIT_I18N = {
    "en": {
        "DIV": "V, A or Ω according to the left-hand side",
        "REA": "F, H, J or s according to the left-hand side",
        "TRN": "V, A or s according to the left-hand side",
        "RLC": "rad/s or dimensionless according to the left-hand side",
        "FAS": "V, rad/s, Ω or S according to the left-hand side",
        "PAC": "W, var, VA or dimensionless",
        "FIL": "dimensionless, Hz or dB",
        "XFR": "V, A, Ω or dimensionless",
        "DIO": "V, A or eV",
        "BJT": "A, V, S or Ω",
        "FET": "A, V, S or Ω",
        "OPA": "V or dimensionless",
        "LGC": "V, s or dimensionless",
        "CMB": "dimensionless (logic)",
        "SEQ": "s, Hz or dimensionless",
        "ADC": "Hz, V or dimensionless",
    },
    "de": {
        "DIV": "V, A oder Ω je nach linker Seite",
        "REA": "F, H, J oder s je nach linker Seite",
        "TRN": "V, A oder s je nach linker Seite",
        "RLC": "rad/s oder dimensionslos je nach linker Seite",
        "FAS": "V, rad/s, Ω oder S je nach linker Seite",
        "PAC": "W, var, VA oder dimensionslos",
        "FIL": "dimensionslos, Hz oder dB",
        "XFR": "V, A, Ω oder dimensionslos",
        "DIO": "V, A oder eV",
        "BJT": "A, V, S oder Ω",
        "FET": "A, V, S oder Ω",
        "OPA": "V oder dimensionslos",
        "LGC": "V, s oder dimensionslos",
        "CMB": "dimensionslos (Logik)",
        "SEQ": "s, Hz oder dimensionslos",
        "ADC": "Hz, V oder dimensionslos",
    },
    "fr": {
        "DIV": "V, A ou Ω selon le membre de gauche",
        "REA": "F, H, J ou s selon le membre de gauche",
        "TRN": "V, A ou s selon le membre de gauche",
        "RLC": "rad/s ou adimensionnel selon le membre de gauche",
        "FAS": "V, rad/s, Ω ou S selon le membre de gauche",
        "PAC": "W, var, VA ou adimensionnel",
        "FIL": "adimensionnel, Hz ou dB",
        "XFR": "V, A, Ω ou adimensionnel",
        "DIO": "V, A ou eV",
        "BJT": "A, V, S ou Ω",
        "FET": "A, V, S ou Ω",
        "OPA": "V ou adimensionnel",
        "LGC": "V, s ou adimensionnel",
        "CMB": "adimensionnel (logique)",
        "SEQ": "s, Hz ou adimensionnel",
        "ADC": "Hz, V ou adimensionnel",
    },
    "it": {
        "DIV": "V, A o Ω secondo il membro sinistro",
        "REA": "F, H, J o s secondo il membro sinistro",
        "TRN": "V, A o s secondo il membro sinistro",
        "RLC": "rad/s o adimensionale secondo il membro sinistro",
        "FAS": "V, rad/s, Ω o S secondo il membro sinistro",
        "PAC": "W, var, VA o adimensionale",
        "FIL": "adimensionale, Hz o dB",
        "XFR": "V, A, Ω o adimensionale",
        "DIO": "V, A o eV",
        "BJT": "A, V, S o Ω",
        "FET": "A, V, S o Ω",
        "OPA": "V o adimensionale",
        "LGC": "V, s o adimensionale",
        "CMB": "adimensionale (logica)",
        "SEQ": "s, Hz o adimensionale",
        "ADC": "Hz, V o adimensionale",
    },
    "pt": {
        "DIV": "V, A ou Ω conforme o lado esquerdo",
        "REA": "F, H, J ou s conforme o lado esquerdo",
        "TRN": "V, A ou s conforme o lado esquerdo",
        "RLC": "rad/s ou adimensional conforme o lado esquerdo",
        "FAS": "V, rad/s, Ω ou S conforme o lado esquerdo",
        "PAC": "W, var, VA ou adimensional",
        "FIL": "adimensional, Hz ou dB",
        "XFR": "V, A, Ω ou adimensional",
        "DIO": "V, A ou eV",
        "BJT": "A, V, S ou Ω",
        "FET": "A, V, S ou Ω",
        "OPA": "V ou adimensional",
        "LGC": "V, s ou adimensional",
        "CMB": "adimensional (lógica)",
        "SEQ": "s, Hz ou adimensional",
        "ADC": "Hz, V ou adimensional",
    },
}

DETAIL_FALLBACK = {
    "en": "Computes {title} from the circuit model and the stated conditions.",
    "de": "Berechnet {title} aus dem Schaltungsmodell und den genannten Bedingungen.",
    "fr": "Calcule {title} à partir du modèle de circuit et des conditions indiquées.",
    "it": "Calcola {title} dal modello di circuito e dalle condizioni indicate.",
    "pt": "Calcula {title} a partir do modelo de circuito e das condições indicadas.",
}

EXTRA_PHRASES: dict[str, dict[str, str]] = {
    "en": {},
    "de": {},
    "fr": {},
    "it": {},
    "pt": {},
}


PREFIX_INTUITIVE = {
    "DIV": "Para «{title}»: el divisor y Thévenin/Norton reducen la red a un puerto; una carga en paralelo con R2 baja Vo.",
    "REA": "Para «{title}»: C e L almacenan energía y no cambian vC ni iL en un salto; asociaciones cambian Ceq o Leq.",
    "TRN": "Para «{title}»: la exponencial interpola el valor inicial (continuo) y el asentamiento con constante τ.",
    "RLC": "Para «{title}»: ζ compara α con ω0 y decide si hay dos exponenciales, frontera o oscilación amortiguada.",
    "FAS": "Para «{title}»: el fasor RMS gira a ω; su proyección es la sinusoide y Z = R + jX resume el elemento.",
    "PAC": "Para «{title}»: P, Q y S forman el triángulo de potencia; en resonancia la reactancia neta se anula.",
    "FIL": "Para «{title}»: |H(jω)| muestra la banda que pasa y fc marca el punto −3 dB del Bode.",
    "XFR": "Para «{title}»: n = N2/N1 escala tensiones e invierte corrientes; ZL se refleja como ZL/n².",
    "DIO": "Para «{title}»: el diodo conduce fuerte tras el umbral; el rectificador recorta o pliega la sinusoide.",
    "BJT": "Para «{title}»: IB controla IC = β IB en activa; la recta de carga recorre corte, activa y saturación.",
    "FET": "Para «{title}»: VGS respecto de Vth abre el canal; en saturación ID depende de (VGS−Vth)².",
    "OPA": "Para «{title}»: con realimentación negativa v+ ≈ v− (nudo virtual) y la red de resistencias fija la ganancia.",
    "LGC": "Para «{title}»: VOH, VOL, VIH y VIL definen márgenes de ruido y la VTC CMOS invierte entre rieles.",
    "CMB": "Para «{title}»: la tabla de verdad y Karnaugh minimizan hardware; no reescriben identidades ALG-BOO.",
    "SEQ": "Para «{title}»: el flanco muestrea D; tsu y th marcan la ventana donde un cambio provoca metastabilidad.",
    "ADC": "Para «{title}»: fs > 2 fmax evita aliasing; n bits parte VFS en 2^n niveles y PWM usa el ciclo útil.",
}

PREFIX_ERRORS = {
    "DIV": "olvidar que RL queda en paralelo con R2; usar el divisor descargado con carga presente; mezclar kΩ con Ω",
    "REA": "sumar C en serie como si fueran R; olvidar que vC e iL son continuas; mezclar F con μF",
    "TRN": "confundir 0⁺ con 0⁻; usar τ=L/R en un RC o τ=RC en un RL; olvidar el valor de asentamiento",
    "RLC": "confundir α con ω0; clasificar ζ con R, L, C inconsistentes; olvidar el 2 en α=R/(2L)",
    "FAS": "mezclar pico con RMS; usar jωL con f en hertz sin 2π; olvidar el signo de −j/(ωC)",
    "PAC": "tomar |S| como P; olvidar el factor cos θ; aplicar resonancia serie a un paralelo",
    "FIL": "usar ωc en lugar de fc o al revés; olvidar la carga que desplaza el corte; mezclar dB con ganancia lineal",
    "XFR": "invertir n = N2/N1; olvidar que las corrientes se escalan al revés; reflejar ZL como n² ZL en el secundario",
    "DIO": "usar 0.7 V en inversa; olvidar el rizado del capacitor; mezclar media onda con onda completa en Vavg",
    "BJT": "usar IC=β IB en saturación; olvidar VCE(sat); invertir emisor y colector en el DCL",
    "FET": "aplicar la ley de Shockley del JFET a un MOSFET; olvidar Vth; polarizar en óhmica y usar la fórmula de saturación",
    "OPA": "olvidar el nudo virtual; usar la ganancia inversora en un no inversor; ignorar |Vo| < Vsat",
    "LGC": "confundir VIH con VOH; olvidar el margen de ruido; calcular fan-out sin corriente de entrada",
    "CMB": "duplicar identidades booleanas de álgebra; olvidar hazards estáticos; minterminos mal agrupados en Karnaugh",
    "SEQ": "ignorar tsu o th; tratar un latch transparente como flip-flop; olvidar el flanco activo",
    "ADC": "tomar fs = fmax como Nyquist; olvidar el ±Δ/2 del error; mezclar LSB con el número de niveles",
}

PREFIX_ANSWER = {
    "DIV": "Comprobar red resistiva en DC, referencias de signo y si hay carga en el divisor.",
    "REA": "Comprobar polaridad pasiva, continuidad de vC o iL y las unidades de C o L.",
    "TRN": "Fijar 0⁺, asentamiento y τ del circuito equivalente visto por C o L.",
    "RLC": "Calcular α y ω0 con los mismos R, L, C y clasificar ζ antes de escribir v(t).",
    "FAS": "Trabajar en RMS, convertir f a ω=2πf y respetar el signo de las reactancias.",
    "PAC": "Usar RMS de la misma frecuencia y distinguir P, Q y |S|.",
    "FIL": "Identificar el tipo de filtro, fc y el efecto de la carga sobre H(jω).",
    "XFR": "Fijar n=N2/N1, el lado del reflejo de impedancia y si el modelo es ideal.",
    "DIO": "Elegir el modelo (umbral, Shockley o Zener) y el intervalo de conducción.",
    "BJT": "Identificar la región (corte, activa, saturación) antes de usar β o VCE(sat).",
    "FET": "Comprobar tipo (NMOS/JFET), VGS vs Vth y si está en saturación u óhmica.",
    "OPA": "Confirmar realimentación negativa, nudo virtual y que Vo no satura.",
    "LGC": "Usar los niveles de la familia y medir márgenes en estático.",
    "CMB": "Partir de la tabla de verdad y no redefinir identidades de ALG-BOO.",
    "SEQ": "Respetar el flanco activo y las ventanas tsu y th.",
    "ADC": "Verificar Nyquist, el rango VFS y el número de bits.",
}

PREFIX_ALIASES = {
    "DIV": "divisor de tensión, divisor de corriente, Thévenin, Norton, voltage divider",
    "REA": "capacitor serie, inductor paralelo, constante de tiempo, energía almacenada",
    "TRN": "transitorio RC, transitorio RL, carga del capacitor, descarga exponencial",
    "RLC": "amortiguamiento, zeta, frecuencia natural, oscilación subamortiguada",
    "FAS": "fasor RMS, impedancia, reactancia, admitancia, sinusoidal steady state",
    "PAC": "potencia activa, potencia reactiva, factor de potencia, resonancia serie",
    "FIL": "filtro pasa-bajos, frecuencia de corte, diagrama de Bode, −3 dB",
    "XFR": "relación de transformación, impedancia reflejada, transformador ideal",
    "DIO": "diodo Shockley, umbral 0.7 V, rectificador, rizado, Zener",
    "BJT": "beta, recta de carga, región activa, saturación, punto Q",
    "FET": "MOSFET, Vth, transconductancia, RDS(on), JFET Shockley",
    "OPA": "amplificador inversor, no inversor, nudo virtual, CMRR, comparador",
    "LGC": "VOH VOL, margen de ruido, VTC CMOS, fan-out, tiempo de propagación",
    "CMB": "multiplexor, decoder, sumador completo, Karnaugh, hazard estático",
    "SEQ": "flip-flop D, tiempo de setup, hold, contador, máquina de Moore",
    "ADC": "Nyquist, cuantización, PWM, DAC R-2R, ADC flash",
}

# Per-ID fields that must not be clobbered by the prefix defaults.
COND_OVERRIDES = {
    "REA-003": "Inductores lineales ideales sin acoplamiento magnético (M=0); polaridad pasiva.",
    "REA-004": "Inductores lineales ideales sin acoplamiento magnético (M=0); polaridad pasiva.",
    "SEQ-001": "Latch SR sensible al nivel de Enable, no al flanco; la combinación S=R=1 está prohibida.",
    "SEQ-002": "Latch D transparente mientras Enable está activo (nivel); no usa flanco de reloj.",
    "FIL-006": "Pendiente −20 dB/dec en la banda de caída de un pasa-bajos de primer orden; un pasa-altos sube +20 dB/dec por debajo de fc.",
}
COND_OVERRIDE_I18N = {
    "REA-003": {
        "en": "Ideal linear inductors with no magnetic coupling (M=0); passive sign convention.",
        "de": "Ideale lineare Induktivitäten ohne magnetische Kopplung (M=0); passive Vorzeichenkonvention.",
        "fr": "Inductances linéaires idéales sans couplage magnétique (M=0) ; convention passive.",
        "it": "Induttori lineari ideali senza accoppiamento magnetico (M=0); convenzione passiva.",
        "pt": "Indutores lineares ideais sem acoplamento magnético (M=0); convenção passiva.",
    },
    "SEQ-001": {
        "en": "SR latch sensitive to the Enable level, not an edge; S=R=1 is forbidden.",
        "de": "SR-Latch pegelgesteuert über Enable, nicht flankengetriggert; S=R=1 ist verboten.",
        "fr": "Latch SR sensible au niveau de Enable, pas à un front ; S=R=1 est interdit.",
        "it": "Latch SR sensibile al livello di Enable, non al fronte; S=R=1 è vietato.",
        "pt": "Latch SR sensível ao nível de Enable, não à borda; S=R=1 é proibido.",
    },
    "SEQ-002": {
        "en": "D latch transparent while Enable is active (level); it is not clock-edge sampled.",
        "de": "D-Latch transparent, solange Enable aktiv (Pegel) ist; keine Taktflanke.",
        "fr": "Latch D transparent tant que Enable est actif (niveau) ; pas d’échantillonnage sur front.",
        "it": "Latch D trasparente mentre Enable è attivo (livello); non campiona sul fronte di clock.",
        "pt": "Latch D transparente enquanto Enable está ativo (nível); não amostra no flanco de relógio.",
    },
    "FIL-006": {
        "en": "The −20 dB/dec slope applies in the roll-off band of a first-order low-pass; a high-pass rises +20 dB/dec below fc.",
        "de": "Die Steigung −20 dB/dec gilt im Abfallbereich eines Tiefpasses 1. Ordnung; ein Hochpass steigt unterhalb von fc mit +20 dB/dec.",
        "fr": "La pente −20 dB/dec vaut dans la bande de descente d’un passe-bas du 1er ordre ; un passe-haut monte de +20 dB/dec sous fc.",
        "it": "La pendenza −20 dB/dec vale nella banda di discesa di un passa-basso del 1° ordine; un passa-alto sale di +20 dB/dec sotto fc.",
        "pt": "A pendente −20 dB/dec vale na banda de queda de um passa-baixa de 1.ª ordem; um passa-alta sobe +20 dB/dec abaixo de fc.",
    },
}
COND_OVERRIDE_I18N["REA-004"] = COND_OVERRIDE_I18N["REA-003"]

ALIAS_OVERRIDES = {
    "FIL-003": "filtro pasa-altos, frecuencia de corte, diagrama de Bode, −3 dB",
}
ALIAS_OVERRIDE_I18N = {
    "FIL-003": {
        "en": "high-pass filter, cutoff frequency, Bode plot, −3 dB",
        "de": "Hochpassfilter, Grenzfrequenz, Bode-Diagramm, −3 dB",
        "fr": "filtre passe-haut, fréquence de coupure, diagramme de Bode, −3 dB",
        "it": "filtro passa-alto, frequenza di taglio, diagramma di Bode, −3 dB",
        "pt": "filtro passa-alta, frequência de corte, diagrama de Bode, −3 dB",
    },
}

VARS_OVERRIDES = {
    "DIV-002": r"\(I_T,I_1,I_2\): corrientes (A); \(R_1,R_2\): resistencias (Ω).",
    "SEQ-001": r"\(S,R,Q,Q^+\): bits; Enable: nivel de habilitación (no flanco).",
    "OPA-009": r"\(v_{\mathrm{in}},v_o\): V; \(R,C\): Ω, F; \(\tau=RC\): s.",
    "ADC-006": r"\(V_o,V_{\mathrm{ref}}\): V; \(b_k\): bits; \(n\): bits; \(R\): Ω de la escalera.",
}
VARS_OVERRIDE_I18N = {
    "DIV-002": {
        "en": r"\(I_T,I_1,I_2\): currents (A); \(R_1,R_2\): resistances (Ω).",
        "de": r"\(I_T,I_1,I_2\): Ströme (A); \(R_1,R_2\): Widerstände (Ω).",
        "fr": r"\(I_T,I_1,I_2\) : courants (A) ; \(R_1,R_2\) : résistances (Ω).",
        "it": r"\(I_T,I_1,I_2\): correnti (A); \(R_1,R_2\): resistenze (Ω).",
        "pt": r"\(I_T,I_1,I_2\): correntes (A); \(R_1,R_2\): resistências (Ω).",
    },
    "SEQ-001": {
        "en": r"\(S,R,Q,Q^+\): bits; Enable: enable level (not an edge).",
        "de": r"\(S,R,Q,Q^+\): Bits; Enable: Freigabepegel (keine Flanke).",
        "fr": r"\(S,R,Q,Q^+\) : bits ; Enable : niveau d’autorisation (pas un front).",
        "it": r"\(S,R,Q,Q^+\): bit; Enable: livello di abilitazione (non un fronte).",
        "pt": r"\(S,R,Q,Q^+\): bits; Enable: nível de habilitação (não é flanco).",
    },
    "OPA-009": {
        "en": r"\(v_{\mathrm{in}},v_o\): V; \(R,C\): Ω, F; \(\tau=RC\): s.",
        "de": r"\(v_{\mathrm{in}},v_o\): V; \(R,C\): Ω, F; \(\tau=RC\): s.",
        "fr": r"\(v_{\mathrm{in}},v_o\) : V ; \(R,C\) : Ω, F ; \(\tau=RC\) : s.",
        "it": r"\(v_{\mathrm{in}},v_o\): V; \(R,C\): Ω, F; \(\tau=RC\): s.",
        "pt": r"\(v_{\mathrm{in}},v_o\): V; \(R,C\): Ω, F; \(\tau=RC\): s.",
    },
    "ADC-006": {
        "en": r"\(V_o,V_{\mathrm{ref}}\): V; \(b_k\): bits; \(n\): bits; \(R\): ladder Ω.",
        "de": r"\(V_o,V_{\mathrm{ref}}\): V; \(b_k\): Bits; \(n\): Bits; \(R\): Leiter-Ω.",
        "fr": r"\(V_o,V_{\mathrm{ref}}\) : V ; \(b_k\) : bits ; \(n\) : bits ; \(R\) : Ω de l’échelle.",
        "it": r"\(V_o,V_{\mathrm{ref}}\): V; \(b_k\): bit; \(n\): bit; \(R\): Ω della scala.",
        "pt": r"\(V_o,V_{\mathrm{ref}}\): V; \(b_k\): bits; \(n\): bits; \(R\): Ω da escada.",
    },
}

INTUITIVE_OVERRIDES = {
    "DIV-002": "Para «Divisor de corriente»: la rama de menor resistencia lleva más corriente; I1=IT R2/(R1+R2).",
    "SEQ-001": "Para «Latch SR»: Q sigue S y R mientras Enable está alto; S=R=1 es inválido.",
    "SEQ-002": "Para «Latch D»: Q copia D mientras Enable está activo; al bajar Enable, Q se retiene.",
    "OPA-009": "Para «Integrador inversor»: C en la realimentación integra Vin; Vo es la rampa −(1/RC)∫Vin dt.",
    "ADC-006": "Para «DAC de escalera R-2R»: cada bit bk aporta Vref/2^k a través de la red R y 2R.",
    "FIL-006": "Para «Pendiente de primer orden»: m=−20 dB/dec describe la banda de caída del pasa-bajos, no todo el Bode.",
    "FAS-011": "Para «Magnitud de la reactancia capacitiva»: |X_C|=1/(ωC) es la magnitud; con Z=R+jX, X_C=-1/(ωC) y Z_C=-j/(ωC).",
}
INTUITIVE_OVERRIDE_I18N = {
    "DIV-002": {
        "en": "For “Current divider”: the smaller resistor carries more current; I1=IT R2/(R1+R2).",
        "de": "Für „Stromteiler“: der kleinere Widerstand führt mehr Strom; I1=IT R2/(R1+R2).",
        "fr": "Pour « Diviseur de courant » : la plus petite résistance porte plus de courant ; I1=IT R2/(R1+R2).",
        "it": "Per «Partitore di corrente»: la resistenza minore porta più corrente; I1=IT R2/(R1+R2).",
        "pt": "Para «Divisor de corrente»: o menor resistor leva mais corrente; I1=IT R2/(R1+R2).",
    },
    "SEQ-001": {
        "en": "For “SR latch”: Q follows S and R while Enable is high; S=R=1 is invalid.",
        "de": "Für „SR-Latch“: Q folgt S und R, solange Enable hoch ist; S=R=1 ist ungültig.",
        "fr": "Pour « Latch SR » : Q suit S et R tant que Enable est haut ; S=R=1 est invalide.",
        "it": "Per «Latch SR»: Q segue S e R mentre Enable è alto; S=R=1 è invalido.",
        "pt": "Para «Latch SR»: Q segue S e R enquanto Enable está alto; S=R=1 é inválido.",
    },
    "SEQ-002": {
        "en": "For “D latch”: Q copies D while Enable is active; when Enable falls, Q is held.",
        "de": "Für „D-Latch“: Q kopiert D, solange Enable aktiv ist; fällt Enable, bleibt Q gehalten.",
        "fr": "Pour « Latch D » : Q copie D tant que Enable est actif ; quand Enable tombe, Q est retenu.",
        "it": "Per «Latch D»: Q copia D mentre Enable è attivo; quando Enable scende, Q è trattenuto.",
        "pt": "Para «Latch D»: Q copia D enquanto Enable está ativo; ao descer Enable, Q é retido.",
    },
    "OPA-009": {
        "en": "For “Inverting integrator”: C in the feedback integrates Vin; Vo is the ramp −(1/RC)∫Vin dt.",
        "de": "Für „Invertierender Integrator“: C in der Rückkopplung integriert Vin; Vo ist die Rampe −(1/RC)∫Vin dt.",
        "fr": "Pour « Intégrateur inverseur » : C dans la rétroaction intègre Vin ; Vo est la rampe −(1/RC)∫Vin dt.",
        "it": "Per «Integratore invertente»: C nella retroazione integra Vin; Vo è la rampa −(1/RC)∫Vin dt.",
        "pt": "Para «Integrador inversor»: C na realimentação integra Vin; Vo é a rampa −(1/RC)∫Vin dt.",
    },
    "ADC-006": {
        "en": "For “R-2R ladder DAC”: each bit bk contributes Vref/2^k through the R and 2R network.",
        "de": "Für „R-2R-Leiternetz-DAC“: jedes Bit bk trägt Vref/2^k über das R-2R-Netz bei.",
        "fr": "Pour « CNA en échelle R-2R » : chaque bit bk apporte Vref/2^k via le réseau R et 2R.",
        "it": "Per «DAC a scala R-2R»: ogni bit bk apporta Vref/2^k attraverso la rete R e 2R.",
        "pt": "Para «DAC em escada R-2R»: cada bit bk contribui Vref/2^k através da rede R e 2R.",
    },
    "FIL-006": {
        "en": "For “First-order slope”: m=−20 dB/dec describes the low-pass roll-off band, not the whole Bode plot.",
        "de": "Für „Steigung erster Ordnung“: m=−20 dB/dec beschreibt den Tiefpass-Abfall, nicht das ganze Bode-Diagramm.",
        "fr": "Pour « Pente du premier ordre » : m=−20 dB/dec décrit la bande de descente du passe-bas, pas tout le Bode.",
        "it": "Per «Pendenza del primo ordine»: m=−20 dB/dec descrive la banda di discesa del passa-basso, non tutto il Bode.",
        "pt": "Para «Pendente de primeira ordem»: m=−20 dB/dec descreve a banda de queda do passa-baixa, não todo o Bode.",
    },
    "FAS-011": {
        "en": "For “Capacitive-reactance magnitude”: |X_C|=1/(ωC) is the magnitude; with Z=R+jX, X_C=-1/(ωC) and Z_C=-j/(ωC).",
        "de": "Für „Betrag des kapazitiven Blindwiderstands“: |X_C|=1/(ωC) ist der Betrag; mit Z=R+jX gilt X_C=-1/(ωC) und Z_C=-j/(ωC).",
        "fr": "Pour « Module de la réactance capacitive » : |X_C|=1/(ωC) est le module ; avec Z=R+jX, X_C=-1/(ωC) et Z_C=-j/(ωC).",
        "it": "Per «Modulo della reattanza capacitiva»: |X_C|=1/(ωC) è il modulo; con Z=R+jX, X_C=-1/(ωC) e Z_C=-j/(ωC).",
        "pt": "Para «Magnitude da reatância capacitiva»: |X_C|=1/(ωC) é a magnitude; com Z=R+jX, X_C=-1/(ωC) e Z_C=-j/(ωC).",
    },
}

INTUITIVE_I18N = {
    "en": {
        "DIV": "For “{title}”: the divider and Thévenin/Norton reduce the network to one port; a load across R2 lowers Vo.",
        "REA": "For “{title}”: C and L store energy and keep vC and iL continuous; series/parallel change Ceq or Leq.",
        "TRN": "For “{title}”: the exponential interpolates the continuous initial value and the settled value with τ.",
        "RLC": "For “{title}”: ζ compares α with ω0 and decides two exponentials, the boundary, or a damped oscillation.",
        "FAS": "For “{title}”: the RMS phasor rotates at ω; its projection is the sinusoid and Z = R + jX summarizes the element.",
        "PAC": "For “{title}”: P, Q and S form the power triangle; at resonance net reactance vanishes.",
        "FIL": "For “{title}”: |H(jω)| shows the passband and fc marks the −3 dB Bode point.",
        "XFR": "For “{title}”: n = N2/N1 scales voltages and inverts currents; ZL reflects as ZL/n².",
        "DIO": "For “{title}”: the diode conducts strongly past threshold; the rectifier clips or folds the sinusoid.",
        "BJT": "For “{title}”: IB sets IC = β IB in the active region; the load line runs through cutoff, active and saturation.",
        "FET": "For “{title}”: VGS versus Vth opens the channel; in saturation ID depends on (VGS−Vth)².",
        "OPA": "For “{title}”: with negative feedback v+ ≈ v− (virtual node) and the resistor network sets the gain.",
        "LGC": "For “{title}”: VOH, VOL, VIH and VIL set noise margins and the CMOS VTC inverts between rails.",
        "CMB": "For “{title}”: the truth table and Karnaugh map minimize hardware; they do not rewrite ALG-BOO identities.",
        "SEQ": "For “{title}”: the edge samples D; tsu and th mark the window where a change causes metastability.",
        "ADC": "For “{title}”: fs > 2 fmax avoids aliasing; n bits split VFS into 2^n levels and PWM uses duty cycle.",
    }
}
for loc in ("de", "fr", "it", "pt"):
    INTUITIVE_I18N[loc] = dict(INTUITIVE_I18N["en"])
INTUITIVE_I18N["de"] = {k: v.replace("For “{title}”:", "Für „{title}“:") for k, v in INTUITIVE_I18N["en"].items()}
INTUITIVE_I18N["fr"] = {k: v.replace("For “{title}”:", "Pour « {title} » :") for k, v in INTUITIVE_I18N["en"].items()}
INTUITIVE_I18N["it"] = {k: v.replace("For “{title}”:", "Per «{title}»:") for k, v in INTUITIVE_I18N["en"].items()}
INTUITIVE_I18N["pt"] = {k: v.replace("For “{title}”:", "Para «{title}»:") for k, v in INTUITIVE_I18N["en"].items()}

ERRORS_I18N = {
    "en": {
        "DIV": "forgetting that RL sits in parallel with R2; using the unloaded divider with a load present; mixing kΩ with Ω",
        "REA": "adding series C as if they were R; forgetting that vC and iL are continuous; mixing F with μF",
        "TRN": "confusing 0⁺ with 0⁻; using τ=L/R on an RC or τ=RC on an RL; forgetting the settled value",
        "RLC": "confusing α with ω0; classifying ζ with inconsistent R, L, C; dropping the 2 in α=R/(2L)",
        "FAS": "mixing peak with RMS; using jωL with f in hertz and no 2π; dropping the sign of −j/(ωC)",
        "PAC": "taking |S| as P; forgetting the cos θ factor; applying series resonance to a parallel tank",
        "FIL": "using ωc in place of fc or the reverse; forgetting load shift of the cutoff; mixing dB with linear gain",
        "XFR": "inverting n = N2/N1; forgetting currents scale the other way; reflecting ZL as n² ZL on the secondary",
        "DIO": "using 0.7 V in reverse; forgetting capacitor ripple; mixing half-wave with full-wave in Vavg",
        "BJT": "using IC=β IB in saturation; forgetting VCE(sat); swapping emitter and collector on the DCL",
        "FET": "applying JFET Shockley to a MOSFET; forgetting Vth; biasing ohmic and using the saturation law",
        "OPA": "forgetting the virtual node; using inverting gain on a non-inverter; ignoring |Vo| < Vsat",
        "LGC": "confusing VIH with VOH; forgetting noise margin; computing fan-out without input current",
        "CMB": "duplicating Boolean identities from algebra; missing static hazards; bad Karnaugh groupings",
        "SEQ": "ignoring tsu or th; treating a transparent latch as a flip-flop; forgetting the active edge",
        "ADC": "taking fs = fmax as Nyquist; forgetting ±Δ/2 error; mixing LSB with the number of levels",
    }
}
ERRORS_I18N["de"] = {k: v for k, v in ERRORS_I18N["en"].items()}
ERRORS_I18N["fr"] = {k: v for k, v in ERRORS_I18N["en"].items()}
ERRORS_I18N["it"] = {k: v for k, v in ERRORS_I18N["en"].items()}
ERRORS_I18N["pt"] = {k: v for k, v in ERRORS_I18N["en"].items()}
ERRORS_I18N["de"] = {
    "DIV": "vergessen, dass RL parallel zu R2 liegt; unbelasteten Teiler mit Last verwenden; kΩ mit Ω mischen",
    "REA": "Reihen-C wie R addieren; Kontinuität von vC und iL vergessen; F mit μF mischen",
    "TRN": "0⁺ mit 0⁻ verwechseln; τ=L/R bei RC oder τ=RC bei RL; Endwert vergessen",
    "RLC": "α mit ω0 verwechseln; ζ mit inkonsistenten R, L, C; die 2 in α=R/(2L) weglassen",
    "FAS": "Spitze mit RMS mischen; jωL mit f in Hertz ohne 2π; Vorzeichen von −j/(ωC) vergessen",
    "PAC": "|S| als P nehmen; cos θ vergessen; Reihenresonanz auf Parallelkreis anwenden",
    "FIL": "ωc statt fc oder umgekehrt; Lastverschiebung der Grenzfrequenz vergessen; dB mit linearer Verstärkung mischen",
    "XFR": "n = N2/N1 umkehren; Ströme falsch skalieren; ZL als n² ZL auf der Sekundärseite spiegeln",
    "DIO": "0.7 V in Sperrrichtung; Restwelligkeit vergessen; Halb- und Vollwelle in Vavg mischen",
    "BJT": "IC=β IB in Sättigung; VCE(sat) vergessen; Emitter und Kollektor tauschen",
    "FET": "JFET-Shockley auf MOSFET anwenden; Vth vergessen; ohmschen Bereich mit Sättigungsgesetz",
    "OPA": "virtuellen Knoten vergessen; Invertierer-Verstärkung am Nichtinvertierer; |Vo| < Vsat ignorieren",
    "LGC": "VIH mit VOH verwechseln; Rauschabstand vergessen; Fan-out ohne Eingangsstrom",
    "CMB": "boolesche Identitäten aus Algebra duplizieren; statische Hazards; schlechte Karnaugh-Gruppen",
    "SEQ": "tsu oder th ignorieren; transparentes Latch als Flipflop; aktive Flanke vergessen",
    "ADC": "fs = fmax als Nyquist; ±Δ/2 vergessen; LSB mit Stufenzahl mischen",
}
ERRORS_I18N["fr"] = {
    "DIV": "oublier que RL est en parallèle avec R2; utiliser le diviseur à vide avec charge; mélanger kΩ et Ω",
    "REA": "additionner des C série comme des R; oublier que vC et iL sont continues; mélanger F et μF",
    "TRN": "confondre 0⁺ et 0⁻; utiliser τ=L/R sur un RC ou τ=RC sur un RL; oublier la valeur finale",
    "RLC": "confondre α et ω0; classer ζ avec R, L, C incohérents; oublier le 2 dans α=R/(2L)",
    "FAS": "mélanger crête et RMS; jωL avec f en hertz sans 2π; oublier le signe de −j/(ωC)",
    "PAC": "prendre |S| pour P; oublier cos θ; appliquer la résonance série à un parallèle",
    "FIL": "utiliser ωc à la place de fc; oublier le décalage de charge; mélanger dB et gain linéaire",
    "XFR": "inverser n = N2/N1; mal échelle des courants; refléter ZL en n² ZL au secondaire",
    "DIO": "utiliser 0.7 V en inverse; oublier l'ondulation; mélanger demi-onde et pleine onde dans Vavg",
    "BJT": "IC=β IB en saturation; oublier VCE(sat); inverser émetteur et collecteur",
    "FET": "appliquer Shockley JFET à un MOSFET; oublier Vth; polariser ohmique avec la loi de saturation",
    "OPA": "oublier le nœud virtuel; gain inverseur sur un non-inverseur; ignorer |Vo| < Vsat",
    "LGC": "confondre VIH et VOH; oublier la marge de bruit; fan-out sans courant d'entrée",
    "CMB": "dupliquer les identités booléennes d'algèbre; aléas statiques; mauvais groupements Karnaugh",
    "SEQ": "ignorer tsu ou th; traiter un latch transparent comme une bascule; oublier le front actif",
    "ADC": "prendre fs = fmax pour Nyquist; oublier ±Δ/2; mélanger LSB et nombre de niveaux",
}
ERRORS_I18N["it"] = {
    "DIV": "dimenticare che RL è in parallelo a R2; usare il partitore a vuoto con carico; mescolare kΩ e Ω",
    "REA": "sommare C in serie come R; dimenticare che vC e iL sono continue; mescolare F e μF",
    "TRN": "confondere 0⁺ con 0⁻; usare τ=L/R su RC o τ=RC su RL; dimenticare il valore finale",
    "RLC": "confondere α con ω0; classificare ζ con R, L, C incoerenti; dimenticare il 2 in α=R/(2L)",
    "FAS": "mescolare picco e RMS; jωL con f in hertz senza 2π; dimenticare il segno di −j/(ωC)",
    "PAC": "prendere |S| come P; dimenticare cos θ; applicare la risonanza serie a un parallelo",
    "FIL": "usare ωc al posto di fc; dimenticare lo spostamento del carico; mescolare dB e guadagno lineare",
    "XFR": "invertire n = N2/N1; scalare male le correnti; riflettere ZL come n² ZL al secondario",
    "DIO": "usare 0.7 V in inversa; dimenticare il ripple; mescolare mezz'onda e onda intera in Vavg",
    "BJT": "IC=β IB in saturazione; dimenticare VCE(sat); scambiare emettitore e collettore",
    "FET": "applicare Shockley JFET a un MOSFET; dimenticare Vth; polarizzare ohmico con la legge di saturazione",
    "OPA": "dimenticare il nodo virtuale; guadagno invertente su un non invertente; ignorare |Vo| < Vsat",
    "LGC": "confondere VIH con VOH; dimenticare il margine di rumore; fan-out senza corrente di ingresso",
    "CMB": "duplicare identità booleane dell'algebra; alea statici; raggruppamenti Karnaugh errati",
    "SEQ": "ignorare tsu o th; trattare un latch trasparente come flip-flop; dimenticare il fronte attivo",
    "ADC": "prendere fs = fmax come Nyquist; dimenticare ±Δ/2; mescolare LSB e numero di livelli",
}
ERRORS_I18N["pt"] = {
    "DIV": "esquecer que RL fica em paralelo com R2; usar o divisor em vazio com carga; misturar kΩ com Ω",
    "REA": "somar C em série como se fossem R; esquecer que vC e iL são contínuas; misturar F com μF",
    "TRN": "confundir 0⁺ com 0⁻; usar τ=L/R num RC ou τ=RC num RL; esquecer o valor final",
    "RLC": "confundir α com ω0; classificar ζ com R, L, C inconsistentes; esquecer o 2 em α=R/(2L)",
    "FAS": "misturar pico com RMS; usar jωL com f em hertz sem 2π; esquecer o sinal de −j/(ωC)",
    "PAC": "tomar |S| como P; esquecer cos θ; aplicar ressonância série a um paralelo",
    "FIL": "usar ωc no lugar de fc; esquecer o desvio da carga; misturar dB com ganho linear",
    "XFR": "inverter n = N2/N1; escalar mal as correntes; refletir ZL como n² ZL no secundário",
    "DIO": "usar 0.7 V em inversa; esquecer o riple; misturar meia onda com onda completa em Vavg",
    "BJT": "usar IC=β IB em saturação; esquecer VCE(sat); trocar emissor e coletor",
    "FET": "aplicar Shockley de JFET a um MOSFET; esquecer Vth; polarizar óhmica com a lei de saturação",
    "OPA": "esquecer o nó virtual; usar ganho inversor num não inversor; ignorar |Vo| < Vsat",
    "LGC": "confundir VIH com VOH; esquecer a margem de ruído; fan-out sem corrente de entrada",
    "CMB": "duplicar identidades booleanas da álgebra; hazards estáticos; agrupamentos de Karnaugh errados",
    "SEQ": "ignorar tsu ou th; tratar um latch transparente como flip-flop; esquecer o flanco ativo",
    "ADC": "tomar fs = fmax como Nyquist; esquecer ±Δ/2; misturar LSB com o número de níveis",
}

ANSWER_I18N = {
    "en": {
        "DIV": "Check a resistive DC network, sign references and whether the divider is loaded.",
        "REA": "Check the passive convention, continuity of vC or iL, and C or L units.",
        "TRN": "Fix 0⁺, the settled value and τ of the equivalent seen by C or L.",
        "RLC": "Compute α and ω0 with the same R, L, C and classify ζ before writing v(t).",
        "FAS": "Work in RMS, convert f to ω=2πf and keep reactance signs.",
        "PAC": "Use same-frequency RMS and distinguish P, Q and |S|.",
        "FIL": "Identify the filter type, fc and load effect on H(jω).",
        "XFR": "Fix n=N2/N1, the impedance-reflection side and whether the model is ideal.",
        "DIO": "Choose the model (threshold, Shockley or Zener) and the conduction interval.",
        "BJT": "Identify the region (cutoff, active, saturation) before using β or VCE(sat).",
        "FET": "Check type (NMOS/JFET), VGS vs Vth and saturation versus ohmic.",
        "OPA": "Confirm negative feedback, the virtual node and that Vo does not saturate.",
        "LGC": "Use the family levels and measure margins in DC.",
        "CMB": "Start from the truth table and do not redefine ALG-BOO identities.",
        "SEQ": "Honor the active edge and the tsu and th windows.",
        "ADC": "Check Nyquist, the VFS range and the bit count.",
    }
}
ANSWER_I18N["de"] = {
    "DIV": "Resistives DC-Netz, Vorzeichenbezüge und Last am Teiler prüfen.",
    "REA": "Passive Konvention, Kontinuität von vC oder iL und C-/L-Einheiten prüfen.",
    "TRN": "0⁺, Endwert und τ des von C oder L gesehenen Ersatzes festlegen.",
    "RLC": "α und ω0 mit denselben R, L, C berechnen und ζ klassifizieren.",
    "FAS": "In RMS arbeiten, f in ω=2πf umrechnen und Reaktanzvorzeichen behalten.",
    "PAC": "RMS gleicher Frequenz nutzen und P, Q und |S| unterscheiden.",
    "FIL": "Filtertyp, fc und Lastwirkung auf H(jω) identifizieren.",
    "XFR": "n=N2/N1, Spiegelungsseite und Idealmodell festlegen.",
    "DIO": "Modell (Schwellwert, Shockley oder Zener) und Leitungsintervall wählen.",
    "BJT": "Region (Sperre, aktiv, Sättigung) vor β oder VCE(sat) identifizieren.",
    "FET": "Typ (NMOS/JFET), VGS vs Vth und Sättigung gegen ohmisch prüfen.",
    "OPA": "Gegenkopplung, virtuellen Knoten und dass Vo nicht sättigt bestätigen.",
    "LGC": "Familienpegel nutzen und Abstände im Statischen messen.",
    "CMB": "Von der Wahrheitstabelle starten und ALG-BOO-Identitäten nicht neu definieren.",
    "SEQ": "Aktive Flanke sowie tsu- und th-Fenster einhalten.",
    "ADC": "Nyquist, VFS-Bereich und Bitanzahl prüfen.",
}
ANSWER_I18N["fr"] = {
    "DIV": "Vérifier un réseau DC résistif, les références de signe et si le diviseur est chargé.",
    "REA": "Vérifier la convention passive, la continuité de vC ou iL et les unités de C ou L.",
    "TRN": "Fixer 0⁺, la valeur finale et τ de l'équivalent vu par C ou L.",
    "RLC": "Calculer α et ω0 avec les mêmes R, L, C et classer ζ avant d'écrire v(t).",
    "FAS": "Travailler en RMS, convertir f en ω=2πf et respecter les signes des réactances.",
    "PAC": "Utiliser des RMS de même fréquence et distinguer P, Q et |S|.",
    "FIL": "Identifier le type de filtre, fc et l'effet de charge sur H(jω).",
    "XFR": "Fixer n=N2/N1, le côté de réflexion d'impédance et si le modèle est idéal.",
    "DIO": "Choisir le modèle (seuil, Shockley ou Zener) et l'intervalle de conduction.",
    "BJT": "Identifier la région (blocage, active, saturation) avant d'utiliser β ou VCE(sat).",
    "FET": "Vérifier le type (NMOS/JFET), VGS vs Vth et saturation versus ohmique.",
    "OPA": "Confirmer la contre-réaction, le nœud virtuel et que Vo ne sature pas.",
    "LGC": "Utiliser les niveaux de la famille et mesurer les marges en statique.",
    "CMB": "Partir de la table de vérité et ne pas redéfinir les identités ALG-BOO.",
    "SEQ": "Respecter le front actif et les fenêtres tsu et th.",
    "ADC": "Vérifier Nyquist, la plage VFS et le nombre de bits.",
}
ANSWER_I18N["it"] = {
    "DIV": "Verificare rete DC resistiva, riferimenti di segno e se il partitore è caricato.",
    "REA": "Verificare convenzione passiva, continuità di vC o iL e unità di C o L.",
    "TRN": "Fissare 0⁺, il valore finale e τ dell'equivalente visto da C o L.",
    "RLC": "Calcolare α e ω0 con gli stessi R, L, C e classificare ζ prima di scrivere v(t).",
    "FAS": "Lavorare in RMS, convertire f in ω=2πf e rispettare i segni delle reattanze.",
    "PAC": "Usare RMS alla stessa frequenza e distinguere P, Q e |S|.",
    "FIL": "Identificare tipo di filtro, fc e effetto del carico su H(jω).",
    "XFR": "Fissare n=N2/N1, il lato di riflessione e se il modello è ideale.",
    "DIO": "Scegliere il modello (soglia, Shockley o Zener) e l'intervallo di conduzione.",
    "BJT": "Identificare la regione (interdizione, attiva, saturazione) prima di β o VCE(sat).",
    "FET": "Controllare tipo (NMOS/JFET), VGS vs Vth e saturazione versus ohmica.",
    "OPA": "Confermare controreazione, nodo virtuale e che Vo non saturi.",
    "LGC": "Usare i livelli della famiglia e misurare i margini in statico.",
    "CMB": "Partire dalla tavola di verità e non ridefinire le identità ALG-BOO.",
    "SEQ": "Rispettare il fronte attivo e le finestre tsu e th.",
    "ADC": "Verificare Nyquist, l'intervallo VFS e il numero di bit.",
}
ANSWER_I18N["pt"] = {
    "DIV": "Comprovar rede resistiva em DC, referências de sinal e se o divisor tem carga.",
    "REA": "Comprovar convenção passiva, continuidade de vC ou iL e unidades de C ou L.",
    "TRN": "Fixar 0⁺, o valor final e τ do equivalente visto por C ou L.",
    "RLC": "Calcular α e ω0 com os mesmos R, L, C e classificar ζ antes de escrever v(t).",
    "FAS": "Trabalhar em RMS, converter f em ω=2πf e respeitar os sinais das reatâncias.",
    "PAC": "Usar RMS da mesma frequência e distinguir P, Q e |S|.",
    "FIL": "Identificar o tipo de filtro, fc e o efeito da carga sobre H(jω).",
    "XFR": "Fixar n=N2/N1, o lado da reflexão e se o modelo é ideal.",
    "DIO": "Escolher o modelo (limiar, Shockley ou Zener) e o intervalo de condução.",
    "BJT": "Identificar a região (corte, ativa, saturação) antes de usar β ou VCE(sat).",
    "FET": "Comprovar tipo (NMOS/JFET), VGS vs Vth e saturação versus óhmica.",
    "OPA": "Confirmar realimentação negativa, nó virtual e que Vo não satura.",
    "LGC": "Usar os níveis da família e medir margens em estático.",
    "CMB": "Partir da tabela verdade e não redefinir identidades ALG-BOO.",
    "SEQ": "Respeitar o flanco ativo e as janelas tsu e th.",
    "ADC": "Verificar Nyquist, a gama VFS e o número de bits.",
}

ALIASES_I18N = {
    "en": {k: v for k, v in {
        "DIV": "voltage divider, current divider, Thévenin, Norton",
        "REA": "series capacitor, parallel inductor, time constant, stored energy",
        "TRN": "RC transient, RL transient, capacitor charging, exponential discharge",
        "RLC": "damping, zeta, natural frequency, underdamped oscillation",
        "FAS": "RMS phasor, impedance, reactance, admittance, sinusoidal steady state",
        "PAC": "active power, reactive power, power factor, series resonance",
        "FIL": "low-pass filter, cutoff frequency, Bode plot, −3 dB",
        "XFR": "turns ratio, reflected impedance, ideal transformer",
        "DIO": "Shockley diode, 0.7 V threshold, rectifier, ripple, Zener",
        "BJT": "beta, load line, active region, saturation, Q point",
        "FET": "MOSFET, Vth, transconductance, RDS(on), JFET Shockley",
        "OPA": "inverting amplifier, non-inverting, virtual node, CMRR, comparator",
        "LGC": "VOH VOL, noise margin, CMOS VTC, fan-out, propagation delay",
        "CMB": "multiplexer, decoder, full adder, Karnaugh, static hazard",
        "SEQ": "D flip-flop, setup time, hold, counter, Moore machine",
        "ADC": "Nyquist, quantization, PWM, R-2R DAC, flash ADC",
    }.items()}
}
for loc in ("de", "fr", "it", "pt"):
    ALIASES_I18N[loc] = dict(ALIASES_I18N["en"])
ALIASES_I18N["de"].update({
    "DIV": "Spannungsteiler, Stromteiler, Thévenin, Norton",
    "TRN": "RC-Transient, RL-Transient, Kondensatorladung, exponentielle Entladung",
    "OPA": "invertierender Verstärker, nichtinvertierend, virtueller Knoten, CMRR, Komparator",
})
ALIASES_I18N["fr"].update({
    "DIV": "diviseur de tension, diviseur de courant, Thévenin, Norton",
    "TRN": "transitoire RC, transitoire RL, charge du condensateur, décharge exponentielle",
    "OPA": "amplificateur inverseur, non inverseur, nœud virtuel, CMRR, comparateur",
})
ALIASES_I18N["it"].update({
    "DIV": "partitore di tensione, partitore di corrente, Thévenin, Norton",
    "TRN": "transitorio RC, transitorio RL, carica del condensatore, scarica esponenziale",
    "OPA": "amplificatore invertente, non invertente, nodo virtuale, CMRR, comparatore",
})
ALIASES_I18N["pt"].update({
    "DIV": "divisor de tensão, divisor de corrente, Thévenin, Norton",
    "TRN": "transiente RC, transiente RL, carga do capacitor, descarga exponencial",
    "OPA": "amplificador inversor, não inversor, nó virtual, CMRR, comparador",
})

CATALOG_INTRO = {
    "Catálogo canónico en español para el curso **Física Electrónica**. Reúne modelos de circuitos, dispositivos y hardware digital con convenciones SI.": (
        "Canonical Spanish catalog for the **Electronics** course. It gathers circuit, device and digital-hardware models with SI conventions.",
        "Kanonischer spanischer Katalog für den Kurs **Elektronik**. Er sammelt Schaltungs-, Bauelemente- und Digital-Hardware-Modelle in SI.",
        "Catalogue canonique en espagnol pour le cours **Électronique**. Il rassemble modèles de circuits, dispositifs et matériel numérique en SI.",
        "Catalogo canonico in spagnolo per il corso **Elettronica**. Raccoglie modelli di circuiti, dispositivi e hardware digitale in SI.",
        "Catálogo canónico em espanhol para o curso **Eletrônica**. Reúne modelos de circuitos, dispositivos e hardware digital com convenções SI.",
    ),
    "Se usa el SI. Las letras minúsculas representan valores instantáneos y las mayúsculas, valores constantes o RMS según el contexto. Los fasores llevan subrayado y son RMS. \(j=\\sqrt{-1}\), \(\\omega=2\\pi f\), tierra es la referencia de potencial y el sentido pasivo fija potencia absorbida positiva.": (
        "SI units. Lowercase letters are instantaneous values and uppercase letters are constants or RMS according to context. Phasors are underlined and RMS. \(j=\\sqrt{-1}\), \(\\omega=2\\pi f\); ground is the potential reference and the passive sign convention takes absorbed power as positive.",
        "SI-Einheiten. Kleinbuchstaben sind Augenblickswerte, Großbuchstaben Konstanten oder RMS. Zeiger sind unterstrichen und RMS. \(j=\\sqrt{-1}\), \(\\omega=2\\pi f\); Masse ist das Potenzialbezug; passive Zählpfeile nehmen aufgenommene Leistung positiv.",
        "Unités SI. Les minuscules sont des instants, les majuscules des constantes ou RMS. Les phaseurs sont soulignés et RMS. \(j=\\sqrt{-1}\), \(\\omega=2\\pi f\) ; la masse est la référence de potentiel et la convention passive prend la puissance absorbée positive.",
        "Unità SI. Le minuscole sono valori istantanei, le maiuscole costanti o RMS. I fasori sono sottolineati e RMS. \(j=\\sqrt{-1}\), \(\\omega=2\\pi f\); la massa è il riferimento di potenziale e la convenzione passiva prende potenza assorbita positiva.",
        "Usa-se o SI. Minúsculas são valores instantâneos e maiúsculas constantes ou RMS conforme o contexto. Fasores vêm sublinhados e são RMS. \(j=\\sqrt{-1}\), \(\\omega=2\\pi f\); a terra é a referência de potencial e a convenção passiva toma potência absorvida como positiva.",
    ),
}


def uncapitalize_title(title: str) -> str:
    """Keep leading acronyms (DAC, BJT, ADC) so FAQ does not become «dAC»."""
    first = title.split(" ", 1)[0]
    if first.isupper() and len(first) >= 2:
        return title
    if len(title) < 2:
        return title
    return title[0].lower() + title[1:]


def add_semicolon_fragments(phrases: dict[str, dict[str, str]], loc: str, es_line: str, loc_line: str) -> None:
    phrases[loc][es_line] = loc_line
    es_parts = [p.strip() for p in es_line.split(";") if p.strip()]
    loc_parts = [p.strip() for p in loc_line.split(";") if p.strip()]
    if len(es_parts) == len(loc_parts):
        for src, dst in zip(es_parts, loc_parts, strict=True):
            phrases[loc][src] = dst


def set_field(block: str, names: tuple[str, ...], value: str) -> str:
    pattern = rf"^(\*\*(?:{'|'.join(names)}):\*\*\s*).*$"

    def repl(match: re.Match[str]) -> str:
        return f"{match.group(1)}{value}"

    return re.sub(pattern, repl, block, count=1, flags=re.M)


def set_display_latex(block: str, latex: str) -> str:
    def repl(_match: re.Match[str]) -> str:
        return f"\\[\n{latex}\n\\]"

    return re.sub(r"\\\[\s*.*?\\\]", repl, block, count=1, flags=re.S)


LATEX_OVERRIDES = {
    "FAS-011": r"|X_C|=\frac{1}{\omega C},\qquad X_C=-\frac{1}{\omega C},\qquad Z_C=-\frac{j}{\omega C}",
}


def patch_md() -> dict[str, str]:
    text = MD.read_text(encoding="utf-8")
    id_to_title: dict[str, str] = {}
    parts = re.split(r"(?=^## )", text, flags=re.M)
    out = [parts[0]]
    for part in parts[1:]:
        m = re.search(r"\*\*ID:\*\* `([A-Z]+-\d{3})`", part)
        title_m = re.match(r"## \d+\.\d+ (.+)\n", part)
        if not m or not title_m:
            out.append(part)
            continue
        code = m.group(1)
        title = title_m.group(1).strip()
        id_to_title[code] = title
        prefix = code.split("-")[0]
        if code in LATEX_OVERRIDES:
            part = set_display_latex(part, LATEX_OVERRIDES[code])
        if code in ANCHOR_DETAILS:
            detail = ANCHOR_DETAILS[code][0]
        else:
            detail = f"Calcula {uncapitalize_title(title)} a partir del modelo del circuito y de las condiciones indicadas."
        part = set_field(part, ("Detalle",), detail)
        part = set_field(part, ("Variables",), VARS_OVERRIDES.get(code, PREFIX_VARS[prefix]))
        part = set_field(part, (r"Condición\(es\)", "Condición"), COND_OVERRIDES.get(code, PREFIX_COND[prefix]))
        part = set_field(part, ("Unidad",), PREFIX_UNIT[prefix])
        intuit = INTUITIVE_OVERRIDES.get(code, PREFIX_INTUITIVE[prefix].format(title=title))
        part = set_field(part, ("Explicación intuitiva",), intuit)
        part = set_field(part, ("Errores comunes",), PREFIX_ERRORS[prefix])
        question = f"¿Qué debe verificarse antes de usar la relación de {uncapitalize_title(title)}?"
        part = set_field(part, ("Pregunta",), question)
        part = set_field(part, ("Respuesta",), PREFIX_ANSWER[prefix])
        part = set_field(part, ("Alias de búsqueda",), ALIAS_OVERRIDES.get(code, PREFIX_ALIASES[prefix]))
        out.append(part)
    MD.write_text("".join(out), encoding="utf-8")
    return id_to_title


def collect_phrases(id_to_title: dict[str, str]) -> dict[str, dict[str, str]]:
    phrases: dict[str, dict[str, str]] = {loc: {} for loc in LOCALES}
    for loc in LOCALES:
        phrases[loc].update(TITLES[loc])
        phrases[loc]["Física Electrónica"] = TITLES[loc]["Física Electrónica"]
        phrases[loc]["Circuitos, semiconductores, amplificadores y electrónica digital"] = TITLES[loc][
            "Circuitos, semiconductores, amplificadores y electrónica digital"
        ]
    for code, title in id_to_title.items():
        prefix = code.split("-")[0]
        if code in ANCHOR_DETAILS:
            es, en, de, fr, it, pt = ANCHOR_DETAILS[code]
            mapping = {"en": en, "de": de, "fr": fr, "it": it, "pt": pt}
            for loc in LOCALES:
                phrases[loc][es] = mapping[loc]
        else:
            es = f"Calcula {uncapitalize_title(title)} a partir del modelo del circuito y de las condiciones indicadas."
            title_loc = {loc: TITLES[loc].get(title, title) for loc in LOCALES}
            for loc in LOCALES:
                phrases[loc][es] = DETAIL_FALLBACK[loc].format(title=title_loc[loc])
        q_es = f"¿Qué debe verificarse antes de usar la relación de {uncapitalize_title(title)}?"
        intuit_es = INTUITIVE_OVERRIDES.get(code, PREFIX_INTUITIVE[prefix].format(title=title))
        vars_es = VARS_OVERRIDES.get(code, PREFIX_VARS[prefix])
        cond_es = COND_OVERRIDES.get(code, PREFIX_COND[prefix])
        alias_es = ALIAS_OVERRIDES.get(code, PREFIX_ALIASES[prefix])
        for loc in LOCALES:
            phrases[loc][vars_es] = VARS_OVERRIDE_I18N[code][loc] if code in VARS_OVERRIDE_I18N else VARS_I18N[loc][prefix]
            phrases[loc][cond_es] = COND_OVERRIDE_I18N[code][loc] if code in COND_OVERRIDE_I18N else COND_I18N[loc][prefix]
            phrases[loc][PREFIX_UNIT[prefix]] = UNIT_I18N[loc][prefix]
            phrases[loc][PREFIX_ERRORS[prefix]] = ERRORS_I18N[loc][prefix]
            add_semicolon_fragments(phrases, loc, PREFIX_ERRORS[prefix], ERRORS_I18N[loc][prefix])
            phrases[loc][PREFIX_ANSWER[prefix]] = ANSWER_I18N[loc][prefix]
            phrases[loc][alias_es] = ALIAS_OVERRIDE_I18N[code][loc] if code in ALIAS_OVERRIDE_I18N else ALIASES_I18N[loc][prefix]
            loc_title = TITLES[loc].get(title, title)
            phrases[loc][intuit_es] = (
                INTUITIVE_OVERRIDE_I18N[code][loc]
                if code in INTUITIVE_OVERRIDE_I18N
                else INTUITIVE_I18N[loc][prefix].format(title=loc_title)
            )
            q_map = {
                "en": f"What must be checked before using the {loc_title} relation?",
                "de": f"Was muss vor der Verwendung der Beziehung «{loc_title}» geprüft werden?",
                "fr": f"Que faut-il vérifier avant d'utiliser la relation « {loc_title} » ?",
                "it": f"Cosa va verificato prima di usare la relazione «{loc_title}»?",
                "pt": f"O que deve ser verificado antes de usar a relação «{loc_title}»?",
            }
            phrases[loc][q_es] = q_map[loc]
    return phrases


GUIDE_PHRASES = {
    "DC resistivo": ("Resistive DC", "Resistives DC", "DC résistif", "DC resistivo continuo", "DC resistivo da rede"),
    "Reducir la red y obtener Thévenin/Norton": (
        "Reduce the network and obtain Thévenin/Norton",
        "Netzwerk reduzieren und Thévenin/Norton bilden",
        "Réduire le réseau et obtenir Thévenin/Norton",
        "Ridurre la rete e ottenere Thévenin/Norton",
        "Reduzir a rede e obter Thévenin/Norton",
    ),
    "Red con carga": ("Loaded network", "Netz mit Last", "Réseau chargé", "Rete con carico", "Rede com carga"),
    "Incluir la carga antes del divisor": (
        "Include the load before using the divider",
        "Last vor dem Teiler einbeziehen",
        "Inclure la charge avant le diviseur",
        "Includere il carico prima del partitore",
        "Incluir a carga antes do divisor",
    ),
    "Transitorio RC": ("RC transient", "RC-Transient", "Transitoire RC", "Transitorio RC di rete", "Transiente RC"),
    "Hallar \\(v_C(0^+)\\), \\(v_C(\\infty)\\) y \\(\\tau=RC\\)": (
        "Find \\(v_C(0^+)\\), \\(v_C(\\infty)\\) and \\(\\tau=RC\\)",
        "\\(v_C(0^+)\\), \\(v_C(\\infty)\\) und \\(\\tau=RC\\) bestimmen",
        "Trouver \\(v_C(0^+)\\), \\(v_C(\\infty)\\) et \\(\\tau=RC\\)",
        "Trovare \\(v_C(0^+)\\), \\(v_C(\\infty)\\) e \\(\\tau=RC\\)",
        "Achar \\(v_C(0^+)\\), \\(v_C(\\infty)\\) e \\(\\tau=RC\\)",
    ),
    "Transitorio RL": ("RL transient", "RL-Transient", "Transitoire RL", "Transitorio RL di rete", "Transiente RL"),
    "Hallar \\(i_L(0^+)\\), \\(i_L(\\infty)\\) y \\(\\tau=L/R\\)": (
        "Find \\(i_L(0^+)\\), \\(i_L(\\infty)\\) and \\(\\tau=L/R\\)",
        "\\(i_L(0^+)\\), \\(i_L(\\infty)\\) und \\(\\tau=L/R\\) bestimmen",
        "Trouver \\(i_L(0^+)\\), \\(i_L(\\infty)\\) et \\(\\tau=L/R\\)",
        "Trovare \\(i_L(0^+)\\), \\(i_L(\\infty)\\) e \\(\\tau=L/R\\)",
        "Achar \\(i_L(0^+)\\), \\(i_L(\\infty)\\) e \\(\\tau=L/R\\)",
    ),
    "Circuito RLC": ("RLC circuit", "RLC-Schaltung", "Circuit RLC", "Circuito RLC serie/parallelo", "Circuito RLC série/paralelo"),
    "Formular la ecuación característica y clasificar \\(\\zeta\\)": (
        "Write the characteristic equation and classify \\(\\zeta\\)",
        "Charakteristische Gleichung aufstellen und \\(\\zeta\\) klassifizieren",
        "Écrire l'équation caractéristique et classer \\(\\zeta\\)",
        "Scrivere l'equazione caratteristica e classificare \\(\\zeta\\)",
        "Escrever a equação característica e classificar \\(\\zeta\\)",
    ),
    "Sinusoides": ("Sinusoids", "Sinusgrößen", "Sinusoïdes", "Sinusoidi", "Senoides"),
    "Convertir a fasores RMS e impedancias": (
        "Convert to RMS phasors and impedances",
        "In RMS-Zeiger und Impedanzen umwandeln",
        "Convertir en phaseurs RMS et impédances",
        "Convertire in fasori RMS e impedenze",
        "Converter em fasores RMS e impedâncias",
    ),
    "Potencia CA o resonancia": ("AC power or resonance", "Wechselstromleistung oder Resonanz", "Puissance alternative ou résonance", "Potenza in CA o risonanza", "Potência CA ou ressonância"),
    "Calcular \\(P,Q,S\\), FP y condición reactiva": (
        "Compute \\(P,Q,S\\), PF and the reactive condition",
        "\\(P,Q,S\\), Leistungsfaktor und Blindbedingung berechnen",
        "Calculer \\(P,Q,S\\), FP et la condition réactive",
        "Calcolare \\(P,Q,S\\), FP e la condizione reattiva",
        "Calcular \\(P,Q,S\\), FP e a condição reativa",
    ),
    "Filtro": ("Filter", "Filterschaltung", "Filtre", "Filtro analogico", "Filtro linear"),
    "Obtener \\(H(j\\omega)\\), cortes, pendiente y carga": (
        "Obtain \\(H(j\\omega)\\), cutoffs, slope and loading",
        "\\(H(j\\omega)\\), Grenzfrequenzen, Steigung und Last bestimmen",
        "Obtenir \\(H(j\\omega)\\), coupures, pente et charge",
        "Ottenere \\(H(j\\omega)\\), tagli, pendenza e carico",
        "Obter \\(H(j\\omega)\\), cortes, inclinação e carga",
    ),
    "Rectificador con diodo": ("Diode rectifier", "Diodengleichrichter", "Redresseur à diode", "Raddrizzatore a diodo", "Retificador a diodo"),
    "Elegir modelo, identificar conducción y rizado": (
        "Choose a model, identify conduction and ripple",
        "Modell wählen, Leitung und Restwelligkeit erkennen",
        "Choisir un modèle, identifier conduction et ondulation",
        "Scegliere un modello, identificare conduzione e ripple",
        "Escolher um modelo, identificar condução e ondulação",
    ),
    "Amplificador operacional": ("Operational amplifier", "Operationsverstärker", "Amplificateur opérationnel", "Amplificatore operazionale", "Amplificador operacional ideal"),
    "Confirmar realimentación, región lineal y saturación": (
        "Confirm feedback, linear region and saturation",
        "Gegenkopplung, linearen Bereich und Sättigung prüfen",
        "Confirmer la rétroaction, la région linéaire et la saturation",
        "Confermare la controreazione, la regione lineare e la saturazione",
        "Confirmar a realimentação, a região linear e a saturação",
    ),
    "Lógica combinacional": ("Combinational logic", "Kombinatorische Logik", "Logique combinatoire", "Logica combinatoria", "Lógica combinatória"),
    "Escribir tabla de verdad, minimizar y revisar peligros": (
        "Write the truth table, minimize and check hazards",
        "Wahrheitstabelle schreiben, minimieren und Hazards prüfen",
        "Écrire la table de vérité, minimiser et vérifier les aléas",
        "Scrivere la tavola di verità, minimizzare e controllare gli alea",
        "Escrever a tabela verdade, minimizar e rever hazards",
    ),
    "Secuencial o flip-flop": ("Sequential or flip-flop", "Sequenziell oder Flipflop", "Séquentiel ou bascule", "Sequenziale o flip-flop", "Sequencial ou flip-flop"),
    "Revisar reloj, setup, hold y estado siguiente": (
        "Check clock, setup, hold and next state",
        "Takt, Setup, Hold und Folgezustand prüfen",
        "Vérifier horloge, setup, hold et état suivant",
        "Controllare clock, setup, hold e stato successivo",
        "Revisar clock, setup, hold e estado seguinte",
    ),
}

CHECKLIST = {
    "Dibujar nodos, referencias, polaridades y sentidos.": (
        "Draw nodes, references, polarities and directions.",
        "Knoten, Bezüge, Polaritäten und Richtungen zeichnen.",
        "Dessiner nœuds, références, polarités et sens.",
        "Disegnare nodi, riferimenti, polarità e versi.",
        "Desenhar nós, referências, polaridades e sentidos.",
    ),
    "Identificar si la excitación es DC, transitoria, sinusoidal o digital.": (
        "Identify whether the excitation is DC, transient, sinusoidal or digital.",
        "Feststellen, ob die Anregung DC, transient, sinusförmig oder digital ist.",
        "Identifier si l'excitation est DC, transitoire, sinusoïdale ou numérique.",
        "Identificare se l'eccitazione è DC, transitoria, sinusoidale o digitale.",
        "Identificar se a excitação é DC, transiente, senoidal ou digital.",
    ),
    "Separar estado inicial, régimen de transición y estado final.": (
        "Separate initial state, transient regime and final state.",
        "Anfangszustand, Übergang und Endzustand trennen.",
        "Séparer état initial, régime transitoire et état final.",
        "Separare stato iniziale, regime transitorio e stato finale.",
        "Separar estado inicial, regime de transição e estado final.",
    ),
    "Elegir el modelo válido de cada componente y su región de operación.": (
        "Choose a valid model for each device and its operating region.",
        "Gültiges Modell und Arbeitsbereich jedes Bauelements wählen.",
        "Choisir le modèle valable de chaque composant et sa région.",
        "Scegliere il modello valido di ciascun componente e la regione.",
        "Escolher o modelo válido de cada componente e a região.",
    ),
    "Simplificar la red y plantear KCL, KVL, fasores o tabla de estados.": (
        "Simplify the network and write KCL, KVL, phasors or a state table.",
        "Netz vereinfachen und KCL, KVL, Zeiger oder Zustandstabelle ansetzen.",
        "Simplifier le réseau et poser LKC, LKV, phaseurs ou table d'états.",
        "Semplificare la rete e impostare LKC, LKT, fasori o tabella degli stati.",
        "Simplificar a rede e colocar LKC, LKT, fasores ou tabela de estados.",
    ),
    "Resolver con unidades SI y conservar signos y valores RMS o pico.": (
        "Solve in SI units and keep signs and RMS or peak values.",
        "In SI lösen und Vorzeichen sowie RMS- oder Spitzenwerte behalten.",
        "Résoudre en SI et conserver signes et valeurs RMS ou crête.",
        "Risolvere in SI e conservare segni e valori RMS o di picco.",
        "Resolver em SI e conservar sinais e valores RMS ou de pico.",
    ),
    "Verificar límites, potencia, saturación, frecuencia y temporización.": (
        "Check limits, power, saturation, frequency and timing.",
        "Grenzen, Leistung, Sättigung, Frequenz und Timing prüfen.",
        "Vérifier limites, puissance, saturation, fréquence et temporisation.",
        "Verificare limiti, potenza, saturazione, frequenza e temporizzazione.",
        "Verificar limites, potência, saturação, frequência e temporização.",
    ),
    "Comparar el resultado con una estimación física y documentar supuestos.": (
        "Compare the result with a physical estimate and record assumptions.",
        "Ergebnis mit einer physikalischen Abschätzung vergleichen und Annahmen notieren.",
        "Comparer le résultat à une estimation physique et noter les hypothèses.",
        "Confrontare il risultato con una stima fisica e documentare le ipotesi.",
        "Comparar o resultado com uma estimativa física e documentar hipóteses.",
    ),
}


def add_guide_phrases(phrases: dict[str, dict[str, str]]) -> None:
    for es, vals in {**GUIDE_PHRASES, **CHECKLIST}.items():
        for loc, val in zip(LOCALES, vals, strict=True):
            phrases[loc][es] = val


CHAPTER1 = {
    "El recorrido recomendado avanza de DC resistiva a transitorios, luego AC y fasores, dispositivos analógicos y hardware digital:": (
        "The recommended path runs from resistive DC to transients, then AC and phasors, analog devices and digital hardware:",
        "Der empfohlene Weg führt von resistivem DC zu Transienten, dann Wechselstrom und Zeiger, analogen Bauelementen und digitaler Hardware:",
        "Le parcours recommandé va du DC résistif aux transitoires, puis CA et phaseurs, dispositifs analogiques et matériel numérique :",
        "Il percorso consigliato va dalla DC resistiva ai transitori, poi CA e fasori, dispositivi analogici e hardware digitale:",
        "O percurso recomendado avança de DC resistiva a transientes, depois CA e fasores, dispositivos analógicos e hardware digital:",
    ),
    "Repasar tensión, corriente, potencia y ley de Ohm (`ELE-008`, `ELE-009`).": (
        "Review voltage, current, power and Ohm's law (`ELE-008`, `ELE-009`).",
        "Spannung, Strom, Leistung und Ohmsches Gesetz wiederholen (`ELE-008`, `ELE-009`).",
        "Revoir tension, courant, puissance et loi d'Ohm (`ELE-008`, `ELE-009`).",
        "Ripassare tensione, corrente, potenza e legge di Ohm (`ELE-008`, `ELE-009`).",
        "Repassar tensão, corrente, potência e lei de Ohm (`ELE-008`, `ELE-009`).",
    ),
    "Aplicar Kirchhoff y asociaciones resistivas (`ELE-014`, `ELE-015`, `ELE-016`, `ELE-017`).": (
        "Apply Kirchhoff and series/parallel resistors (`ELE-014`, `ELE-015`, `ELE-016`, `ELE-017`).",
        "Kirchhoff und Reihen-/Parallelwiderstände anwenden (`ELE-014`, `ELE-015`, `ELE-016`, `ELE-017`).",
        "Appliquer Kirchhoff et les associations de résistances (`ELE-014`, `ELE-015`, `ELE-016`, `ELE-017`).",
        "Applicare Kirchhoff e le associazioni resistive (`ELE-014`, `ELE-015`, `ELE-016`, `ELE-017`).",
        "Aplicar Kirchhoff e associações resistivas (`ELE-014`, `ELE-015`, `ELE-016`, `ELE-017`).",
    ),
    "Incorporar almacenamiento en capacitores e inductores (`ELE-018`, `ELE-019`, `ELE-020`).": (
        "Bring in capacitor and inductor storage (`ELE-018`, `ELE-019`, `ELE-020`).",
        "Speicherung in Kondensator und Spule einbeziehen (`ELE-018`, `ELE-019`, `ELE-020`).",
        "Intégrer le stockage dans condensateurs et inductances (`ELE-018`, `ELE-019`, `ELE-020`).",
        "Includere l'immagazzinamento in condensatori e induttori (`ELE-018`, `ELE-019`, `ELE-020`).",
        "Incorporar armazenamento em capacitores e indutores (`ELE-018`, `ELE-019`, `ELE-020`).",
    ),
    "Estudiar conmutación RC/RL y luego dinámica RLC.": (
        "Study RC/RL switching and then RLC dynamics.",
        "RC/RL-Schaltvorgänge und danach RLC-Dynamik studieren.",
        "Étudier la commutation RC/RL puis la dynamique RLC.",
        "Studiare la commutazione RC/RL e poi la dinamica RLC.",
        "Estudar comutação RC/RL e depois a dinâmica RLC.",
    ),
    "Pasar al régimen sinusoidal, potencia, resonancia y filtros.": (
        "Move to sinusoidal steady state, power, resonance and filters.",
        "Zum Sinusregime, zu Leistung, Resonanz und Filtern übergehen.",
        "Passer au régime sinusoïdal, puissance, résonance et filtres.",
        "Passare al regime sinusoidale, potenza, risonanza e filtri.",
        "Passar ao regime senoidal, potência, ressonância e filtros.",
    ),
    "Modelar transformadores, diodos, transistores y operacionales.": (
        "Model transformers, diodes, transistors and op-amps.",
        "Transformatoren, Dioden, Transistoren und OPVs modellieren.",
        "Modéliser transformateurs, diodes, transistors et AOP.",
        "Modellare trasformatori, diodi, transistor e operazionali.",
        "Modelar transformadores, diodos, transistores e operacionais.",
    ),
    "Cerrar con interfaces eléctricas, lógica combinacional, secuencial y conversión de datos.": (
        "Close with electrical interfaces, combinational and sequential logic, and data conversion.",
        "Mit elektrischen Schnittstellen, Kombinatorik, Sequenzlogik und Datenwandlung schließen.",
        "Clore par interfaces électriques, logique combinatoire et séquentielle, et conversion.",
        "Chiudere con interfacce elettriche, logica combinatoria e sequenziale e conversione.",
        "Fechar com interfaces elétricas, lógica combinacional e sequencial e conversão.",
    ),
    "Los contenidos `ELE-008` a `ELE-020` son prerrequisitos: aquí no se recatalogan, sino que se usan para analizar circuitos completos.": (
        "Entries `ELE-008` through `ELE-020` are prerequisites: they are not recatalogued here; they are used to analyse complete circuits.",
        "`ELE-008` bis `ELE-020` sind Voraussetzungen: sie werden hier nicht neu katalogisiert, sondern zum Analysieren vollständiger Schaltungen genutzt.",
        "Les fiches `ELE-008` à `ELE-020` sont des prérequis : elles ne sont pas recataloguées ici, elles servent à analyser des circuits complets.",
        "Le schede `ELE-008`–`ELE-020` sono prerequisiti: non vengono ricatalogate qui, ma usate per analizzare circuiti completi.",
        "Os itens `ELE-008` a `ELE-020` são pré-requisitos: não são recatalogados aqui; usam-se para analisar circuitos completos.",
    ),
    "**18.1 Orden práctico de revisión**": (
        "**18.1 Practical review order**",
        "**18.1 Praktische Prüfreihenfolge**",
        "**18.1 Ordre pratique de révision**",
        "**18.1 Ordine pratico di revisione**",
        "**18.1 Ordem prática de revisão**",
    ),
    "Orden práctico de revisión": (
        "Practical review order",
        "Praktische Prüfreihenfolge",
        "Ordre pratique de révision",
        "Ordine pratico di revisione",
        "Ordem prática de revisão",
    ),
}


def merge_i18n(phrases: dict[str, dict[str, str]]) -> None:
    PHRASES_PATH.write_text(json.dumps(phrases, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    SUBTITLES_PATH.write_text(json.dumps(TITLES, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for loc in LOCALES:
        path = I18N_DIR / f"{loc}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        added = 0
        for key, value in phrases[loc].items():
            if data.get(key) != value:
                data[key] = value
                added += 1
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{loc}: merged {added} keys")


def main() -> None:
    id_to_title = patch_md()
    phrases = collect_phrases(id_to_title)
    add_guide_phrases(phrases)
    for es, vals in CHAPTER1.items():
        for loc, val in zip(LOCALES, vals, strict=True):
            phrases[loc][es] = val
    for es, vals in CATALOG_INTRO.items():
        for loc, val in zip(LOCALES, vals, strict=True):
            phrases[loc][es] = val
    # Alias overlay keys
    aliases = {
        "filtro pasa-altos": (
            "high-pass filter",
            "Hochpassfilter",
            "filtre passe-haut",
            "filtro passa-alto",
            "filtro passa-alta",
        ),
        "divisor de tensión": ("voltage divider", "Spannungsteiler", "diviseur de tension", "partitore di tensione", "divisor de tensão"),
        "voltage divider formula": ("voltage-divider formula", "Spannungsteilerformel", "formule du diviseur de tension", "formula del partitore di tensione", "fórmula do divisor de tensão"),
        "Thévenin": ("Thévenin", "Thévenin", "Thévenin", "Thévenin", "Thévenin"),
        "Thevenin": ("Thevenin", "Thevenin", "Thevenin", "Thevenin", "Thevenin"),
        "tensión de Thévenin": ("Thévenin voltage", "Thévenin-Spannung", "tension de Thévenin", "tensione di Thévenin", "tensão de Thévenin"),
        "Norton": ("Norton", "Norton", "Norton", "Norton", "Norton"),
        "corriente de Norton": ("Norton current", "Norton-Strom", "courant de Norton", "corrente di Norton", "corrente de Norton"),
        "amplificador inversor": ("inverting amplifier", "invertierender Verstärker", "amplificateur inverseur", "amplificatore invertente", "amplificador inversor de tensão"),
        "inverting amplifier": ("inverting amplifier", "invertierender Verstärker", "amplificateur inverseur", "amplificatore invertente", "amplificador inversor"),
        "op amp inversor": ("inverting op amp", "invertierender OPV", "AOP inverseur", "operazionale invertente", "op-amp inversor"),
        "amplificador no inversor": ("non-inverting amplifier", "nichtinvertierender Verstärker", "amplificateur non inverseur", "amplificatore non invertente", "amplificador não inversor"),
        "non-inverting amplifier": ("non-inverting amplifier", "nichtinvertierender Verstärker", "amplificateur non inverseur", "amplificatore non invertente", "amplificador não inversor"),
        "flip-flop D": ("D flip-flop", "D-Flipflop", "bascule D", "flip-flop di tipo D", "flip-flop tipo D"),
        "flip flop D": ("D flip flop", "D-Flipflop", "bascule D", "flip flop D", "flip flop D"),
        "D flip-flop": ("D flip-flop", "D-Flipflop", "bascule D", "flip-flop D", "flip-flop D"),
        "tiempo de setup": ("setup time", "Setup-Zeit", "temps de setup", "tempo di setup", "tempo de setup"),
        "setup time": ("setup time", "Setup-Zeit", "temps de setup", "tempo di setup", "tempo de setup"),
        "Nyquist": ("Nyquist", "Nyquist", "Nyquist", "Nyquist", "Nyquist"),
        "teorema del muestreo": ("sampling theorem", "Abtasttheorem", "théorème d'échantillonnage", "teorema del campionamento", "teorema da amostragem"),
    }
    for es, vals in aliases.items():
        for loc, val in zip(LOCALES, vals, strict=True):
            phrases[loc][es] = val
    if WORKED_PATH.exists():
        worked = json.loads(WORKED_PATH.read_text(encoding="utf-8"))
        for loc in LOCALES:
            phrases[loc].update(worked[loc])
    merge_i18n(phrases)
    leftover = GENERIC_DETAIL in MD.read_text(encoding="utf-8")
    print("generic leftover" if leftover else "generic details replaced", "formulas", len(id_to_title))


if __name__ == "__main__":
    main()
