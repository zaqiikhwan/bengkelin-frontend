import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { BengkelOperational } from '../../types/api';

interface OperationalHoursFormProps {
  operationalHours: BengkelOperational[];
  updating: boolean;
  onDayChange: (day: string, field: 'jam_buka' | 'jam_tutup' | 'enabled', value: string | boolean) => void;
  onToggleDay: (day: string, checked: boolean) => void;
  onSubmit: () => void;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const OperationalHoursForm: React.FC<OperationalHoursFormProps> = React.memo(({ operationalHours, updating, onDayChange, onToggleDay, onSubmit }) => {
  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <ClockIcon className="h-6 w-6 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Operational Hours</h2>
      </div>
      <div className="space-y-3">
        {DAYS.map((day) => {
          const existing = operationalHours.find((op) => op.hari === day);
          const isActive = existing?.is_active !== false;
          return (
            <div key={day} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-700 dark:text-gray-300">{day}</div>
              <input type="time" className="input-field flex-1" value={existing?.jam_buka || '08:00'} disabled={!existing} onChange={(e) => onDayChange(day, 'jam_buka', e.target.value)} />
              <span className="text-gray-500 dark:text-gray-400">-</span>
              <input type="time" className="input-field flex-1" value={existing?.jam_tutup || '17:00'} disabled={!existing} onChange={(e) => onDayChange(day, 'jam_tutup', e.target.value)} />
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 rounded"
                checked={!!existing && isActive}
                onChange={(e) => {
                  if (!e.target.checked) onToggleDay(day, false);
                  else onDayChange(day, 'enabled', true);
                }}
              />
              <label className="text-xs text-gray-500 dark:text-gray-400">Open</label>
            </div>
          );
        })}
      </div>
      <button className="btn-primary mt-4" onClick={onSubmit} disabled={updating}>
        {updating ? 'Updating...' : 'Update Hours'}
      </button>
    </div>
  );
});

OperationalHoursForm.displayName = 'OperationalHoursForm';
export default OperationalHoursForm;
