import AlertsTable from '../components/AlertsTable';
import Section from '../components/Section';
import { useMonitoring } from '../context/MonitoringContext';

export default function AlertsPage() {
  const { alerts } = useMonitoring();
  return (
    <Section title="Alerts">
      <AlertsTable alerts={alerts} />
    </Section>
  );
}
