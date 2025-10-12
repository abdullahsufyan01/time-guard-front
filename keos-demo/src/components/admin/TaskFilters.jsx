import React from 'react';

export default function TaskFilters({ buildings, value, onChange }) {
  return (
    <div className="keos-card sticky top-0 z-10">
      <div className="flex items-end justify-between gap-2 w-full overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2">
          <select
            className="keos-input w-56"
            value={value.buildingId || ''}
            onChange={(e) => onChange({ ...value, buildingId: e.target.value })}
         >
            <option value="">Alle Gebäude</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name || b.titel || b.id}</option>
            ))}
          </select>
          <select
            className="keos-input w-56"
            value={value.frequency || ''}
            onChange={(e) => onChange({ ...value, frequency: e.target.value })}
          >
            <option value="">Alle Frequenzen</option>
            <option value="daily">Täglich</option>
            <option value="weekly">Wöchentlich</option>
            <option value="monthly">Monatlich</option>
          </select>
          <select
            className="keos-input w-56"
            value={value.status || ''}
            onChange={(e) => onChange({ ...value, status: e.target.value })}
          >
            <option value="">Alle Status</option>
            <option value="offen">Offen</option>
            <option value="wird bearbeitet">In Bearbeitung</option>
            <option value="erledigt">Erledigt</option>
          </select>
        </div>
        <input
          type="search"
          className="keos-input w-72"
          placeholder="Suche (Aufgabe oder Gebäude)"
          value={value.search || ''}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
        />
      </div>
    </div>
  );
}


