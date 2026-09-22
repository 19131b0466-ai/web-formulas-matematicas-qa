#!/usr/bin/env python3
"""Build worked-example translations for Física Electrónica (exact Spanish keys)."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD = ROOT / "content" / "formulas-fisica-electronica.md"
OUT = ROOT / "scripts" / "fisica-electronica-worked-i18n.json"
LOCALES = ("en", "de", "fr", "it", "pt")

MATH_RE = re.compile(r"\\\(.+?\\\)")

# Longest-first prose fragments around the shared math.
REPL: dict[str, list[tuple[str, str]]] = {
    "en": [
        ("Para un DAC R-2R de 3 bits, código ", "For a 3-bit R-2R DAC, code "),
        ("Si una fuente de prueba de ", "If a test source of "),
        ("Si una red entrega ", "If a network delivers "),
        ("Si el cortocircuito de salida conduce ", "If the output short-circuit carries "),
        ("Para el equivalente anterior, si ", "For the previous equivalent, if "),
        ("Un capacitor inicialmente a ", "A capacitor initially at "),
        ("la susceptancia total es cero y hay resonancia paralela.", "the total susceptance is zero and there is parallel resonance."),
        ("el rectificador ideal de onda completa entrega ", "the ideal full-wave rectifier delivers "),
        ("el rectificador ideal de media onda entrega ", "the ideal half-wave rectifier delivers "),
        ("En el modelo de umbral, ", "In the threshold model, "),
        ("enciende un diodo de Si porque supera ", "turns a Si diode on because it exceeds "),
        ("si la red permite ese punto.", "if the network allows that operating point."),
        ("el modelo de corte da ", "the cutoff model gives "),
        ("la recta une ", "the load line joins "),
        ("y alimentación suficiente, el seguidor entrega ", "and sufficient supply, the follower delivers "),
        ("y entrada constante de ", "and a constant input of "),
        ("la salida cambia a ", "the output changes at "),
        ("se conserva el orden requerido.", "the required order is preserved."),
        ("En una VTC CMOS de ", "On a CMOS VTC of "),
        ("una transición centrada cerca de ", "a transition centred near "),
        ("lleva la salida de casi 5 V a casi 0 V.", "takes the output from nearly 5 V to nearly 0 V."),
        ("justo antes del flanco y se cumplen setup y hold, después del flanco ", "just before the edge and setup and hold are met, after the edge "),
        ("Si el reloj llega a ", "If the clock arrives at "),
        ("y D quedó estable a ", "and D became stable at "),
        ("el setup disponible es ", "the available setup is "),
        ("y D permanece estable hasta ", "and D stays stable until "),
        ("el hold disponible es ", "the available hold is "),
        ("Para una señal limitada a ", "For a signal band-limited to "),
        ("Nyquist exige ", "Nyquist requires "),
        ("Para una sinusoide de pico ", "For a sinusoid of peak "),
        ("el pasa-altos tiene ", "the high-pass has "),
        ("por ", "through "),
        (" circulan ", " flows "),
        (" con la salida abierta, ", " with the output open, "),
        (" produce ", " produces "),
        (" entonces ", " then "),
        (", con ", ", with "),
        (" cae a ", " falls to "),
        (" no oscila", " does not oscillate"),
        (" es crítica", " is critical"),
        (" oscila a ", " oscillates at "),
        (" y fase ", " and phase "),
        (" no.", " does not."),
        (" en activa ", " in the active region "),
        (" cumple.", " satisfies it."),
        ("Si a ", "If at "),
        ("Con ", "With "),
        (" y ", " and "),
        (" en ", " in "),
        ("Para ", "For "),
        ("Si ", "If "),
    ],
    "de": [
        ("Para un DAC R-2R de 3 bits, código ", "Für ein 3-Bit-R-2R-DAC, Code "),
        ("Si una fuente de prueba de ", "Wenn eine Prüfquelle von "),
        ("Si una red entrega ", "Wenn ein Netz liefert "),
        ("Si el cortocircuito de salida conduce ", "Wenn der Ausgangskurzschluss "),
        ("Para el equivalente anterior, si ", "Für das vorherige Äquivalent, wenn "),
        ("Un capacitor inicialmente a ", "Ein Kondensator zunächst auf "),
        ("la susceptancia total es cero y hay resonancia paralela.", "die Gesamtsuszeptanz null ist und Parallelresonanz vorliegt."),
        ("el rectificador ideal de onda completa entrega ", "liefert der ideale Vollweggleichrichter "),
        ("el rectificador ideal de media onda entrega ", "liefert der ideale Einweggleichrichter "),
        ("En el modelo de umbral, ", "Im Schwellwertmodell "),
        ("enciende un diodo de Si porque supera ", "schaltet eine Si-Diode ein, weil sie "),
        ("si la red permite ese punto.", "wenn das Netz diesen Arbeitspunkt zulässt."),
        ("el modelo de corte da ", "liefert das Sperrmodell "),
        ("la recta une ", "verbindet die Lastgerade "),
        ("y alimentación suficiente, el seguidor entrega ", "und ausreichender Versorgung liefert der Folger "),
        ("y entrada constante de ", "und konstantem Eingang von "),
        ("la salida cambia a ", "ändert sich der Ausgang mit "),
        ("se conserva el orden requerido.", "bleibt die geforderte Reihenfolge erhalten."),
        ("En una VTC CMOS de ", "In einer CMOS-VTC von "),
        ("una transición centrada cerca de ", "führt ein Übergang um "),
        ("lleva la salida de casi 5 V a casi 0 V.", "den Ausgang von fast 5 V auf fast 0 V."),
        ("justo antes del flanco y se cumplen setup y hold, después del flanco ", "knapp vor der Flanke und Setup/Hold gelten, nach der Flanke "),
        ("Si el reloj llega a ", "Wenn der Takt bei "),
        ("y D quedó estable a ", " ankommt und D bei "),
        ("el setup disponible es ", "stabil war, beträgt das verfügbare Setup "),
        ("y D permanece estable hasta ", "und D bis "),
        ("el hold disponible es ", "stabil bleibt, beträgt das verfügbare Hold "),
        ("Para una señal limitada a ", "Für ein auf "),
        ("Nyquist exige ", " bandbegrenztes Signal verlangt Nyquist "),
        ("Para una sinusoide de pico ", "Für eine Sinusgröße mit Spitze "),
        ("el pasa-altos tiene ", "hat der Hochpass "),
        ("por ", "durch "),
        (" circulan ", " fließen "),
        (" con la salida abierta, ", " bei offenem Ausgang, "),
        (" produce ", " erzeugt "),
        (" entonces ", " dann "),
        (", con ", ", mit "),
        (" cae a ", " fällt auf "),
        (" no oscila", " oszilliert nicht"),
        (" es crítica", " ist kritisch"),
        (" oscila a ", " oszilliert bei "),
        (" y fase ", " und Phase "),
        (" no.", " nicht."),
        (" en activa ", " im aktiven Bereich "),
        (" cumple.", " erfüllt das."),
        ("Si a ", "Wenn bei "),
        ("Con ", "Mit "),
        (" y ", " und "),
        (" en ", " in "),
        ("Para ", "Für "),
        ("Si ", "Wenn "),
    ],
    "fr": [
        ("Para un DAC R-2R de 3 bits, código ", "Pour un CNA R-2R 3 bits, code "),
        ("Si una fuente de prueba de ", "Si une source d'essai de "),
        ("Si una red entrega ", "Si un réseau délivre "),
        ("Si el cortocircuito de salida conduce ", "Si le court-circuit de sortie conduit "),
        ("Para el equivalente anterior, si ", "Pour l'équivalent précédent, si "),
        ("Un capacitor inicialmente a ", "Un condensateur initialement à "),
        ("la susceptancia total es cero y hay resonancia paralela.", "la susceptance totale est nulle et il y a résonance parallèle."),
        ("el rectificador ideal de onda completa entrega ", "le redresseur idéal double alternance délivre "),
        ("el rectificador ideal de media onda entrega ", "le redresseur idéal simple alternance délivre "),
        ("En el modelo de umbral, ", "Dans le modèle de seuil, "),
        ("enciende un diodo de Si porque supera ", "allume une diode Si car elle dépasse "),
        ("si la red permite ese punto.", "si le réseau permet ce point de fonctionnement."),
        ("el modelo de corte da ", "le modèle de blocage donne "),
        ("la recta une ", "la droite de charge relie "),
        ("y alimentación suficiente, el seguidor entrega ", "et une alimentation suffisante, le suiveur délivre "),
        ("y entrada constante de ", "et une entrée constante de "),
        ("la salida cambia a ", "la sortie varie de "),
        ("se conserva el orden requerido.", "l'ordre requis est conservé."),
        ("En una VTC CMOS de ", "Sur une VTC CMOS de "),
        ("una transición centrada cerca de ", "une transition centrée près de "),
        ("lleva la salida de casi 5 V a casi 0 V.", "amène la sortie de près de 5 V à près de 0 V."),
        ("justo antes del flanco y se cumplen setup y hold, después del flanco ", "juste avant le front et setup/hold sont respectés, après le front "),
        ("Si el reloj llega a ", "Si l'horloge arrive à "),
        ("y D quedó estable a ", "et D est devenu stable à "),
        ("el setup disponible es ", "le setup disponible est "),
        ("y D permanece estable hasta ", "et D reste stable jusqu'à "),
        ("el hold disponible es ", "le hold disponible est "),
        ("Para una señal limitada a ", "Pour un signal limité à "),
        ("Nyquist exige ", "Nyquist exige "),
        ("Para una sinusoide de pico ", "Pour une sinusoïde de crête "),
        ("el pasa-altos tiene ", "le passe-haut a "),
        ("por ", "dans "),
        (" circulan ", " circule "),
        (" con la salida abierta, ", " sortie ouverte, "),
        (" produce ", " produit "),
        (" entonces ", " alors "),
        (", con ", ", avec "),
        (" cae a ", " tombe à "),
        (" no oscila", " n'oscille pas"),
        (" es crítica", " est critique"),
        (" oscila a ", " oscille à "),
        (" y fase ", " et phase "),
        (" no.", " non."),
        (" en activa ", " en région active "),
        (" cumple.", " convient."),
        ("Si a ", "Si à "),
        ("Con ", "Avec "),
        (" y ", " et "),
        (" en ", " en "),
        ("Para ", "Pour "),
        ("Si ", "Si "),
    ],
    "it": [
        ("Para un DAC R-2R de 3 bits, código ", "Per un DAC R-2R a 3 bit, codice "),
        ("Si una fuente de prueba de ", "Se una sorgente di prova di "),
        ("Si una red entrega ", "Se una rete eroga "),
        ("Si el cortocircuito de salida conduce ", "Se il cortocircuito di uscita conduce "),
        ("Para el equivalente anterior, si ", "Per l'equivalente precedente, se "),
        ("Un capacitor inicialmente a ", "Un condensatore inizialmente a "),
        ("la susceptancia total es cero y hay resonancia paralela.", "la suscettanza totale è zero e c'è risonanza parallelo."),
        ("el rectificador ideal de onda completa entrega ", "il raddrizzatore ideale a onda intera eroga "),
        ("el rectificador ideal de media onda entrega ", "il raddrizzatore ideale a mezz'onda eroga "),
        ("En el modelo de umbral, ", "Nel modello di soglia, "),
        ("enciende un diodo de Si porque supera ", "accende un diodo Si perché supera "),
        ("si la red permite ese punto.", "se la rete consente quel punto di lavoro."),
        ("el modelo de corte da ", "il modello di interdizione dà "),
        ("la recta une ", "la retta di carico unisce "),
        ("y alimentación suficiente, el seguidor entrega ", "e alimentazione sufficiente, il buffer eroga "),
        ("y entrada constante de ", "e ingresso costante di "),
        ("la salida cambia a ", "l'uscita varia di "),
        ("se conserva el orden requerido.", "si conserva l'ordine richiesto."),
        ("En una VTC CMOS de ", "In una VTC CMOS di "),
        ("una transición centrada cerca de ", "una transizione centrata vicino a "),
        ("lleva la salida de casi 5 V a casi 0 V.", "porta l'uscita da quasi 5 V a quasi 0 V."),
        ("justo antes del flanco y se cumplen setup y hold, después del flanco ", "poco prima del fronte e setup/hold sono rispettati, dopo il fronte "),
        ("Si el reloj llega a ", "Se il clock arriva a "),
        ("y D quedó estable a ", "e D è diventato stabile a "),
        ("el setup disponible es ", "il setup disponibile è "),
        ("y D permanece estable hasta ", "e D resta stabile fino a "),
        ("el hold disponible es ", "l'hold disponibile è "),
        ("Para una señal limitada a ", "Per un segnale limitato a "),
        ("Nyquist exige ", "Nyquist richiede "),
        ("Para una sinusoide de pico ", "Per una sinusoide di picco "),
        ("el pasa-altos tiene ", "il passa-alto ha "),
        ("por ", "in "),
        (" circulan ", " circola "),
        (" con la salida abierta, ", " con l'uscita aperta, "),
        (" produce ", " produce "),
        (" entonces ", " allora "),
        (", con ", ", con "),
        (" cae a ", " scende a "),
        (" no oscila", " non oscilla"),
        (" es crítica", " è critica"),
        (" oscila a ", " oscilla a "),
        (" y fase ", " e fase "),
        (" no.", " no."),
        (" en activa ", " in regione attiva "),
        (" cumple.", " soddisfa."),
        ("Si a ", "Se a "),
        ("Con ", "Con "),
        (" y ", " e "),
        (" en ", " in "),
        ("Para ", "Per "),
        ("Si ", "Se "),
    ],
    "pt": [
        ("Para un DAC R-2R de 3 bits, código ", "Para um DAC R-2R de 3 bits, código "),
        ("Si una fuente de prueba de ", "Se uma fonte de teste de "),
        ("Si una red entrega ", "Se uma rede entrega "),
        ("Si el cortocircuito de salida conduce ", "Se o curto-circuito de saída conduz "),
        ("Para el equivalente anterior, si ", "Para o equivalente anterior, se "),
        ("Un capacitor inicialmente a ", "Um capacitor inicialmente a "),
        ("la susceptancia total es cero y hay resonancia paralela.", "a susceptância total é zero e há ressonância paralela."),
        ("el rectificador ideal de onda completa entrega ", "o retificador ideal de onda completa entrega "),
        ("el rectificador ideal de media onda entrega ", "o retificador ideal de meia onda entrega "),
        ("En el modelo de umbral, ", "No modelo de limiar, "),
        ("enciende un diodo de Si porque supera ", "liga um diodo de Si porque supera "),
        ("si la red permite ese punto.", "se a rede permite esse ponto de operação."),
        ("el modelo de corte da ", "o modelo de corte dá "),
        ("la recta une ", "a reta une "),
        ("y alimentación suficiente, el seguidor entrega ", "e alimentação suficiente, o seguidor entrega "),
        ("y entrada constante de ", "e entrada constante de "),
        ("la salida cambia a ", "a saída varia a "),
        ("se conserva el orden requerido.", "conserva-se a ordem exigida."),
        ("En una VTC CMOS de ", "Numa VTC CMOS de "),
        ("una transición centrada cerca de ", "uma transição centrada perto de "),
        ("lleva la salida de casi 5 V a casi 0 V.", "leva a saída de quase 5 V a quase 0 V."),
        ("justo antes del flanco y se cumplen setup y hold, después del flanco ", "logo antes da borda e setup/hold são cumpridos, depois da borda "),
        ("Si el reloj llega a ", "Se o relógio chega a "),
        ("y D quedó estable a ", "e D ficou estável a "),
        ("el setup disponible es ", "o setup disponível é "),
        ("y D permanece estable hasta ", "e D permanece estável até "),
        ("el hold disponible es ", "o hold disponível é "),
        ("Para una señal limitada a ", "Para um sinal limitado a "),
        ("Nyquist exige ", "Nyquist exige "),
        ("Para una sinusoide de pico ", "Para uma senoide de pico "),
        ("el pasa-altos tiene ", "o passa-alta tem "),
        ("por ", "por "),
        (" circulan ", " circulam "),
        (" con la salida abierta, ", " com a saída aberta, "),
        (" produce ", " produz "),
        (" entonces ", " então "),
        (", con ", ", com "),
        (" cae a ", " cai para "),
        (" no oscila", " não oscila"),
        (" es crítica", " é crítica"),
        (" oscila a ", " oscila a "),
        (" y fase ", " e fase "),
        (" no.", " não."),
        (" en activa ", " na região ativa "),
        (" cumple.", " cumpre."),
        ("Si a ", "Se a "),
        ("Con ", "Com "),
        (" y ", " e "),
        (" en ", " em "),
        ("Para ", "Para "),
        ("Si ", "Se "),
    ],
}


def protect(text: str) -> tuple[str, list[str]]:
    chunks: list[str] = []

    def repl(match: re.Match[str]) -> str:
        chunks.append(match.group(0))
        return f"§{len(chunks) - 1}§"

    return MATH_RE.sub(repl, text), chunks


def restore(text: str, chunks: list[str]) -> str:
    return re.sub(r"§(\d+)§", lambda m: chunks[int(m.group(1))], text)


def translate(es: str, locale: str) -> str:
    protected, chunks = protect(es)
    out = protected
    for src, dst in sorted(REPL[locale], key=lambda kv: len(kv[0]), reverse=True):
        out = out.replace(src, dst)
    return restore(out, chunks)


def extract_examples(markdown: str) -> list[str]:
    seen: list[str] = []
    for match in re.finditer(r"\*\*Ejemplo resuelto:\*\*\s*(.+)", markdown):
        value = match.group(1).strip()
        if value not in seen:
            seen.append(value)
    return seen


SPANISH_HINT = re.compile(
    r"\b(circulan|cae |enciende|flanco|reloj|señal|oscila|crítica|entonces|abierta|umbral)\b",
    re.I,
)


def main() -> None:
    text = MD.read_text(encoding="utf-8")
    examples = extract_examples(text)
    payload = {loc: {} for loc in LOCALES}
    leftovers: list[tuple[str, str, str]] = []
    for es in examples:
        for loc in LOCALES:
            translated = translate(es, loc)
            payload[loc][es] = translated
            if loc != "pt" and SPANISH_HINT.search(protect(translated)[0]):
                leftovers.append((loc, es[:80], protect(translated)[0][:120]))
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(examples)} unique examples × {len(LOCALES)} locales → {OUT}")
    if leftovers:
        print(f"possible Spanish leftovers: {len(leftovers)}")
        for row in leftovers[:20]:
            print(row)


if __name__ == "__main__":
    main()
