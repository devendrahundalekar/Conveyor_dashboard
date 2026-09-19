import { Link } from 'react-router-dom';
import AlertsTable from '../components/AlertsTable';
import BeltHealthGauge from '../components/BeltHealthGauge';
import BeltInspection from '../components/BeltInspection';
import PredictionPanel from '../components/PredictionPanel';
import Section from '../components/Section';
import SensorCard from '../components/SensorCard';
import StatusHero from '../components/StatusHero';
import VibrationAnalysis from '../components/VibrationAnalysis';
import { useMonitoring } from '../context/MonitoringContext';
import { evaluate, LIMITS } from '../lib/status';

export default function Dashboard() {
  const { telemetry: t, history, alerts } = useMonitoring();

  return (
    <>
      <StatusHero telemetry={t} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SensorCard
          title="Vibration"
          value={t?.vibration ?? null}
          digits={2}
          unit="g"
          status={t ? evaluate(t.vibration, LIMITS.vibration) : null}
          history={history}
          dataKey="vibration"
        />
        <SensorCard
          title="Temperature"
          value={t?.temperature ?? null}
          digits={0}
          unit="°C"
          status={t ? evaluate(t.temperature, LIMITS.temperature) : null}
          history={history}
          dataKey="temperature"
        />
        <SensorCard
          title="Load"
          value={t?.load ?? null}
          digits={1}
          unit="kg"
          status={t ? evaluate(t.load, LIMITS.load) : null}
          history={history}
          dataKey="load"
        />
        <SensorCard
          title="RPM"
          value={t?.rpm ?? null}
          digits={0}
          unit="rpm"
          status={t ? evaluate(t.rpm, LIMITS.rpm) : null}
          history={history}
          dataKey="rpm"
        />
      </div>

      <BeltInspection />

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="AI Health Prediction" className="lg:col-span-2">
          <PredictionPanel telemetry={t} />
        </Section>
        <Section title="Belt Health">
          <BeltHealthGauge value={t?.belt_health ?? null} />
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Section title="Vibration Analysis" className="lg:col-span-2">
          <VibrationAnalysis telemetry={t} />
        </Section>
        <Section
          title="Recent Alerts"
          className="lg:col-span-3"
          action={
            <Link to="/alerts" className="text-sm text-steel hover:underline">
              View all
            </Link>
          }
        >
          <AlertsTable alerts={alerts.slice(0, 5)} />
        </Section>
      </div>
    </>
  );
}
