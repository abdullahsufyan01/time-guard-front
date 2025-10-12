import React, { useMemo } from 'react';

export default function TaskList({ tasks, buildings, onChangeStatus, filters }) {

  const filtered = useMemo(() => {
    const search = (filters?.search || '').toLowerCase().trim();
    return tasks.filter(t => {
      if (filters?.buildingId && t.gebaeudeId !== filters.buildingId) return false;
      if (filters?.frequency && t.frequenz !== filters.frequency) return false;
      if (filters?.status && t.status !== filters.status) return false;
      if (search) {
        const buildingName = buildings.find(b => b.id === t.gebaeudeId)?.name || '';
        const hay = `${t.titel || ''} ${t.beschreibung || ''} ${buildingName}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [tasks, filters, buildings]);

  return (
    <div className="keos-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900">Aufgaben</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-medium text-slate-700">Titel</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700">Gebäude</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700">Frequenz</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">Keine Aufgaben gefunden.</td>
              </tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{t.titel}</div>
                  <div className="text-sm text-slate-600">{t.beschreibung}</div>
                </td>
                <td className="py-3 px-4 text-slate-700">{buildings.find(b => b.id === t.gebaeudeId)?.name || t.gebaeudeId}</td>
                <td className="py-3 px-4 text-slate-700">
                  {t.frequenz ? (
                    <span className="keos-badge bg-slate-50 text-slate-700 border-slate-200">{t.frequenz}</span>
                  ) : '-'}
                </td>
                <td className="py-3 px-4">
                  <select
                    className="keos-input"
                    value={t.status || 'offen'}
                    onChange={(e) => onChangeStatus(t.id, e.target.value)}
                  >
                    <option value="offen">Offen</option>
                    <option value="wird bearbeitet">In Bearbeitung</option>
                    <option value="erledigt">Erledigt</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


