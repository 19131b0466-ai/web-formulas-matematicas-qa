'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { formatEnergy, formatPercent } from './physFormat';
import { heatEngineEfficiency, heatEngineWork, isValidHeatEngine } from './physLote1Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function HeatEngineViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l1.ter019');
  const carnot = mode === 'carnot';
  const uid = useId();
  const [QH, setQH] = useState(400);
  const [QC, setQC] = useState(250);
  const [TH, setTH] = useState(373);
  const [TC, setTC] = useState(273);
  const valid = isValidHeatEngine(QH, QC);
  const W = heatEngineWork(QH, QC);
  const eta = heatEngineEfficiency(QH, QC);
  const etaC = 1 - TC / TH;
  const maxW = Math.max(QH, 1);
  const wW = (W / maxW) * 200;
  const qhW = (QH / maxW) * 200;
  const qcW = (QC / maxW) * 200;

  const presets = [
    { id: 'low', label: tr('presetLow'), QH: 400, QC: 320 },
    { id: 'high', label: tr('presetHigh'), QH: 400, QC: 120 },
  ];

  if (carnot) {
    return (
      <VizPanel>
        <div className="space-y-4">
          <PhysGuide type="heat_engine" mode={mode} />
          <PhysStatus id={uid}>ηC = 1 − TC/TH = {present(etaC)}</PhysStatus>
          <ControlsStack>
            <SliderRow label="TH (K)" value={TH} min={300} max={600} step={1} onChange={setTH} />
            <SliderRow label="TC (K)" value={TC} min={200} max={350} step={1} onChange={setTC} />
          </ControlsStack>
        </div>
      </VizPanel>
    );
  }

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="heat_engine" mode={mode} />
        <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => { setQH(p.QH); setQC(p.QC); } }))} />
        <svg viewBox="0 0 420 220" className="h-auto w-full" role="img" aria-label={tr('aria')}>
          <rect x={60} y={20} width={qhW} height={28} fill={ORANGE} fillOpacity={0.5} stroke={MUTED} />
          <text x={70} y={38} fontSize={11} fill={ORANGE}>QH</text>
          <rect x={60} y={70} width={wW} height={28} fill={ACCENT} fillOpacity={0.45} stroke={MUTED} />
          <text x={70} y={88} fontSize={11} fill={ACCENT}>W</text>
          <rect x={60} y={120} width={qcW} height={28} fill={TEAL} fillOpacity={0.45} stroke={MUTED} />
          <text x={70} y={138} fontSize={11} fill={TEAL}>QC</text>
          <text x={280} y={88} fontSize={12} fill={MUTED}>QH → W + QC</text>
        </svg>
        <PhysResult
          primary={`η = W/QH = ${formatPercent(eta)} (${present(eta)})`}
          secondary={valid ? tr('work', { W: formatEnergy(W), QH: formatEnergy(QH), QC: formatEnergy(QC) }) : tr('invalid')}
        />
        <PhysStatus id={uid}>{valid ? tr('status') : tr('invalid')}</PhysStatus>
        <ControlsStack>
          <SliderRow label={tr('QH', { QH: present(QH) })} value={QH} min={100} max={800} step={10} onChange={setQH} />
          <SliderRow label={tr('QC', { QC: present(QC) })} value={QC} min={0} max={700} step={10} onChange={setQC} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
