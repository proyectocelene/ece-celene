import { useState, useMemo } from 'react';
import type { ClinicalNote } from '@/entities/clinical-note/model/schemas';
import type { Patient } from '@/entities/patient/model/schemas';
import { DateTimeService } from '@/shared/lib/dateTimeService';
import { Card } from '@/shared/ui';
import {
  Activity,
  HeartPulse,
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface PatientVitalTrendsTabProps {
  patient?: Patient;
  notes: ClinicalNote[];
}

export function PatientVitalTrendsTab({ notes }: PatientVitalTrendsTabProps) {
  const [activeMetric, setActiveMetric] = useState<'bp' | 'glucose' | 'weight' | 'hr'>('bp');

  // Filtrar y ordenar cronológicamente (de la más antigua a la más reciente para las curvas)
  const validVitalsData = useMemo(() => {
    return notes
      .filter((n) => n.vitalSigns && Object.keys(n.vitalSigns).length > 0)
      .map((n) => {
        return {
          id: n.id,
          date: n.date,
          dateFormatted: DateTimeService.formatDate(n.date, { month: 'short', day: 'numeric', year: '2-digit' }),
          bpSystolic: n.vitalSigns?.bpSystolic,
          bpDiastolic: n.vitalSigns?.bpDiastolic,
          heartRate: n.vitalSigns?.heartRate,
          respiratoryRate: n.vitalSigns?.respiratoryRate,
          temperature: n.vitalSigns?.temperature,
          weightKg: n.vitalSigns?.weightKg,
          heightCm: n.vitalSigns?.heightCm,
          bmi: n.vitalSigns?.bmi,
          glucose: n.vitalSigns?.glucose,
          spO2: n.vitalSigns?.spO2,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [notes]);

  // Cálculos estadísticos para Presión Arterial
  const bpStats = useMemo(() => {
    const records = validVitalsData.filter((d) => d.bpSystolic && d.bpDiastolic);
    if (records.length === 0) return null;

    const latest = records[records.length - 1];
    const initial = records[0];
    const avgSys = Math.round(records.reduce((acc, r) => acc + (r.bpSystolic || 0), 0) / records.length);
    const avgDia = Math.round(records.reduce((acc, r) => acc + (r.bpDiastolic || 0), 0) / records.length);
    const maxSys = Math.max(...records.map((r) => r.bpSystolic || 0));
    const minSys = Math.min(...records.map((r) => r.bpSystolic || 0));

    return {
      count: records.length,
      latest: `${latest.bpSystolic}/${latest.bpDiastolic}`,
      initial: `${initial.bpSystolic}/${initial.bpDiastolic}`,
      average: `${avgSys}/${avgDia}`,
      maxSys,
      minSys,
      latestSys: latest.bpSystolic || 0,
      initialSys: initial.bpSystolic || 0,
      deltaSys: (latest.bpSystolic || 0) - (initial.bpSystolic || 0),
    };
  }, [validVitalsData]);

  // Cálculos estadísticos para Glucosa Capilar
  const glucoseStats = useMemo(() => {
    const records = validVitalsData.filter((d) => d.glucose && d.glucose > 0);
    if (records.length === 0) return null;

    const latest = records[records.length - 1];
    const initial = records[0];
    const avg = Math.round(records.reduce((acc, r) => acc + (r.glucose || 0), 0) / records.length);
    const max = Math.max(...records.map((r) => r.glucose || 0));
    const min = Math.min(...records.map((r) => r.glucose || 0));

    return {
      count: records.length,
      latest: latest.glucose || 0,
      initial: initial.glucose || 0,
      average: avg,
      max,
      min,
      delta: (latest.glucose || 0) - (initial.glucose || 0),
    };
  }, [validVitalsData]);

  // Cálculos estadísticos para Peso e IMC
  const weightStats = useMemo(() => {
    const records = validVitalsData.filter((d) => d.weightKg && d.weightKg > 0);
    if (records.length === 0) return null;

    const latest = records[records.length - 1];
    const initial = records[0];
    const avg = (records.reduce((acc, r) => acc + (r.weightKg || 0), 0) / records.length).toFixed(1);
    const max = Math.max(...records.map((r) => r.weightKg || 0));
    const min = Math.min(...records.map((r) => r.weightKg || 0));

    return {
      count: records.length,
      latest: latest.weightKg || 0,
      latestBmi: latest.bmi || 0,
      initial: initial.weightKg || 0,
      average: Number(avg),
      max,
      min,
      delta: Number(((latest.weightKg || 0) - (initial.weightKg || 0)).toFixed(1)),
    };
  }, [validVitalsData]);

  // Renderizador de Gráfica SVG de Presión Arterial
  const renderBPChart = () => {
    const data = validVitalsData.filter((d) => d.bpSystolic && d.bpDiastolic);
    if (data.length === 0) {
      return (
        <div className="py-16 text-center text-slate-400 text-xs">
          No hay suficientes registros de Presión Arterial para trazar la curva de evolución.
        </div>
      );
    }

    const width = 700;
    const height = 240;
    const padding = 45;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const minY = 50;
    const maxY = 200;

    const getX = (idx: number) => {
      if (data.length === 1) return padding + chartW / 2;
      return padding + (idx / (data.length - 1)) * chartW;
    };

    const getY = (val: number) => {
      const clamped = Math.max(minY, Math.min(maxY, val));
      return padding + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
    };

    const sysPoints = data.map((d, i) => `${getX(i)},${getY(d.bpSystolic || 120)}`).join(' ');
    const diaPoints = data.map((d, i) => `${getX(i)},${getY(d.bpDiastolic || 80)}`).join(' ');

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[300px] font-sans">
          {/* Zona normal verde de Presión Arterial (80 a 120) */}
          <rect
            x={padding}
            y={getY(120)}
            width={chartW}
            height={getY(80) - getY(120)}
            fill="#ecfdf5"
            opacity="0.9"
          />

          {/* Línea de alerta hipertensiva (130 / 140) */}
          <line
            x1={padding}
            y1={getY(140)}
            x2={width - padding}
            y2={getY(140)}
            stroke="#fca5a5"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text x={width - padding + 5} y={getY(140) + 4} fill="#ef4444" fontSize="9" fontWeight="bold">
            140 (Límite HTA)
          </text>

          {/* Grid lines horizontales */}
          {[60, 80, 100, 120, 140, 160, 180].map((val) => (
            <g key={val}>
              <line
                x1={padding}
                y1={getY(val)}
                x2={width - padding}
                y2={getY(val)}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text x={padding - 8} y={getY(val) + 3} textAnchor="end" fill="#64748b" fontSize="9" fontWeight="bold">
                {val}
              </text>
            </g>
          ))}

          {/* Línea Sistólica (Rojo / Azul) */}
          {data.length > 1 && (
            <polyline fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={sysPoints} />
          )}

          {/* Línea Diastólica (Cyan / Verde) */}
          {data.length > 1 && (
            <polyline fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={diaPoints} />
          )}

          {/* Puntos y etiquetas de datos */}
          {data.map((d, i) => {
            const x = getX(i);
            const ySys = getY(d.bpSystolic || 120);
            const yDia = getY(d.bpDiastolic || 80);

            return (
              <g key={i}>
                {/* Punto Sistólico */}
                <circle cx={x} cy={ySys} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <text x={x} y={ySys - 8} textAnchor="middle" fill="#1e3a8a" fontSize="10" fontWeight="bold">
                  {d.bpSystolic}
                </text>

                {/* Punto Diastólico */}
                <circle cx={x} cy={yDia} r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                <text x={x} y={yDia + 14} textAnchor="middle" fill="#115e59" fontSize="10" fontWeight="bold">
                  {d.bpDiastolic}
                </text>

                {/* Fecha abajo */}
                <text x={x} y={height - 10} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
                  {d.dateFormatted}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Leyenda de la gráfica */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span className="text-slate-800">Sistólica (mmHg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" />
            <span className="text-slate-800">Diastólica (mmHg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
            <span className="text-emerald-800">Rango Meta Normal (80 - 120)</span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizador de Gráfica SVG de Glucosa Capilar
  const renderGlucoseChart = () => {
    const data = validVitalsData.filter((d) => d.glucose && d.glucose > 0);
    if (data.length === 0) {
      return (
        <div className="py-16 text-center text-slate-400 text-xs">
          No hay registros de Glucosa Capilar para graficar.
        </div>
      );
    }

    const width = 700;
    const height = 240;
    const padding = 45;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const minY = 50;
    const maxY = 250;

    const getX = (idx: number) => {
      if (data.length === 1) return padding + chartW / 2;
      return padding + (idx / (data.length - 1)) * chartW;
    };

    const getY = (val: number) => {
      const clamped = Math.max(minY, Math.min(maxY, val));
      return padding + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
    };

    const points = data.map((d, i) => `${getX(i)},${getY(d.glucose || 100)}`).join(' ');

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[300px] font-sans">
          {/* Zona Meta de Ayuno Verde (70 a 100 mg/dL) */}
          <rect
            x={padding}
            y={getY(100)}
            width={chartW}
            height={getY(70) - getY(100)}
            fill="#ecfdf5"
            opacity="0.9"
          />

          {/* Línea de Alerta Hiperglucemia (140 mg/dL) */}
          <line
            x1={padding}
            y1={getY(140)}
            x2={width - padding}
            y2={getY(140)}
            stroke="#fed7aa"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text x={width - padding + 5} y={getY(140) + 4} fill="#ea580c" fontSize="9" fontWeight="bold">
            140 (Límite)
          </text>

          {/* Grid lines */}
          {[60, 80, 100, 120, 140, 180, 220].map((val) => (
            <g key={val}>
              <line
                x1={padding}
                y1={getY(val)}
                x2={width - padding}
                y2={getY(val)}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text x={padding - 8} y={getY(val) + 3} textAnchor="end" fill="#64748b" fontSize="9" fontWeight="bold">
                {val}
              </text>
            </g>
          ))}

          {/* Curva de Glucosa */}
          {data.length > 1 && (
            <polyline fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
          )}

          {/* Puntos y etiquetas */}
          {data.map((d, i) => {
            const x = getX(i);
            const y = getY(d.glucose || 100);

            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5.5" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
                <text x={x} y={y - 8} textAnchor="middle" fill="#5b21b6" fontSize="10" fontWeight="bold">
                  {d.glucose} mg/dL
                </text>
                <text x={x} y={height - 10} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
                  {d.dateFormatted}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
            <span className="text-slate-800">Glucosa Capilar (mg/dL)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
            <span className="text-emerald-800">Meta Ayuno (70 - 100 mg/dL)</span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizador de Gráfica SVG de Peso e IMC
  const renderWeightChart = () => {
    const data = validVitalsData.filter((d) => d.weightKg && d.weightKg > 0);
    if (data.length === 0) {
      return (
        <div className="py-16 text-center text-slate-400 text-xs">
          No hay registros de Peso para graficar.
        </div>
      );
    }

    const width = 700;
    const height = 240;
    const padding = 45;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const weights = data.map((d) => d.weightKg || 70);
    const minW = Math.max(30, Math.floor(Math.min(...weights) - 5));
    const maxW = Math.ceil(Math.max(...weights) + 5);

    const getX = (idx: number) => {
      if (data.length === 1) return padding + chartW / 2;
      return padding + (idx / (data.length - 1)) * chartW;
    };

    const getY = (val: number) => {
      const clamped = Math.max(minW, Math.min(maxW, val));
      return padding + chartH - ((clamped - minW) / (maxW - minW)) * chartH;
    };

    const points = data.map((d, i) => `${getX(i)},${getY(d.weightKg || 70)}`).join(' ');

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[300px] font-sans">
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, idx) => {
            const val = Math.round(minW + (idx / 4) * (maxW - minW));
            return (
              <g key={val}>
                <line
                  x1={padding}
                  y1={getY(val)}
                  x2={width - padding}
                  y2={getY(val)}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text x={padding - 8} y={getY(val) + 3} textAnchor="end" fill="#64748b" fontSize="9" fontWeight="bold">
                  {val} kg
                </text>
              </g>
            );
          })}

          {/* Curva de Peso */}
          {data.length > 1 && (
            <polyline fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
          )}

          {/* Puntos y etiquetas */}
          {data.map((d, i) => {
            const x = getX(i);
            const y = getY(d.weightKg || 70);

            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5.5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                <text x={x} y={y - 8} textAnchor="middle" fill="#0369a1" fontSize="10" fontWeight="bold">
                  {d.weightKg} kg {d.bmi ? `(IMC ${d.bmi})` : ''}
                </text>
                <text x={x} y={height - 10} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
                  {d.dateFormatted}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-600 inline-block" />
            <span className="text-slate-800">Peso Corporal (kg) e Índice de Masa Corporal (IMC)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left font-sans">
      {/* Header and Metric Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Curvas de Evolución Clínica y Signos Vitales</span>
          </h3>
          <p className="text-xs text-slate-500">
            Análisis longitudinal de {validVitalsData.length} registros somatométricos en el expediente.
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMetric('bp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'bp'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Presión Arterial</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('glucose')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'glucose'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Glucosa Capilar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric('weight')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMetric === 'weight'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Peso e I.M.C.</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Presión Arterial */}
        <Card className={`p-4 transition-all ${activeMetric === 'bp' ? 'ring-2 ring-blue-500 bg-blue-50/20' : 'bg-white'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Presión Arterial Actual</span>
            <HeartPulse className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">
              {bpStats?.latest || '-'} <span className="text-xs font-normal text-slate-500">mmHg</span>
            </span>
            {bpStats && (
              <span className={`text-xs font-bold flex items-center gap-0.5 ${
                bpStats.deltaSys < 0 ? 'text-emerald-600' : bpStats.deltaSys > 0 ? 'text-rose-600' : 'text-slate-500'
              }`}>
                {bpStats.deltaSys < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : bpStats.deltaSys > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                {Math.abs(bpStats.deltaSys)} mmHg vs inicial
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Promedio: <strong className="text-slate-700">{bpStats?.average || '-'} mmHg</strong> • {bpStats?.count || 0} tomas
          </p>
        </Card>

        {/* Card 2: Glucosa Capilar */}
        <Card className={`p-4 transition-all ${activeMetric === 'glucose' ? 'ring-2 ring-purple-500 bg-purple-50/20' : 'bg-white'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Última Glucosa</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">
              {glucoseStats?.latest || '-'} <span className="text-xs font-normal text-slate-500">mg/dL</span>
            </span>
            {glucoseStats && (
              <span className={`text-xs font-bold flex items-center gap-0.5 ${
                glucoseStats.delta < 0 ? 'text-emerald-600' : glucoseStats.delta > 0 ? 'text-rose-600' : 'text-slate-500'
              }`}>
                {glucoseStats.delta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : glucoseStats.delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                {Math.abs(glucoseStats.delta)} mg/dL
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Promedio: <strong className="text-slate-700">{glucoseStats?.average || '-'} mg/dL</strong> (Mín {glucoseStats?.min || '-'} / Máx {glucoseStats?.max || '-'})
          </p>
        </Card>

        {/* Card 3: Peso e IMC */}
        <Card className={`p-4 transition-all ${activeMetric === 'weight' ? 'ring-2 ring-sky-500 bg-sky-50/20' : 'bg-white'}`}>
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Peso e I.M.C.</span>
            <Scale className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900 font-mono">
              {weightStats?.latest || '-'} <span className="text-xs font-normal text-slate-500">kg</span>
            </span>
            {weightStats && (
              <span className={`text-xs font-bold flex items-center gap-0.5 ${
                weightStats.delta < 0 ? 'text-emerald-600' : weightStats.delta > 0 ? 'text-rose-600' : 'text-slate-500'
              }`}>
                {weightStats.delta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : weightStats.delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                {weightStats.delta > 0 ? `+${weightStats.delta}` : weightStats.delta} kg
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            IMC Actual: <strong className="text-slate-700">{weightStats?.latestBmi || '-'}</strong> • Promedio: <strong className="text-slate-700">{weightStats?.average || '-'} kg</strong>
          </p>
        </Card>
      </div>

      {/* Main Chart Container */}
      <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-800 text-sm">
            {activeMetric === 'bp' && 'Gráfica de Tendencia: Presión Arterial Sistólica / Diastólica'}
            {activeMetric === 'glucose' && 'Gráfica de Tendencia: Curva de Glucosa Capilar (mg/dL)'}
            {activeMetric === 'weight' && 'Gráfica de Tendencia: Peso Corporal (kg) e I.M.C.'}
          </h4>
          <span className="text-xs text-slate-400 font-semibold">
            {validVitalsData.length} consultas registradas
          </span>
        </div>

        {activeMetric === 'bp' && renderBPChart()}
        {activeMetric === 'glucose' && renderGlucoseChart()}
        {activeMetric === 'weight' && renderWeightChart()}
      </Card>

      {/* Historical Data Table */}
      <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Bitácora Histórica de Signos Vitales</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Presión Arterial</th>
                <th className="py-2 px-3">F. Cardíaca</th>
                <th className="py-2 px-3">Temperatura</th>
                <th className="py-2 px-3">Peso</th>
                <th className="py-2 px-3">Talla</th>
                <th className="py-2 px-3">I.M.C.</th>
                <th className="py-2 px-3">Glucosa</th>
                <th className="py-2 px-3">SpO2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...validVitalsData].reverse().map((r, i) => (
                <tr key={r.id || i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{r.dateFormatted}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {r.bpSystolic && r.bpDiastolic ? `${r.bpSystolic}/${r.bpDiastolic} mmHg` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{r.heartRate ? `${r.heartRate} lpm` : '-'}</td>
                  <td className="py-2.5 px-3 text-slate-700">{r.temperature ? `${r.temperature} °C` : '-'}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{r.weightKg ? `${r.weightKg} kg` : '-'}</td>
                  <td className="py-2.5 px-3 text-slate-700">{r.heightCm ? `${r.heightCm} cm` : '-'}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-700">{r.bmi || '-'}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{r.glucose ? `${r.glucose} mg/dL` : '-'}</td>
                  <td className="py-2.5 px-3 text-slate-700">{r.spO2 ? `${r.spO2}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
