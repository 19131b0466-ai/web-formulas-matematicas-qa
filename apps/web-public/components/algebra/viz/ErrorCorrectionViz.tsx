'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import { ControlsStack, SliderRow, VizPanel, fmt } from './controls';

type Props = { formulaId: string; idea?: string };

function hamming(a: string, b: string): number {
  const n = Math.max(a.length, b.length);
  let d = 0;
  for (let i = 0; i < n; i++) if ((a[i] ?? '0') !== (b[i] ?? '0')) d += 1;
  return d;
}

export function ErrorCorrectionViz({ formulaId, idea }: Props) {
  const v = useVizLabels();
  const [word, setWord] = useState('0000000');
  const [errorPos, setErrorPos] = useState(2);
  const [other, setOther] = useState('0001011');
  const [dmin, setDmin] = useState(3);
  const [n, setN] = useState(7);
  const [k, setK] = useState(4);

  const bits = word.padEnd(7, '0').slice(0, 7).split('');
  const received = bits.map((b, i) => (i === errorPos ? (b === '0' ? '1' : '0') : b));
  // Toy Hamming parity checks for positions 1,2,4
  const syndrome = useMemo(() => {
    const r = received.map(Number);
    const s1 = (r[0]! + r[2]! + r[4]! + r[6]!) % 2;
    const s2 = (r[1]! + r[2]! + r[5]! + r[6]!) % 2;
    const s4 = (r[3]! + r[4]! + r[5]! + r[6]!) % 2;
    return [s1, s2, s4];
  }, [received.join('')]);

  const dist = hamming(word.padEnd(other.length, '0').slice(0, other.length), other);
  const t = Math.floor((dmin - 1) / 2);
  const rate = k / n;

  return (
    <VizPanel caption={idea}>
      {/COD-004/.test(formulaId) ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {received.map((b, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setErrorPos(i)}
                className={`h-10 w-10 rounded-lg border font-mono ${
                  errorPos === i
                    ? 'border-orange-500 bg-orange-500/20'
                    : 'border-[var(--border)] bg-[var(--bg)]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          <p className="font-mono text-sm">
            s = [{syndrome.join(', ')}] {syndrome.every((x) => x === 0) ? `(${v.valid})` : `(${v.error})`}
          </p>
        </div>
      ) : null}

      {/COD-005/.test(formulaId) ? (
        <div className="space-y-2 text-sm">
          <label className="block">
            x{' '}
            <input
              className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono"
              value={word}
              onChange={(e) => setWord(e.target.value.replace(/[^01]/g, ''))}
            />
          </label>
          <label className="block">
            y{' '}
            <input
              className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono"
              value={other}
              onChange={(e) => setOther(e.target.value.replace(/[^01]/g, ''))}
            />
          </label>
          <p className="font-mono">d_H = {dist}</p>
          <div className="flex gap-1 font-mono">
            {Array.from({ length: Math.max(word.length, other.length) }, (_, i) => {
              const same = (word[i] ?? '0') === (other[i] ?? '0');
              return (
                <span key={i} className={same ? 'opacity-40' : 'text-[var(--accent-strong)]'}>
                  {(word[i] ?? '0')}/{(other[i] ?? '0')}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {/COD-006/.test(formulaId) ? (
        <div>
          <svg viewBox="0 0 360 200" className="h-auto w-full">
            {[0, 1, 2].map((i) => (
              <circle
                key={i}
                cx={80 + i * 100}
                cy={100}
                r={20 + t * 12}
                fill="var(--accent-soft)"
                stroke="var(--accent-strong)"
                opacity={0.8}
              />
            ))}
            <text x={20} y={24} fontSize={13} fill="currentColor">
              d_min={dmin} → detecta {dmin - 1}, corrige t={t}
            </text>
          </svg>
        </div>
      ) : null}

      {/COD-007/.test(formulaId) ? (
        <div>
          <div className="flex h-10 overflow-hidden rounded-lg border border-[var(--border)]">
            <div
              className="bg-[var(--accent-strong)] text-center text-xs leading-10 text-white"
              style={{ width: `${rate * 100}%` }}
            >
              k
            </div>
            <div className="flex-1 bg-[var(--accent-soft)] text-center text-xs leading-10">n−k</div>
          </div>
          <p className="mt-2 font-mono text-sm">
            R = k/n = {fmt(rate)}
          </p>
        </div>
      ) : null}

      <ControlsStack>
        {/COD-004/.test(formulaId) ? (
          <SliderRow label={v.errorBit} value={errorPos} min={0} max={6} step={1} onChange={setErrorPos} />
        ) : null}
        {/COD-006/.test(formulaId) ? (
          <SliderRow label="d_min" value={dmin} min={1} max={7} step={1} onChange={setDmin} />
        ) : null}
        {/COD-007/.test(formulaId) ? (
          <>
            <SliderRow label="n" value={n} min={2} max={16} step={1} onChange={setN} />
            <SliderRow label="k" value={k} min={1} max={n} step={1} onChange={(v) => setK(Math.min(v, n))} />
          </>
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}
