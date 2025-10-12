import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  Building, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Eye,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

// Initialize Firestore
const db = getFirestore();

const PublicBuildingPage = ({ buildingId }) => {
  const [building, setBuilding] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: 'Allgemein',
    priority: 'Normal',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: ''
  });

  useEffect(() => {
    if (buildingId) {
      loadBuildingData();
    }
  }, [buildingId]);

  // Track auth state: guests see only building info; signed-in users see tasks/reports and can report
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsub();
  }, []);

  const loadBuildingData = async () => {
    try {
      setLoading(true);
      
      // Client-side Firestore fetch (no server API)
      // Load building by id; if not found, try by 'name' or 'titel' as fallback (collection: 'gebaeude')
      let buildingData = null;
      const buildingDoc = await getDoc(doc(db, 'gebaeude', buildingId));
      if (buildingDoc.exists()) {
        buildingData = { id: buildingDoc.id, ...buildingDoc.data() };
      } else {
        const byNameSnap = await getDocs(query(collection(db, 'gebaeude'), where('name', '==', buildingId)));
        if (!byNameSnap.empty) {
          const d = byNameSnap.docs[0];
          buildingData = { id: d.id, ...d.data() };
        } else {
          const byTitleSnap = await getDocs(query(collection(db, 'gebaeude'), where('titel', '==', buildingId)));
          if (!byTitleSnap.empty) {
            const d = byTitleSnap.docs[0];
            buildingData = { id: d.id, ...d.data() };
          }
        }
      }
      setBuilding(buildingData);

      // Load tasks for this building (support both schema variants)
      let taskDocs = [];
      if (buildingData) {
        const buildingName = buildingData.name || buildingData.titel || '';
        const queries = [
          getDocs(query(collection(db, 'tasks'), where('gebaeude', '==', buildingName), orderBy('erstellt', 'desc'))),
          getDocs(query(collection(db, 'tasks'), where('gebaeudeId', '==', buildingData.id), orderBy('erstellt', 'desc'))),
        ];
        try {
          const [byName, byId] = await Promise.all(queries);
          const list = [...byName.docs, ...byId.docs];
          const seen = new Set();
          taskDocs = list.filter(d => {
            if (seen.has(d.id)) return false;
            seen.add(d.id);
            return true;
          });
        } catch (_) {}
      }
      setTasks(taskDocs.map(d => ({ id: d.id, ...d.data() })));

      // Load reports for this building (support id, name, titel, numeric legacy)
      let reportDocs = [];
      if (buildingData) {
        const buildingName = buildingData.name || buildingData.titel || '';
        const reportQueries = [
          getDocs(query(collection(db, 'meldungen'), where('building', '==', buildingData.id), orderBy('created', 'desc'))),
          getDocs(query(collection(db, 'meldungen'), where('building', '==', buildingName), orderBy('created', 'desc'))),
        ];
        const results = await Promise.allSettled(reportQueries);
        const merged = [];
        const seen = new Set();
        for (const r of results) {
          if (r.status === 'fulfilled') {
            for (const d of r.value.docs) {
              if (seen.has(d.id)) continue;
              seen.add(d.id);
              merged.push(d);
            }
          }
        }
        const asNum = Number(buildingId);
        if (!Number.isNaN(asNum)) {
          try {
            const legacyReports = await getDocs(query(collection(db, 'meldungen'), where('building', '==', asNum), orderBy('created', 'desc')));
            for (const d of legacyReports.docs) {
              if (seen.has(d.id)) continue;
              seen.add(d.id);
              merged.push(d);
            }
          } catch (_) {}
        }
        reportDocs = merged;
      }
      setReports(reportDocs.map(d => ({ id: d.id, ...d.data() })));

    } catch (error) {
      console.error('Error loading building data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      const reportData = {
        ...reportForm,
        building: parseInt(buildingId),
        status: 'Offen',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      await addDoc(collection(db, 'meldungen'), reportData);
      setShowReportModal(false);
      setReportForm({
        title: '',
        description: '',
        category: 'Allgemein',
        priority: 'Normal',
        reporterName: '',
        reporterEmail: '',
        reporterPhone: ''
      });
      await loadBuildingData();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Offen': return 'bg-red-100 text-red-700';
      case 'In Bearbeitung': return 'bg-yellow-100 text-yellow-700';
      case 'Erledigt': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Niedrig': return 'bg-green-100 text-green-700';
      case 'Normal': return 'bg-blue-100 text-blue-700';
      case 'Hoch': return 'bg-orange-100 text-orange-700';
      case 'Dringend': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#15505d] mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Gebäudedaten...</p>
        </div>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Gebäude nicht gefunden</h2>
          <p className="text-slate-600">Das angeforderte Gebäude konnte nicht gefunden werden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-[#15505d] mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{building.name}</h1>
                <p className="text-slate-600">{building.address}</p>
              </div>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-[#15505d] text-white px-4 py-2 rounded-lg hover:bg-[#0f3d47] transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Problem melden
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Building Info */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-[#15505d]" />
            Gebäudeinformationen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Adresse</p>
              <p className="font-medium">{building.address}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Einheiten</p>
              <p className="font-medium">{building.units || 'Nicht angegeben'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Verwalter</p>
              <p className="font-medium">{building.manager || 'Nicht zugewiesen'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Letzte Aktualisierung</p>
              <p className="font-medium">{new Date().toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        </div>

        {/* Current Tasks (only for signed-in users) */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-[#15505d]" />
              Aktuelle Aufgaben ({tasks.length})
            </h2>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-900">{task.titel}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{task.beschreibung}</p>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Kategorie: {task.kategorie}</span>
                      <span>Erstellt: {new Date(task.erstellt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                ))}
                {tasks.length > 5 && (
                  <p className="text-sm text-slate-500 text-center">
                    ... und {tasks.length - 5} weitere Aufgaben
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">Keine aktuellen Aufgaben</p>
            )}
          </div>
        )}

        {/* Recent Reports (only for signed-in users) */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-[#15505d]" />
              Letzte Meldungen ({reports.length})
            </h2>
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-900">{report.title}</h3>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                          {report.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{report.description}</p>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Gemeldet von: {report.reporter}</span>
                      <span>Erstellt: {new Date(report.created).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                ))}
                {reports.length > 5 && (
                  <p className="text-sm text-slate-500 text-center">
                    ... und {reports.length - 5} weitere Meldungen
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">Keine Meldungen vorhanden</p>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Problem melden - {building.name}
              </h3>
              
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Titel</label>
                  <input
                    type="text"
                    value={reportForm.title}
                    onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Beschreibung</label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d]"
                    rows="4"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategorie</label>
                    <select
                      value={reportForm.category}
                      onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d]"
                    >
                      <option value="Allgemein">Allgemein</option>
                      <option value="Heizung">Heizung</option>
                      <option value="Wasser">Wasser</option>
                      <option value="Elektrik">Elektrik</option>
                      <option value="Aufzug">Aufzug</option>
                      <option value="Reinigung">Reinigung</option>
                      <option value="Sicherheit">Sicherheit</option>
                      <option value="Garten">Garten</option>
                      <option value="Parkplatz">Parkplatz</option>
                      <option value="Sonstiges">Sonstiges</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priorität</label>
                    <select
                      value={reportForm.priority}
                      onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d]"
                    >
                      <option value="Niedrig">Niedrig</option>
                      <option value="Normal">Normal</option>
                      <option value="Hoch">Hoch</option>
                      <option value="Dringend">Dringend</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ihr Name</label>
                  <input
                    type="text"
                    value={reportForm.reporterName}
                    onChange={(e) => setReportForm({ ...reportForm, reporterName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">E-Mail</label>
                  <input
                    type="email"
                    value={reportForm.reporterEmail}
                    onChange={(e) => setReportForm({ ...reportForm, reporterEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefon (optional)</label>
                  <input
                    type="tel"
                    value={reportForm.reporterPhone}
                    onChange={(e) => setReportForm({ ...reportForm, reporterPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d]"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="bg-[#15505d] text-white px-4 py-2 rounded-lg hover:bg-[#0f3d47] transition-colors"
                  >
                    Meldung senden
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicBuildingPage;
