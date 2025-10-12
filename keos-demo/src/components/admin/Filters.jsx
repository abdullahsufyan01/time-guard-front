import React from 'react';

export default function Filters({ employees, buildings, value, onChange }) {
    return (
        <div className="flex gap-2 items-end justify-between w-full overflow-x-auto whitespace-nowrap">
            <div className='flex gap-2'>
                <select className="keos-input w-56" value={value.employeeId} onChange={(e) => onChange({ ...value, employeeId: e.target.value })}>
                    <option value="">All service employees</option>
                    {employees.map(u => (<option key={u.id} value={u.id}>{u.name || u.email || u.id}</option>))}
                </select>
                <select className="keos-input w-56" value={value.buildingId} onChange={(e) => onChange({ ...value, buildingId: e.target.value })}>
                    <option value="">All buildings</option>
                    {buildings.map(b => (<option key={b.id} value={b.id}>{b.name || b.titel || b.id}</option>))}
                </select>
                <input type="date" className="keos-input w-40" value={value.startDate} onChange={(e) => onChange({ ...value, startDate: e.target.value })} />
                <input type="date" className="keos-input w-40" value={value.endDate} onChange={(e) => onChange({ ...value, endDate: e.target.value })} />

            </div>
            <input type="search" className="keos-input w-72" placeholder="Search [Task or building...]" value={value.search || ''} onChange={(e) => onChange({ ...value, search: e.target.value })} />
        </div>
    );
}


