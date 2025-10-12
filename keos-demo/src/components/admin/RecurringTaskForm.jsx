import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Pflichtfeld'),
  description: Yup.string().required('Pflichtfeld'),
  frequency: Yup.mixed().oneOf(['daily','weekly','monthly']).required('Pflichtfeld'),
  buildingIds: Yup.array().of(Yup.string()).min(1, 'Mind. ein Gebäude wählen'),
  employeeIds: Yup.array().of(Yup.string()),
  startDate: Yup.string().required('Pflichtfeld'),
});

export default function RecurringTaskForm({ buildings, employees, onSubmit }) {
  const buildingOptions = buildings.map(b => ({ value: b.id, label: b.name || b.titel || b.id }));
  const employeeOptions = employees.map(emp => ({ value: emp.id, label: emp.name || emp.email || emp.id }));
  return (
    <div className="keos-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900">Wiederkehrende Aufgabe anlegen</h3>
        <span className="keos-badge bg-blue-50 text-blue-700 border-blue-200">Neu</span>
      </div>
      <Formik
        initialValues={{
          name: '',
          description: '',
          frequency: 'weekly',
          buildingIds: [],
          employeeIds: [],
          startDate: new Date().toISOString().slice(0,10),
          status: 'offen',
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => {
          onSubmit(values);
          resetForm();
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Titel</label>
              <Field name="name" className="keos-input" placeholder="Aufgabenname" />
              <div className="text-red-600 text-xs mt-1"><ErrorMessage name="name" /></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Frequenz</label>
              <Field as="select" name="frequency" className="keos-input">
                <option value="daily">Täglich</option>
                <option value="weekly">Wöchentlich</option>
                <option value="monthly">Monatlich</option>
              </Field>
              <div className="text-red-600 text-xs mt-1"><ErrorMessage name="frequency" /></div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Beschreibung</label>
              <Field as="textarea" name="description" className="keos-input" rows={3} placeholder="Beschreibung" />
              <div className="text-red-600 text-xs mt-1"><ErrorMessage name="description" /></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gebäude (Suche & Mehrfachauswahl)</label>
              <Select
                isMulti
                classNamePrefix="react-select"
                options={buildingOptions}
                value={buildingOptions.filter(o => values.buildingIds.includes(o.value))}
                onChange={(selected) => setFieldValue('buildingIds', (selected || []).map(s => s.value))}
                placeholder="Gebäude auswählen..."
              />
              <div className="text-red-600 text-xs mt-1"><ErrorMessage name="buildingIds" /></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mitarbeiter (optional)</label>
              <Select
                isMulti
                classNamePrefix="react-select"
                options={employeeOptions}
                value={employeeOptions.filter(o => values.employeeIds.includes(o.value))}
                onChange={(selected) => setFieldValue('employeeIds', (selected || []).map(s => s.value))}
                placeholder="Mitarbeiter auswählen..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Startdatum</label>
              <Field type="date" name="startDate" className="keos-input" />
              <div className="text-red-600 text-xs mt-1"><ErrorMessage name="startDate" /></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <Field as="select" name="status" className="keos-input">
                <option value="offen">Offen</option>
                <option value="wird bearbeitet">In Bearbeitung</option>
                <option value="erledigt">Erledigt</option>
              </Field>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="keos-button keos-button-secondary">Nach oben</button>
              <button type="submit" disabled={isSubmitting} className="keos-button keos-button-primary">Anlegen</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}


