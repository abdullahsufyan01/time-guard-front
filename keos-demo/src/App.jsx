// App.jsx
import React, { useState, useEffect, useMemo } from "react";
import Timesheet from "./components/admin/Timesheet";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  Home,
  Users,
  Building,
  ClipboardList,
  MessageSquare,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Save,
  UserPlus,
  FileText,
  Calendar,
  MapPin,
  Star,
  Send,
  Archive,
  RefreshCw,
  QrCode
} from "lucide-react";
import QRCodeGenerator from './components/QRCodeGenerator';
import Select from 'react-select';
import QRCodeScanner from './components/QRCodeScanner';
import ImageUpload from './components/ImageUpload';
import TaskFilters from './components/admin/TaskFilters';
import PublicBuildingPage from './components/PublicBuildingPage';
import RecurringCron from './components/RecurringCron';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

/* =======================
   KEOS BRANDING / COLORS
   ======================= */
const KEOS_PETROL = "#15505d";
const KEOS_ANTHRAZIT = "#222e33";
const KEOS_WEISS = "#ffffff";
const KEOS_ACCENT = "#f6f9fa";
const KEOS_RED = "#d22e43";
const KEOS_LIGHT = "#eaf4f8";

/* =======================
   FIREBASE INIT + HELPERS
   ======================= */
const firebaseConfig = {
  apiKey: "AIzaSyB1vRlCYw3tvvs32Wx4KtSLomv_xUNNgIk",
  authDomain: "keos-40c69.firebaseapp.com",
  projectId: "keos-40c69",
  storageBucket: "keos-40c69.appspot.com",
  messagingSenderId: "347190337353",
  appId: "1:347190337353:web:cdddd84db921e732834498",
  measurementId: "G-R40YBPRPNT",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const getAll = async (coll) => {
  const qSnap = await getDocs(collection(db, coll));
  return qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
const getByField = async (coll, field, val) => {
  const qy = query(collection(db, coll), where(field, "==", val));
  const res = await getDocs(qy);
  return res.docs.map((d) => ({ id: d.id, ...d.data() }));
};
const addData = async (coll, data) => (await addDoc(collection(db, coll), data));
const setData = async (coll, id, data) => setDoc(doc(db, coll, id), data, { merge: true });
const updateData = async (coll, id, data) => updateDoc(doc(db, coll, id), data);
const deleteData = async (coll, id) => deleteDoc(doc(db, coll, id));

/* CSV Export */
function exportCSV(filename, columns, data) {
  const head = columns.map(c => c.label).join(";") + "\n";
  const rows = data.map(r => columns.map(c => (r[c.key] ?? "")).join(";")).join("\n");
  const blob = new Blob([head + rows], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename + ".csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Service Tasks View Component
function ServiceTasksView({ tasks, buildings, onUpdateTask }) {
  const [buildingFilter, setBuildingFilter] = useState('');
  const [commentModal, setCommentModal] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);

  const filteredTasks = tasks.filter(task =>
    !buildingFilter || task.gebaeude?.toLowerCase().includes(buildingFilter.toLowerCase())
  );

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return '-';
    const end = endTime ? new Date(endTime) : new Date();
    const start = new Date(startTime);
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleStartTask = async (taskId) => {
    try {
      await setData('tasks', taskId, {
        status: 'wird bearbeitet',
        startTime: new Date().toISOString()
      });
      onUpdateTask();
    } catch (error) {
      console.error('Fehler beim Starten der Aufgabe:', error);
    }
  };

  const handleEndTask = (task) => {
    setCommentModal(task);
    setComment('');
    setBeforeImages([]);
    setAfterImages([]);
  };

  const handleSubmitComment = async () => {
    if (!commentModal || !comment.trim()) return;

    setSubmitting(true);
    try {
      const endTime = new Date().toISOString();
      
      // Upload images to Firebase Storage
      const uploadedBeforeImages = await uploadImages(beforeImages, `tasks/${commentModal.id}/before`);
      const uploadedAfterImages = await uploadImages(afterImages, `tasks/${commentModal.id}/after`);
      
      await setData('tasks', commentModal.id, {
        status: 'erledigt',
        endTime: endTime,
        serviceComment: comment.trim(),
        bearbeitungszeit: formatDuration(commentModal.startTime, endTime),
        beforeImages: uploadedBeforeImages,
        afterImages: uploadedAfterImages
      });
      
      setCommentModal(null);
      setComment('');
      setBeforeImages([]);
      setAfterImages([]);
      onUpdateTask();
    } catch (error) {
      console.error('Fehler beim Beenden der Aufgabe:', error);
    }
    setSubmitting(false);
  };

  const uploadImages = async (images, path) => {
    const uploadedImages = [];
    
    for (const image of images) {
      try {
        const imageRef = ref(storage, `${path}/${image.id}_${image.name}`);
        await uploadBytes(imageRef, image.file);
        const downloadURL = await getDownloadURL(imageRef);
        
        uploadedImages.push({
          id: image.id,
          name: image.name,
          url: downloadURL,
          uploadedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    return uploadedImages;
  };

  // Admin task filters for Aufgabenverwaltung section
  const [adminTaskFilters, setAdminTaskFilters] = useState({ buildingId: '', status: '', search: '' });

  const filteredTasksAdmin = useMemo(() => {
    const search = (adminTaskFilters.search || '').toLowerCase().trim();
    return getFilteredTasks().filter(t => {
      if (adminTaskFilters.buildingId && t.gebaeude !== adminTaskFilters.buildingId) return false;
      if (adminTaskFilters.status && t.status !== adminTaskFilters.status) return false;
      if (search) {
        const hay = `${t.titel || ''} ${t.beschreibung || ''} ${t.gebaeude || ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [getFilteredTasks, adminTaskFilters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Meine Aufgaben</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Nach Gebäude filtern..."
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div key={task.id} className="keos-card">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-slate-900">{task.titel}</h3>
              <StatusBadge status={task.status} />
            </div>

            <p className="text-sm text-slate-600 mb-3">{task.beschreibung}</p>

            <div className="space-y-2 text-xs text-slate-500 mb-4">
              <div className="flex items-center space-x-2">
                <Building size={12} />
                <span>{task.gebaeude}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={12} />
                <span>Erstellt: {new Date(task.erstellt).toLocaleDateString()}</span>
              </div>
              {task.startTime && (
                <div className="flex items-center space-x-2">
                  <Clock size={12} />
                  <span>Laufzeit: {formatDuration(task.startTime)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              {task.status === 'offen' && (
                <button
                  onClick={() => handleStartTask(task.id)}
                  className="px-4 py-3 bg-[#15505d] text-white rounded-lg font-bold border-2 border-[#15505d] shadow-lg hover:bg-[#0f3d47] hover:border-[#0f3d47] transition-all duration-200 flex items-center space-x-2"
                >
                  <Clock size={16} />
                  <span>Aufgabe starten</span>
                </button>
              )}
              {task.status === 'wird bearbeitet' && (
                <button
                  onClick={() => handleEndTask(task)}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg font-bold border-2 border-green-600 shadow-lg hover:bg-green-700 hover:border-green-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <CheckCircle size={16} />
                  <span>Aufgabe beenden</span>
                </button>
              )}
              {task.status === 'erledigt' && (
                <span className="text-sm text-green-600 font-medium">✓ Abgeschlossen</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Keine Aufgaben gefunden</h3>
          <p className="text-slate-600">
            {buildingFilter ? 'Keine Aufgaben für dieses Gebäude gefunden.' : 'Ihnen sind derzeit keine Aufgaben zugewiesen.'}
          </p>
        </div>
      )}

      {/* Comment Modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Aufgabe abschließen</h3>
                <button
                  onClick={() => setCommentModal(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  <strong>{commentModal.titel}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  Bearbeitungszeit: {formatDuration(commentModal.startTime)}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kommentar zur erledigten Aufgabe
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Beschreiben Sie, was erledigt wurde..."
                  className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent"
                  required
                />
              </div>

              {/* Image Uploads */}
              <div className="mb-4">
                <ImageUpload
                  images={beforeImages}
                  onImagesChange={setBeforeImages}
                  maxImages={3}
                  label="Vorher-Bilder (optional)"
                />
              </div>

              <div className="mb-4">
                <ImageUpload
                  images={afterImages}
                  onImagesChange={setAfterImages}
                  maxImages={3}
                  label="Nachher-Bilder (optional)"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setCommentModal(null)}
                  className="keos-button keos-button-secondary"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || submitting}
                  className="keos-button keos-button-primary"
                >
                  {submitting ? "Speichere..." : "Aufgabe abschließen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/* =======================
   COMPONENTS
   ======================= */

// Interval Badge Component
function IntervalBadge({ interval }) {
  const getIntervalConfig = (interval) => {
    switch (interval) {
      case "einmalig":
        return { className: "bg-blue-100 text-blue-700", label: "Einmalig" };
      case "wöchentlich":
        return { className: "bg-green-100 text-green-700", label: "Wöchentlich" };
      case "2-wöchentlich":
        return { className: "bg-yellow-100 text-yellow-700", label: "2-Wöchentlich" };
      case "monatlich":
        return { className: "bg-purple-100 text-purple-700", label: "Monatlich" };
      default:
        return { className: "bg-gray-100 text-gray-700", label: "Unbekannt" };
    }
  };

  const config = getIntervalConfig(interval);

  return (
    <span className={`keos-badge ${config.className}`}>
      {config.label}
    </span>
  );
}

// Mobile Navigation
function MobileNav({ activeTab, setActiveTab, role }) {
  const navItems = {
    admin: [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
      { id: 'users', icon: Users, label: 'Nutzer' },
      { id: 'buildings', icon: Building, label: 'Gebäude' },
      { id: 'tasks', icon: ClipboardList, label: 'Aufgaben' },
      { id: 'timetracking', icon: Clock, label: 'Zeiterfassung' },
      { id: 'messages', icon: MessageSquare, label: 'Nachrichten' },
    ],
    service: [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
      { id: 'tasks', icon: ClipboardList, label: 'Aufgaben' },
      { id: 'timetracking', icon: Clock, label: 'Zeiterfassung' },
      { id: 'orders', icon: ShoppingCart, label: 'Bestellungen' },
    ],
    verwalter: [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
      { id: 'buildings', icon: Building, label: 'Gebäude' },
      { id: 'tasks', icon: ClipboardList, label: 'Aufgaben' },
      { id: 'reports', icon: MessageSquare, label: 'Meldungen' },
      { id: 'messages', icon: MessageSquare, label: 'Nachrichten' },
      { id: 'orders', icon: ShoppingCart, label: 'Bestellungen' },
    ],
    bewohner: [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
      { id: 'reports', icon: MessageSquare, label: 'Meldungen' },
      { id: 'tasks', icon: ClipboardList, label: 'Aufgaben' },
    ]
  };

  const items = navItems[role] || navItems.bewohner;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50 shadow-lg">
      <div className="flex justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${isActive
                ? 'text-[#15505d] bg-[#15505d]/10 scale-105'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Desktop Sidebar
function Sidebar({ activeTab, setActiveTab, role, user, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = {
    admin: [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
      { id: 'users', icon: Users, label: 'Nutzer' },
      { id: 'buildings', icon: Building, label: 'Gebäude' },
      { id: 'tasks', icon: ClipboardList, label: 'Aufgaben' },
      { id: 'timetracking', icon: Clock, label: 'Zeiterfassung' },
      { id: 'messages', icon: MessageSquare, label: 'Nachrichten' },
      { id: 'orders', icon: ShoppingCart, label: 'Bestellungen' },
      { id: 'settings', icon: Settings, label: 'Einstellungen' },
    ],
    service: [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
      { id: 'tasks', icon: ClipboardList, label: 'Aufgaben' },
      { id: 'timetracking', icon: Clock, label: 'Zeiterfassung' },
      { id: 'orders', icon: ShoppingCart, label: 'Bestellungen' },
    ],
    verwalter: [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
      { id: 'buildings', icon: Building, label: 'Gebäude' },
      { id: 'tasks', icon: ClipboardList, label: 'Aufgaben' },
      { id: 'reports', icon: MessageSquare, label: 'Meldungen' },
      { id: 'messages', icon: MessageSquare, label: 'Nachrichten' },
      { id: 'orders', icon: ShoppingCart, label: 'Bestellungen' },
    ],
    bewohner: [
      { id: 'dashboard', icon: Home, label: 'Dashboard' },
      { id: 'reports', icon: MessageSquare, label: 'Meldungen' },
      { id: 'tasks', icon: ClipboardList, label: 'Aufgaben' },
    ]
  };

  const items = navItems[role] || navItems.bewohner;

  return (
    <div className={`hidden md:flex flex-col bg-white border-r border-slate-200 h-screen transition-all duration-300 shadow-sm ${isCollapsed ? 'w-16' : 'w-64'
      }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#15505d] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <div>
                <div className="font-bold text-[#222e33] text-lg">KEOS</div>
                <div className="text-xs text-[#15505d] font-semibold">SERVICE PORTAL</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 rounded-xl transition-all duration-200
                 ${isCollapsed ? 'px-1 py-2' : 'px-3 py-3'} 
                ${isActive
                  ? 'bg-[#15505d] text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-200">
        {!isCollapsed && (
          <div className="mb-3 p-3 bg-slate-50 rounded-lg">
            <div className="text-sm font-medium text-slate-900 truncate">{user?.email}</div>
            <div className="text-xs text-slate-500 capitalize bg-[#15505d] text-white px-2 py-1 rounded-full inline-block mt-1">{role}</div>
          </div>
        )}
        <button
          onClick={onLogout}
          className={`w-full flex items-center space-x-3 py-3 rounded-xl text-slate-600 
            hover:bg-red-50 hover:text-red-600 transition-all duration-200 
            ${isCollapsed ? 'px-1 py-1' : 'px-3 py-3'}`}

        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Abmelden</span>}
        </button>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "offen":
        return { icon: AlertCircle, className: "bg-red-100 text-red-700 border-red-200", label: "Offen" };
      case "wird bearbeitet":
        return { icon: Clock, className: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "In Bearbeitung" };
      default:
        return { icon: CheckCircle, className: "bg-green-100 text-green-700 border-green-200", label: "Erledigt" };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border inline-flex items-center space-x-1 ${config.className}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </span>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    red: "bg-red-50 text-red-600 border-red-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl border border-slate-200 max-h-[85vh]">
        <div className="p-4 md:p-6 overflow-y-auto max-h-[85vh]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// Form Input Component
function FormInput({ label, type = "text", value, onChange, placeholder, required = false }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
      />
    </div>
  );
}

// Form Select Component
function FormSelect({ label, value, onChange, options, required = false }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
      >
        <option value="">Bitte wählen...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =======================
   LOGIN
   ======================= */
function Login({ users }) {
  const [loginVal, setLoginVal] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    let email = loginVal;
    if (!loginVal.includes("@")) {
      const found = users.find(u => (u.username || "").toLowerCase() === loginVal.toLowerCase());
      if (!found) {
        setErr("Kein Nutzer mit diesem Benutzernamen.");
        setLoading(false);
        return;
      }
      email = found.email;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pw);
    } catch (error) {
      setErr("Login fehlgeschlagen: " + (error?.message || error?.code));
    }
    setLoading(false);
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    setResetMessage("");
    setResetLoading(true);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/`,
        handleCodeInApp: false
      };
      await sendPasswordResetEmail(auth, resetEmail, actionCodeSettings);
      setResetMessage("Wenn ein Konto für diese E-Mail existiert, wurde eine Zurücksetz-E-Mail gesendet.");
      setResetEmail("");
    } catch (error) {
      // Handle known cases without leaking account existence
      const code = error?.code || "";
      if (code === 'auth/user-not-found') {
        // Enumeration protection off -> treat as success
        setResetMessage("Wenn ein Konto für diese E-Mail existiert, wurde eine Zurücksetz-E-Mail gesendet.");
      } else if (code === 'auth/invalid-email') {
        setResetMessage("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      } else if (code === 'auth/missing-email') {
        setResetMessage("E-Mail-Adresse wird benötigt.");
      } else if (code === 'auth/too-many-requests') {
        setResetMessage("Zu viele Versuche. Bitte später erneut versuchen.");
      } else if (code === 'auth/network-request-failed') {
        setResetMessage("Netzwerkfehler. Prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.");
      } else {
        setResetMessage("Fehler beim Senden der Reset-E-Mail. Bitte später erneut versuchen.");
      }
    }
    setResetLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#15505d] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">K</span>
            </div>
            <h1 className="text-3xl font-bold text-[#222e33] mb-2">KEOS Login</h1>
            <p className="text-sm text-slate-600">Willkommen zurück im Service Portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <FormInput
              label="E-Mail oder Benutzername"
              value={loginVal}
              onChange={e => setLoginVal(e.target.value)}
              placeholder="Ihre E-Mail oder Benutzername"
              required
            />

            <FormInput
              label="Passwort"
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Ihr Passwort"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#15505d] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#0f3d47] focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Anmelden...</span>
                </div>
              ) : (
                "Anmelden"
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#15505d] hover:text-[#0f3d47] hover:underline transition-colors"
              >
                Passwort vergessen?
              </button>
            </div>
          </form>

          {/* Error Message */}
          {err && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 flex items-center space-x-2">
                <AlertCircle size={16} />
                <span>{err}</span>
              </p>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Zugangsdaten im Admin-Panel anlegen.<br />
              Login mit E-Mail <strong>oder</strong> Benutzername möglich.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Passwort zurücksetzen</h3>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage("");
                    setResetEmail("");
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Ihre E-Mail-Adresse"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-[#15505d] text-white py-2 px-4 rounded-lg hover:bg-[#0f3d47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? "Sende..." : "Reset-Link senden"}
                </button>
              </form>

              {resetMessage && (
                <div className={`mt-4 p-3 rounded-lg ${
                  resetMessage.includes("gesendet") 
                    ? "bg-green-50 border border-green-200 text-green-700" 
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  <p className="text-sm">{resetMessage}</p>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Hinweis:</strong> Sie erhalten eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts. 
                  Überprüfen Sie auch Ihren Spam-Ordner.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =======================
   NACHRICHTEN MODAL + KONTAKT FLOAT
   ======================= */
function NachrichtModal({ open, onClose, onSend, sending }) {
  const [msg, setMsg] = useState("");

  if (!open) return null;

  return (
    <Modal isOpen={open} onClose={onClose} title="Nachricht an KEOS">
      <textarea
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="Ihre Nachricht..."
        className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
      />

      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={() => onSend(msg)}
          disabled={!msg || sending}
          className="px-4 py-2 bg-[#15505d] text-white rounded-lg font-semibold hover:bg-[#0f3d47] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? "Sende..." : "Senden"}
        </button>
      </div>
    </Modal>
  );
}

function KontaktBar({ supportPhone, supportMail, onSendMessage }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover Menu */}
        {isHovered && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-slate-200 p-2 min-w-[140px] animate-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={onSendMessage}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
            >
              <MessageSquare size={16} className="text-[#15505d]" />
              <span>Nachricht</span>
            </button>
            <a
              href={`tel:${supportPhone}`}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md transition-colors no-underline"
            >
              <Phone size={16} className="text-[#15505d]" />
              <span>Anrufen</span>
            </a>
          </div>
        )}

        {/* Main Contact Button */}
        <button className="w-14 h-14 bg-[#15505d] hover:bg-[#0f3d47] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105">
          <MessageSquare size={20} />
        </button>
      </div>
    </div>
  );
}

/* =======================
   ADMIN COMPONENTS
   ======================= */

// User Management Component
function UserManagement({ users, buildings, loadAll }) {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    rolle: '',
    gebaeude: [],
    name: '',
    password: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);
    
    try {
      // Validate that bewohner and verwalter have buildings assigned (as IDs now)
      if ((formData.rolle === 'bewohner' || formData.rolle === 'verwalter') && 
          (!formData.gebaeude || formData.gebaeude.length === 0)) {
        alert('Bewohner und Verwalter müssen mindestens einem Gebäude zugeordnet werden.');
        setIsCreating(false);
        return;
      }
      
      if (editUser) {
        // Update existing user in Firestore only
        await updateData('users', editUser.id, {
          username: formData.username,
          rolle: formData.rolle,
          gebaeude: formData.gebaeude,
          name: formData.name
        });
      } else {
        // Create new user via backend API (creates in Auth + Firestore)
        if (!formData.password || formData.password.length < 6) {
          alert('Passwort muss mindestens 6 Zeichen lang sein.');
          setIsCreating(false);
          return;
        }

        const response = await fetch('http://localhost:3001/api/users/create-with-firestore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            displayName: formData.name,
            username: formData.username,
            rolle: formData.rolle,
            gebaeude: formData.gebaeude
          })
        });

        const result = await response.json();
        
        if (!result.success) {
          if (result.code === 'email-exists') {
            setError('Diese E-Mail-Adresse wird bereits verwendet.');
          } else {
            setError(result.error || 'Fehler beim Erstellen des Benutzers');
          }
          setIsCreating(false);
          return;
        }
      }
      
      setShowModal(false);
      setEditUser(null);
      setFormData({ email: '', username: '', rolle: '', gebaeude: [], name: '', password: '' });
      await loadAll();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setError('Netzwerkfehler. Bitte stellen Sie sicher, dass der Server läuft.');
    }
    setIsCreating(false);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      rolle: '',
      gebaeude: [],
      name: '',
      password: ''
    });
    setEditUser(null);
    setError('');
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      email: user.email || '',
      username: user.username || '',
      rolle: user.rolle || '',
      gebaeude: Array.isArray(user.gebaeude) ? user.gebaeude : (user.gebaeude ? [user.gebaeude] : []),
      name: user.name || '',
      password: '' // Don't show password on edit
    });
    setShowModal(true);
  };

  const handleNewUser = () => {
    resetForm();
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Nutzer wirklich löschen? Dies löscht auch den Firebase Auth Account.')) {
      try {
        const user = users.find(u => u.id === userId);
        if (user && user.uid) {
          // Delete from Firebase Auth via backend
          await fetch(`http://localhost:3001/api/users/${user.uid}`, {
            method: 'DELETE'
          });
        } else {
          // Just delete from Firestore if no UID
          await deleteData('users', userId);
        }
        await loadAll();
      } catch (error) {
        console.error('Fehler beim Löschen:', error);
        alert('Fehler beim Löschen des Benutzers');
      }
    }
  };

  // Helper to display building names from IDs
  const getBuildingNames = (buildingIds) => {
    if (!Array.isArray(buildingIds) || buildingIds.length === 0) return '-';
    return buildingIds
      .map(id => {
        const building = buildings.find(b => b.id === id);
        return building ? building.name : id;
      })
      .join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Nutzerverwaltung</h2>
        <button
          onClick={handleNewUser}
          className="bg-[#15505d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2"
        >
          <UserPlus size={16} />
          <span>Nutzer hinzufügen</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">E-Mail</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Rolle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Gebäude</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900">{user.name || user.username}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#15505d] text-white">
                      {user.rolle}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{getBuildingNames(user.gebaeude)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-slate-600 hover:text-[#15505d] hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editUser ? "Nutzer bearbeiten" : "Nutzer hinzufügen"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <FormInput
            label="Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Vollständiger Name"
            required
          />

          <FormInput
            label="E-Mail"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="E-Mail Adresse"
            required
            disabled={editUser !== null}
          />

          {!editUser && (
            <FormInput
              label="Passwort"
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mindestens 6 Zeichen"
              required
            />
          )}

          <FormInput
            label="Benutzername"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            placeholder="Benutzername"
          />

          <FormSelect
            label="Rolle"
            value={formData.rolle}
            onChange={e => setFormData({ ...formData, rolle: e.target.value })}
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'service', label: 'Service-Mitarbeiter' },
              { value: 'verwalter', label: 'Verwalter' },
              { value: 'bewohner', label: 'Bewohner' }
            ]}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Gebäude {(formData.rolle === 'bewohner' || formData.rolle === 'verwalter') && <span className="text-red-600">*</span>}
            </label>
            <Select
              isMulti
              classNamePrefix="react-select"
              options={buildings.map(b => ({ value: b.id, label: b.name }))}
              value={(formData.gebaeude || []).map(buildingId => {
                const building = buildings.find(b => b.id === buildingId);
                return building ? { value: building.id, label: building.name } : { value: buildingId, label: buildingId };
              })}
              onChange={(selected) => setFormData({ ...formData, gebaeude: (selected || []).map(s => s.value) })}
              placeholder="Gebäude auswählen..."
            />
            {(formData.rolle === 'bewohner' || formData.rolle === 'verwalter') && (
              <p className="text-xs text-slate-500 mt-1">
                {formData.rolle === 'bewohner' ? 'Bewohner' : 'Verwalter'} müssen mindestens einem Gebäude zugeordnet werden.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-[#15505d] text-white rounded-lg font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isCreating ? 'Speichern...' : 'Speichern'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Building Management Component
function BuildingManagement({ buildings, users, loadAll, role = 'admin', currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [editBuilding, setEditBuilding] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    adresse: '',
    einheiten: '',
    verwalter: [],
    beschreibung: ''
  });

  // Filter buildings based on user role
  const getFilteredBuildings = () => {
    switch (role) {
      case 'admin':
        return buildings;
      case 'verwalter':
      case 'bewohner':
        const currentUserData = users.find(u => u.email === currentUser?.email);
        const userBuildingIds = Array.isArray(currentUserData?.gebaeude) ? currentUserData.gebaeude : [];
        return buildings.filter(b => userBuildingIds.includes(b.id));
      default:
        return [];
    }
  };

  const filteredBuildings = getFilteredBuildings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const buildingData = {
        ...formData,
        einheiten: parseInt(formData.einheiten) || 0
      };

      if (editBuilding) {
        await updateData('gebaeude', editBuilding.id, buildingData);
      } else {
        await addData('gebaeude', {
          ...buildingData,
          erstellt: new Date().toISOString()
        });
      }
      setShowModal(false);
      setEditBuilding(null);
      setFormData({ name: '', adresse: '', einheiten: '', verwalter: [], beschreibung: '' });
      await loadAll();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      adresse: '',
      einheiten: '',
      verwalter: [],
      beschreibung: ''
    });
    setEditBuilding(null);
  };

  const handleEdit = (building) => {
    setEditBuilding(building);
    setFormData({
      name: building.name || '',
      adresse: building.adresse || '',
      einheiten: building.einheiten?.toString() || '',
      verwalter: Array.isArray(building.verwalter) ? building.verwalter : (building.verwalter ? [building.verwalter] : []),
      beschreibung: building.beschreibung || ''
    });
    setShowModal(true);
  };

  const handleNewBuilding = () => {
    resetForm();
    setShowModal(true);
  };

  const handleDelete = async (buildingId) => {
    if (window.confirm('Gebäude wirklich löschen?')) {
      await deleteData('gebaeude', buildingId);
      await loadAll();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Gebäudeverwaltung</h2>
        {role === 'admin' && (
          <button
            onClick={handleNewBuilding}
            className="bg-[#15505d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Gebäude hinzufügen</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuildings.map((building) => (
          <div key={building.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#15505d] rounded-lg flex items-center justify-center">
                  <Building size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{building.name}</h3>
                  <p className="text-sm text-slate-600">{building.einheiten} Einheiten</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setSelectedBuilding(building);
                    setShowQRModal(true);
                  }}
                  className="p-2 text-slate-600 hover:text-[#15505d] hover:bg-slate-100 rounded-lg transition-colors"
                  title="QR Code generieren"
                >
                  <QrCode size={16} />
                </button>
                {role === 'admin' && (
                  <>
                    <button
                      onClick={() => handleEdit(building)}
                      className="p-2 text-slate-600 hover:text-[#15505d] hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(building.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-slate-600">
                <MapPin size={14} />
                <span>{building.adresse}</span>
              </div>
              {building.verwalter && (
                <div className="flex items-center space-x-2 text-slate-600">
                  <Users size={14} />
                  <span>Verwalter: {Array.isArray(building.verwalter) ? building.verwalter.join(', ') : building.verwalter}</span>
                </div>
              )}
            </div>

            {building.beschreibung && (
              <p className="mt-3 text-sm text-slate-600 line-clamp-2">{building.beschreibung}</p>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editBuilding ? "Gebäude bearbeiten" : "Gebäude hinzufügen"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Gebäudename"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Name des Gebäudes"
            required
          />

          <FormInput
            label="Adresse"
            value={formData.adresse}
            onChange={e => setFormData({ ...formData, adresse: e.target.value })}
            placeholder="Vollständige Adresse"
            required
          />

          <FormInput
            label="Anzahl Einheiten"
            type="number"
            value={formData.einheiten}
            onChange={e => setFormData({ ...formData, einheiten: e.target.value })}
            placeholder="Anzahl der Wohneinheiten"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Verwalter</label>
            <Select
              isMulti
              classNamePrefix="react-select"
              options={users.filter(u => u.rolle === 'verwalter').map(u => ({ value: u.email, label: u.name || u.email }))}
              value={(formData.verwalter || []).map(v => ({ value: v, label: v }))}
              onChange={(selected) => setFormData({ ...formData, verwalter: (selected || []).map(s => s.value) })}
              placeholder="Verwalter auswählen..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Beschreibung
            </label>
            <textarea
              value={formData.beschreibung}
              onChange={e => setFormData({ ...formData, beschreibung: e.target.value })}
              placeholder="Zusätzliche Informationen zum Gebäude"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#15505d] text-white rounded-lg font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Speichern</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      {showQRModal && selectedBuilding && (
        <QRCodeGenerator 
          building={selectedBuilding} 
          onClose={() => {
            setShowQRModal(false);
            setSelectedBuilding(null);
          }} 
        />
      )}
    </div>
  );
}

// Task Management Component
function TaskManagement({ tasks, buildings, users, loadAll, currentUser, role }) {
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [statusModalTask, setStatusModalTask] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 'offen', startTime: '', endTime: '' });
  const [formData, setFormData] = useState({
    titel: '',
    beschreibung: '',
    gebaeude: '',
    zugewiesen: '',
    status: 'offen',
    prioritaet: 'normal',
    kategorie: ''
  });

  // Filter tasks based on user role
  const getFilteredTasks = () => {
    switch (role) {
      case 'admin':
        return tasks;
      case 'service':
        return tasks.filter(t => t.zugewiesen === currentUser?.email);
      case 'verwalter':
        const currentUserData = users.find(u => u.email === currentUser?.email);
        const userBuildingIds = Array.isArray(currentUserData?.gebaeude) ? currentUserData.gebaeude : [];
        // Filter by building ID or fallback to building name
        return tasks.filter(t => {
          if (t.gebaeudeId && userBuildingIds.includes(t.gebaeudeId)) return true;
          // Fallback: check if building name matches any of user's buildings
          return userBuildingIds.some(buildingId => {
            const building = buildings.find(b => b.id === buildingId);
            return building && building.name === t.gebaeude;
          });
        });
      case 'bewohner':
        // Show tasks created by resident OR assigned to them
        const residentUserData = users.find(u => u.email === currentUser?.email);
        const residentBuildingIds = Array.isArray(residentUserData?.gebaeude) ? residentUserData.gebaeude : [];
        return tasks.filter(t => 
          t.ersteller === currentUser?.email || 
          t.betrifft === currentUser?.email ||
          (t.gebaeudeId && residentBuildingIds.includes(t.gebaeudeId)) ||
          residentBuildingIds.some(buildingId => {
            const building = buildings.find(b => b.id === buildingId);
            return building && building.name === t.gebaeude;
          })
        );
      default:
        return [];
    }
  };

  const filteredTasks = getFilteredTasks();

  // Local filters for the Aufgabenverwaltung list
  const [adminTaskFilters, setAdminTaskFilters] = useState({ buildingId: '', status: '', search: '' });
  const filteredTasksAdmin = useMemo(() => {
    const base = getFilteredTasks();
    const search = (adminTaskFilters.search || '').toLowerCase().trim();
    return base.filter(t => {
      if (adminTaskFilters.buildingId && t.gebaeude !== adminTaskFilters.buildingId) return false;
      if (adminTaskFilters.status && t.status !== adminTaskFilters.status) return false;
      if (search) {
        const hay = `${t.titel || ''} ${t.beschreibung || ''} ${t.gebaeude || ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [tasks, buildings, role, currentUser, adminTaskFilters]);

  const validationSchema = Yup.object().shape({
    titel: Yup.string().required('Pflichtfeld'),
    beschreibung: Yup.string().required('Pflichtfeld'),
    gebaeude: Yup.string().required('Pflichtfeld'),
    isRecurring: Yup.boolean(),
    frequency: Yup.string().when('isRecurring', {
      is: true,
      then: (schema) => schema.oneOf(['daily', 'weekly', 'monthly']).required('Pflichtfeld')
    }),
    startDate: Yup.string().when('isRecurring', {
      is: true,
      then: (schema) => schema.required('Pflichtfeld')
    }),
    endDate: Yup.string().nullable()
  });

  const handleSubmit = async (values) => {
    try {
      const taskData = {
        ...values,
        erstellt: editTask ? editTask.erstellt : new Date().toISOString(),
        ersteller: editTask ? editTask.ersteller : currentUser?.email
      };

      // For residents creating tasks, set default values
      if (role === 'bewohner' && !editTask) {
        taskData.status = 'offen';
        taskData.prioritaet = taskData.prioritaet || 'normal';
        taskData.betrifft = currentUser?.email;
      }

      if (editTask) {
        await updateData('tasks', editTask.id, taskData);
      } else {
        await addData('tasks', taskData);
      }
      setShowModal(false);
      setEditTask(null);
      setFormData({ titel: '', beschreibung: '', gebaeude: '', zugewiesen: '', status: 'offen', prioritaet: 'normal', kategorie: '', isRecurring: false, frequency: '', startDate: '', endDate: '' });
      await loadAll();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      titel: '',
      beschreibung: '',
      gebaeude: '',
      zugewiesen: '',
      status: 'offen',
      prioritaet: 'normal',
      kategorie: '',
      isRecurring: false,
      frequency: '',
      startDate: '',
      endDate: ''
    });
    setEditTask(null);
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setFormData({
      titel: task.titel || '',
      beschreibung: task.beschreibung || '',
      gebaeude: task.gebaeude || '',
      zugewiesen: task.zugewiesen || '',
      status: task.status || 'offen',
      prioritaet: task.prioritaet || 'normal',
      kategorie: task.kategorie || '',
      isRecurring: task.isRecurring || false,
      frequency: task.frequency || '',
      startDate: task.startDate || '',
      endDate: task.endDate || ''
    });
    setShowModal(true);
  };

  const handleNewTask = () => {
    resetForm();
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Aufgabe wirklich löschen?')) {
      await deleteData('tasks', taskId);
      await loadAll();
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateData('tasks', taskId, { status: newStatus });
    await loadAll();
  };

  const openStatusModal = (task) => {
    setStatusModalTask(task);
    setStatusForm({
      status: task.status || 'offen',
      startTime: task.startTime ? new Date(task.startTime).toISOString().slice(0,16) : '',
      endTime: task.endTime ? new Date(task.endTime).toISOString().slice(0,16) : ''
    });
  };

  const saveStatusModal = async () => {
    if (!statusModalTask) return;
    const toIso = (val) => (val ? new Date(val).toISOString() : null);
    await updateData('tasks', statusModalTask.id, {
      status: statusForm.status,
      startTime: toIso(statusForm.startTime),
      endTime: toIso(statusForm.endTime)
    });
    setStatusModalTask(null);
    await loadAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Aufgabenverwaltung</h2>
        {(role === 'admin' || role === 'verwalter' || role === 'bewohner') && (
          <button
            onClick={handleNewTask}
            className="bg-[#15505d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>{role === 'bewohner' ? 'Neue Aufgabe melden' : 'Aufgabe erstellen'}</span>
          </button>
        )}
      </div>

      <TaskFilters
        buildings={(buildings || []).map(b => ({ id: b.name, name: b.name, titel: b.name }))}
        value={adminTaskFilters}
        onChange={setAdminTaskFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasksAdmin.map((task) => (
          <div key={task.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">{task.titel}</h3>
                <StatusBadge status={task.status} />
              </div>
              <div className="flex items-center space-x-2 ml-2">
                {(role === 'admin' || (role === 'verwalter' && buildings.some(b => (b.verwalter === currentUser?.email || (users.find(u => u.email === currentUser?.email)?.gebaeude || []).includes(b.name)) && b.name === task.gebaeude)) || (role === 'service' && task.zugewiesen === currentUser?.email) || (role === 'bewohner' && task.ersteller === currentUser?.email)) && (
                  <button
                    onClick={() => openStatusModal(task)}
                    className="p-2 text-slate-600 hover:text-[#15505d] hover:bg-slate-100 rounded-lg transition-colors"
                    title="Status & Zeiten ändern"
                  >
                    <Clock size={16} />
                  </button>
                )}
                {(role === 'admin' || (role === 'service' && task.zugewiesen === currentUser?.email) || (role === 'verwalter' && buildings.some(b => (b.verwalter === currentUser?.email || (users.find(u => u.email === currentUser?.email)?.gebaeude || []).includes(b.name)) && b.name === task.gebaeude)) || (role === 'bewohner' && task.ersteller === currentUser?.email)) && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 text-slate-600 hover:text-[#15505d] hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    {(role === 'admin' || (role === 'bewohner' && task.ersteller === currentUser?.email)) && (
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{task.beschreibung}</p>

            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <Building size={12} />
                <span>{task.gebaeude}</span>
              </div>
              {task.zugewiesen && (
                <div className="flex items-center space-x-2">
                  <Users size={12} />
                  <span>Zugewiesen: {task.zugewiesen}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar size={12} />
                <span>Erstellt: {new Date(task.erstellt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Inline status moved to header next to edit icon */}
          </div>
        ))}
      </div>

      {(role === 'admin' || role === 'verwalter' || role === 'bewohner') && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTask ? "Aufgabe bearbeiten" : (role === 'bewohner' ? "Neue Aufgabe melden" : "Aufgabe erstellen")}>
          <Formik enableReinitialize initialValues={formData} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, setFieldValue }) => {
              // Get user's accessible buildings
              const currentUserData = users.find(u => u.email === currentUser?.email);
              const userBuildings = Array.isArray(currentUserData?.gebaeude) ? currentUserData.gebaeude : (currentUserData?.gebaeude ? [currentUserData.gebaeude] : []);
              
              const accessibleBuildings = role === 'admin' 
                ? buildings 
                : role === 'verwalter'
                  ? buildings.filter(b => b.verwalter === currentUser?.email || userBuildings.includes(b.name))
                  : buildings.filter(b => userBuildings.includes(b.name));

              return (
              <Form className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 md:pr-2">
                <FormInput
                  label="Titel"
                  value={values.titel}
                  onChange={e => setFieldValue('titel', e.target.value)}
                  placeholder={role === 'bewohner' ? "z.B. Defekte Glühbirne im Flur" : "Kurze Beschreibung der Aufgabe"}
                  required
                />

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Beschreibung</label>
                  <textarea
                    value={values.beschreibung}
                    onChange={e => setFieldValue('beschreibung', e.target.value)}
                    placeholder={role === 'bewohner' ? "Beschreiben Sie das Problem..." : "Detaillierte Beschreibung der Aufgabe"}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
                    rows="3"
                    required
                  />
                  <div className="text-red-600 text-xs mt-1"><ErrorMessage name="beschreibung" /></div>
                </div>

                <FormSelect
                  label="Gebäude"
                  value={values.gebaeude}
                  onChange={e => setFieldValue('gebaeude', e.target.value)}
                  options={accessibleBuildings.map(b => ({ value: b.name, label: b.name }))}
                  required
                />
                <div className="text-red-600 text-xs mt-1"><ErrorMessage name="gebaeude" /></div>

                {role !== 'bewohner' && (
                  <>
                    <FormSelect
                      label="Zugewiesen an"
                      value={values.zugewiesen}
                      onChange={e => setFieldValue('zugewiesen', e.target.value)}
                      options={users.filter(u => u.rolle === 'service').map(u => ({ value: u.email, label: u.name || u.email }))}
                    />

                    <FormSelect
                      label="Status"
                      value={values.status}
                      onChange={e => setFieldValue('status', e.target.value)}
                      options={[
                        { value: 'offen', label: 'Offen' },
                        { value: 'wird bearbeitet', label: 'In Bearbeitung' },
                        { value: 'erledigt', label: 'Erledigt' }
                      ]}
                      required
                    />

                    <FormSelect
                      label="Priorität"
                      value={values.prioritaet}
                      onChange={e => setFieldValue('prioritaet', e.target.value)}
                      options={[
                        { value: 'niedrig', label: 'Niedrig' },
                        { value: 'normal', label: 'Normal' },
                        { value: 'hoch', label: 'Hoch' },
                        { value: 'kritisch', label: 'Kritisch' }
                      ]}
                      required
                    />

                    <FormInput
                      label="Kategorie"
                      value={values.kategorie}
                      onChange={e => setFieldValue('kategorie', e.target.value)}
                      placeholder="z.B. Reparatur, Wartung, Reinigung"
                    />
                  </>
                )}

                {role !== 'bewohner' && (
                  <div className="mb-2">
                    <label className="inline-flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={values.isRecurring || false}
                        onChange={(e) => setFieldValue('isRecurring', e.target.checked)}
                        className="rounded border-slate-300 text-[#15505d] focus:ring-[#15505d]"
                      />
                      <span className="text-sm font-semibold text-slate-700">Wiederkehrende Aufgabe</span>
                    </label>
                  </div>
                )}

                {values.isRecurring && (
                  <div className="space-y-4">
                    <FormSelect
                      label="Frequenz"
                      value={values.frequency}
                      onChange={(e) => setFieldValue('frequency', e.target.value)}
                      options={[
                        { value: 'daily', label: 'Täglich' },
                        { value: 'weekly', label: 'Wöchentlich' },
                        { value: 'monthly', label: 'Monatlich' }
                      ]}
                      required
                    />
                    <div className="text-red-600 text-xs mt-1"><ErrorMessage name="frequency" /></div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Startdatum</label>
                      <input
                        type="date"
                        value={values.startDate || ''}
                        onChange={(e) => setFieldValue('startDate', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
                      />
                      <div className="text-red-600 text-xs mt-1"><ErrorMessage name="startDate" /></div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Enddatum (optional)</label>
                      <input
                        type="date"
                        value={values.endDate || ''}
                        onChange={(e) => setFieldValue('endDate', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#15505d] text-white rounded-lg font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>{editTask ? 'Speichern' : (role === 'bewohner' ? 'Aufgabe melden' : 'Erstellen')}</span>
                  </button>
                </div>
              </Form>
              );
            }}
          </Formik>
        </Modal>
      )}

      {/* Status & Times Modal */}
      <Modal
        isOpen={!!statusModalTask}
        onClose={() => setStatusModalTask(null)}
        title={statusModalTask ? `Status & Zeiten: ${statusModalTask.titel}` : 'Status & Zeiten'}
      >
        <div className="space-y-4">
          <FormSelect
            label="Status"
            value={statusForm.status}
            onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
            options={[
              { value: 'offen', label: 'Offen' },
              { value: 'wird bearbeitet', label: 'In Bearbeitung' },
              { value: 'erledigt', label: 'Erledigt' }
            ]}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Startzeit</label>
            <input
              type="datetime-local"
              value={statusForm.startTime}
              onChange={(e) => setStatusForm({ ...statusForm, startTime: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Endzeit</label>
            <input
              type="datetime-local"
              value={statusForm.endTime}
              onChange={(e) => setStatusForm({ ...statusForm, endTime: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-2">
            <button
              type="button"
              onClick={() => setStatusModalTask(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={saveStatusModal}
              className="px-4 py-2 bg-[#15505d] text-white rounded-lg font-semibold hover:bg-[#0f3d47] transition-colors"
            >
              Speichern
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Messages Management Component
function MessagesManagement({ nachrichten, loadAll }) {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleReply = async (messageId) => {
    if (!replyText.trim()) return;

    try {
      await updateData('nachrichten', messageId, {
        beantwortet: true,
        antwort: replyText,
        beantwortetAm: new Date().toISOString()
      });
      setSelectedMessage(null);
      setReplyText('');
      await loadAll();
    } catch (error) {
      console.error('Fehler beim Antworten:', error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    await updateData('nachrichten', messageId, { beantwortet: true });
    await loadAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Nachrichten</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">
            {nachrichten.filter(n => !n.beantwortet).length} unbeantwortet
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {nachrichten.map((message) => (
          <div key={message.id} className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${!message.beantwortet ? 'border-yellow-200 bg-yellow-50/30' : 'border-slate-200'
            }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">{message.von}</span>
                  {!message.beantwortet && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                      Neu
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-3">{message.text}</p>
                <p className="text-xs text-slate-500">
                  {new Date(message.zeit).toLocaleString()}
                </p>
              </div>
            </div>

            {message.beantwortet && message.antwort && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-1">Antwort:</p>
                <p className="text-sm text-green-700">{message.antwort}</p>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-4">
              {!message.beantwortet && (
                <>
                  <button
                    onClick={() => setSelectedMessage(message)}
                    className="px-3 py-2 bg-[#15505d] text-white rounded-lg text-sm font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-1"
                  >
                    <Send size={14} />
                    <span>Antworten</span>
                  </button>
                  <button
                    onClick={() => handleMarkAsRead(message.id)}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle size={14} />
                    <span>Als gelesen markieren</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title="Nachricht beantworten"
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 mb-2">Ursprüngliche Nachricht:</p>
              <p className="text-sm text-slate-600">{selectedMessage.text}</p>
              <p className="text-xs text-slate-500 mt-2">Von: {selectedMessage.von}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ihre Antwort
              </label>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Ihre Antwort..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
                rows="4"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleReply(selectedMessage.id)}
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-[#15505d] text-white rounded-lg font-semibold hover:bg-[#0f3d47] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send size={16} />
                <span>Antwort senden</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Reports Management Component
function ReportsManagement({ meldungen, buildings, users, loadAll, currentUser, role }) {
  const [showModal, setShowModal] = useState(false);
  const [editReport, setEditReport] = useState(null);
  const [formData, setFormData] = useState({
    titel: '',
    beschreibung: '',
    gebaeude: '',
    gebaeudeId: '',
    kategorie: '',
    prioritaet: 'normal',
    images: []
  });
  const [isUploading, setIsUploading] = useState(false);

  // Filter reports based on user role
  const getFilteredReports = () => {
    switch (role) {
      case 'admin':
        return meldungen;
      case 'verwalter':
        const currentUserData = users.find(u => u.email === currentUser?.email);
        const userBuildingIds = Array.isArray(currentUserData?.gebaeude) ? currentUserData.gebaeude : (currentUserData?.gebaeude ? [currentUserData.gebaeude] : []);
        return meldungen.filter(m => {
          // Match by gebaeudeId (new) or fallback to building name
          return userBuildingIds.includes(m.gebaeudeId) || userBuildingIds.some(buildingId => {
            const building = buildings.find(b => b.id === buildingId);
            return building && building.name === m.gebaeude;
          });
        });
      case 'bewohner':
        return meldungen.filter(m => m.ersteller === currentUser?.email);
      default:
        return [];
    }
  };

  const filteredReports = getFilteredReports();

  const handleImageChange = (newImages) => {
    setFormData({ ...formData, images: newImages });
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    for (const imageObj of formData.images) {
      if (imageObj.file) {
        const storageRef = ref(storage, `reports/${Date.now()}_${imageObj.file.name}`);
        await uploadBytes(storageRef, imageObj.file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      // Upload images to Firebase Storage
      const imageUrls = await uploadImages();
      
      // Find selected building to get both ID and name
      const selectedBuilding = buildings.find(b => b.id === formData.gebaeudeId);
      
      const reportData = {
        titel: formData.titel,
        beschreibung: formData.beschreibung,
        gebaeude: selectedBuilding?.name || formData.gebaeude,
        gebaeudeId: formData.gebaeudeId,
        kategorie: formData.kategorie,
        prioritaet: formData.prioritaet,
        imageUrls: imageUrls,
        erstellt: editReport ? editReport.erstellt : new Date().toISOString(),
        ersteller: editReport ? editReport.ersteller : currentUser?.email,
        status: editReport ? editReport.status : 'offen'
      };

      if (editReport) {
        await updateData('meldungen', editReport.id, reportData);
      } else {
        await addData('meldungen', reportData);
      }
      
      setShowModal(false);
      setEditReport(null);
      setFormData({ titel: '', beschreibung: '', gebaeude: '', gebaeudeId: '', kategorie: '', prioritaet: 'normal', images: [] });
      await loadAll();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Meldung');
    }
    setIsUploading(false);
  };

  const handleEdit = (report) => {
    setEditReport(report);
    setFormData({
      titel: report.titel || '',
      beschreibung: report.beschreibung || '',
      gebaeude: report.gebaeude || '',
      gebaeudeId: report.gebaeudeId || '',
      kategorie: report.kategorie || '',
      prioritaet: report.prioritaet || 'normal',
      images: [] // Don't load existing images for editing
    });
    setShowModal(true);
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Meldung wirklich löschen?')) {
      await deleteData('meldungen', reportId);
      await loadAll();
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    await updateData('meldungen', reportId, { status: newStatus });
    await loadAll();
  };

  // Helper to get building name from ID
  const getBuildingName = (gebaeudeId, gebaeudeNameFallback) => {
    if (gebaeudeId) {
      const building = buildings.find(b => b.id === gebaeudeId);
      if (building) return building.name;
    }
    return gebaeudeNameFallback || gebaeudeId || 'Unbekannt';
  };

  // Helper to check if user can edit this report
  const canEdit = (report) => {
    if (role === 'admin') return true;
    if (role === 'bewohner' && report.ersteller === currentUser?.email) return true;
    if (role === 'verwalter') {
      const currentUserData = users.find(u => u.email === currentUser?.email);
      const userBuildingIds = Array.isArray(currentUserData?.gebaeude) ? currentUserData.gebaeude : [];
      return userBuildingIds.includes(report.gebaeudeId) || userBuildingIds.some(buildingId => {
        const building = buildings.find(b => b.id === buildingId);
        return building && building.name === report.gebaeude;
      });
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Meldungen</h2>
        <button
          onClick={() => {
            setEditReport(null);
            setFormData({ titel: '', beschreibung: '', gebaeude: '', gebaeudeId: '', kategorie: '', prioritaet: 'normal', images: [] });
            setShowModal(true);
          }}
          className="bg-[#15505d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Neue Meldung</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">{report.titel}</h3>
                <StatusBadge status={report.status} />
              </div>
              {canEdit(report) && (
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => handleEdit(report)}
                    className="p-2 text-slate-600 hover:text-[#15505d] hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  {(role === 'admin' || (role === 'bewohner' && report.ersteller === currentUser?.email)) && (
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{report.beschreibung}</p>

            {report.imageUrls && report.imageUrls.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {report.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Meldung Bild ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <Building size={12} />
                <span>{getBuildingName(report.gebaeudeId, report.gebaeude)}</span>
              </div>
              {report.kategorie && (
                <div className="flex items-center space-x-2">
                  <FileText size={12} />
                  <span>Kategorie: {report.kategorie}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar size={12} />
                <span>Erstellt: {new Date(report.erstellt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={12} />
                <span>Von: {report.ersteller}</span>
              </div>
            </div>

            {role === 'verwalter' && canEdit(report) && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <select
                  value={report.status}
                  onChange={(e) => handleStatusChange(report.id, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent"
                >
                  <option value="offen">Offen</option>
                  <option value="wird bearbeitet">In Bearbeitung</option>
                  <option value="erledigt">Erledigt</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editReport ? "Meldung bearbeiten" : "Neue Meldung"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Titel"
            value={formData.titel}
            onChange={e => setFormData({ ...formData, titel: e.target.value })}
            placeholder="Kurze Beschreibung des Problems"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Beschreibung
            </label>
            <textarea
              value={formData.beschreibung}
              onChange={e => setFormData({ ...formData, beschreibung: e.target.value })}
              placeholder="Detaillierte Beschreibung des Problems"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
              rows="3"
              required
            />
          </div>

          <FormSelect
            label="Gebäude"
            value={formData.gebaeudeId}
            onChange={e => {
              const building = buildings.find(b => b.id === e.target.value);
              setFormData({ 
                ...formData, 
                gebaeudeId: e.target.value,
                gebaeude: building?.name || ''
              });
            }}
            options={buildings
              .filter(b => {
                // Filter buildings based on user role
                if (role === 'admin') return true;
                const currentUserData = users.find(u => u.email === currentUser?.email);
                const userBuildingIds = Array.isArray(currentUserData?.gebaeude) ? currentUserData.gebaeude : [];
                return userBuildingIds.includes(b.id);
              })
              .map(b => ({ value: b.id, label: b.name }))}
            required
          />

          <FormInput
            label="Kategorie"
            value={formData.kategorie}
            onChange={e => setFormData({ ...formData, kategorie: e.target.value })}
            placeholder="z.B. Heizung, Wasser, Elektrik"
          />

          <FormSelect
            label="Priorität"
            value={formData.prioritaet}
            onChange={e => setFormData({ ...formData, prioritaet: e.target.value })}
            options={[
              { value: 'niedrig', label: 'Niedrig' },
              { value: 'normal', label: 'Normal' },
              { value: 'hoch', label: 'Hoch' },
              { value: 'kritisch', label: 'Kritisch' }
            ]}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Bilder hochladen
            </label>
            <ImageUpload
              images={formData.images}
              onImagesChange={handleImageChange}
              maxImages={5}
              label="Problem-Bilder"
            />
            <p className="text-xs text-slate-500 mt-2">
              Laden Sie Bilder hoch, um das Problem besser zu veranschaulichen (max. 5 Bilder)
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
              disabled={isUploading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-[#15505d] text-white rounded-lg font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isUploading ? 'Wird gespeichert...' : 'Speichern'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Orders Management Component
function OrdersManagement({ bestellungen, loadAll, currentUser, role }) {
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [formData, setFormData] = useState({
    artikel: '',
    beschreibung: '',
    menge: '',
    lieferant: '',
    status: 'bestellt',
    dringlichkeit: 'normal'
  });

  // Filter orders based on user role
  const getFilteredOrders = () => {
    switch (role) {
      case 'admin':
        return bestellungen;
      case 'service':
        return bestellungen.filter(b => b.besteller === currentUser?.email);
      default:
        return [];
    }
  };

  const filteredOrders = getFilteredOrders();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        menge: parseInt(formData.menge) || 1,
        erstellt: editOrder ? editOrder.erstellt : new Date().toISOString(),
        besteller: editOrder ? editOrder.besteller : currentUser?.email
      };

      if (editOrder) {
        await updateData('bestellungen', editOrder.id, orderData);
      } else {
        await addData('bestellungen', orderData);
      }
      setShowModal(false);
      setEditOrder(null);
      setFormData({ artikel: '', beschreibung: '', menge: '', lieferant: '', status: 'bestellt', dringlichkeit: 'normal' });
      await loadAll();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const handleEdit = (order) => {
    setEditOrder(order);
    setFormData({
      artikel: order.artikel || '',
      beschreibung: order.beschreibung || '',
      menge: order.menge?.toString() || '',
      lieferant: order.lieferant || '',
      status: order.status || 'bestellt',
      dringlichkeit: order.dringlichkeit || 'normal'
    });
    setShowModal(true);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Bestellung wirklich löschen?')) {
      await deleteData('bestellungen', orderId);
      await loadAll();
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await updateData('bestellungen', orderId, { status: newStatus });
    await loadAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Bestellungen</h2>
        {(role === 'admin' || role === 'service') && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#15505d] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Neue Bestellung</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Artikel</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Menge</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Lieferant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Besteller</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{order.artikel}</div>
                      {order.beschreibung && (
                        <div className="text-sm text-slate-600 line-clamp-1">{order.beschreibung}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{order.menge}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.lieferant || '-'}</td>
                  <td className="px-6 py-4">
                    {role === 'admin' ? (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent"
                      >
                        <option value="bestellt">Bestellt</option>
                        <option value="unterwegs">Unterwegs</option>
                        <option value="geliefert">Geliefert</option>
                        <option value="storniert">Storniert</option>
                      </select>
                    ) : (
                      <StatusBadge status={order.status} />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.besteller}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(order)}
                        className="p-2 text-slate-600 hover:text-[#15505d] hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      {role === 'admin' && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editOrder ? "Bestellung bearbeiten" : "Neue Bestellung"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Artikel"
            value={formData.artikel}
            onChange={e => setFormData({ ...formData, artikel: e.target.value })}
            placeholder="Name des Artikels"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Beschreibung
            </label>
            <textarea
              value={formData.beschreibung}
              onChange={e => setFormData({ ...formData, beschreibung: e.target.value })}
              placeholder="Zusätzliche Informationen zum Artikel"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent transition-all duration-200"
              rows="2"
            />
          </div>

          <FormInput
            label="Menge"
            type="number"
            value={formData.menge}
            onChange={e => setFormData({ ...formData, menge: e.target.value })}
            placeholder="Anzahl"
            required
          />

          <FormInput
            label="Lieferant"
            value={formData.lieferant}
            onChange={e => setFormData({ ...formData, lieferant: e.target.value })}
            placeholder="Name des Lieferanten"
          />

          <FormSelect
            label="Status"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'bestellt', label: 'Bestellt' },
              { value: 'unterwegs', label: 'Unterwegs' },
              { value: 'geliefert', label: 'Geliefert' },
              { value: 'storniert', label: 'Storniert' }
            ]}
            required
          />

          <FormSelect
            label="Dringlichkeit"
            value={formData.dringlichkeit}
            onChange={e => setFormData({ ...formData, dringlichkeit: e.target.value })}
            options={[
              { value: 'niedrig', label: 'Niedrig' },
              { value: 'normal', label: 'Normal' },
              { value: 'hoch', label: 'Hoch' },
              { value: 'kritisch', label: 'Kritisch' }
            ]}
            required
          />

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#15505d] text-white rounded-lg font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Speichern</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Settings Component
function SettingsManagement({ settings, setSettings }) {
  const [formData, setFormData] = useState({
    supportPhone: settings.supportPhone || '',
    supportMail: settings.supportMail || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setData('settings', 'main', formData);
      setSettings(formData);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-900">Einstellungen</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">Support-Kontakt</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Support-Telefon"
            value={formData.supportPhone}
            onChange={e => setFormData({ ...formData, supportPhone: e.target.value })}
            placeholder="+49 123 456789"
          />

          <FormInput
            label="Support-E-Mail"
            type="email"
            value={formData.supportMail}
            onChange={e => setFormData({ ...formData, supportMail: e.target.value })}
            placeholder="support@keos.de"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#15505d] text-white rounded-lg font-semibold hover:bg-[#0f3d47] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Speichere...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Speichern</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =======================
   DASHBOARD COMPONENTS
   ======================= */

// Admin Panel Component
function AdminPanel({ users, buildings, tasks, meldungen, nachrichten, bestellungen, settings, loadAll, setSettings }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    email: '',
    username: '',
    rolle: 'bewohner',
    gebaeude: [],
    name: ''
  });

  // Alle Hook-Aufrufe für Zeiterfassung hier am Anfang
  const [selectedServiceMitarbeiter, setSelectedServiceMitarbeiter] = useState('alle');
  const [timeFilter, setTimeFilter] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMitarbeiterEmail, setSelectedMitarbeiterEmail] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFilter, setTaskFilter] = useState('');
  const [newTask, setNewTask] = useState({
    titel: '',
    beschreibung: '',
    gebaeude: '',
    zugewiesen: '',
    status: 'offen',
    intervall: 'einmalig'
  });

  const filteredTasks = tasks.filter(task =>
    task.gebaeude?.toLowerCase().includes(taskFilter.toLowerCase())
  );

  const handleCreateTask = async () => {
    if (!newTask.titel || !newTask.beschreibung) return;

    await addData('tasks', {
      ...newTask,
      erstellt: new Date().toISOString(),
      ersteller: auth.currentUser?.email
    });

    setNewTask({
      titel: '',
      beschreibung: '',
      gebaeude: '',
      zugewiesen: '',
      status: 'offen',
      intervall: 'einmalig'
    });
    setShowTaskModal(false);
    await loadAll();
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    await setData('tasks', taskId, { status: newStatus });
    await loadAll();
  };

  // Service-Mitarbeiter aus users filtern
  const serviceMitarbeiter = users.filter(u => u.rolle === 'service');

  // Erledigte Aufgaben mit Zeitdaten
  const completedTasks = tasks.filter(t =>
    t.status === 'erledigt' &&
    t.gestartet &&
    t.beendet
  );

  // Nach Service-Mitarbeiter filtern
  const filteredTasksForTime = selectedServiceMitarbeiter === 'alle'
    ? completedTasks
    : completedTasks.filter(t => t.zugewiesen === selectedServiceMitarbeiter);

  // Nach Zeitraum filtern
  const now = new Date();
  const timeFilteredTasks = filteredTasksForTime.filter(task => {
    if (timeFilter === 'alle') return true;
    const taskDate = new Date(task.beendet);
    const daysAgo = parseInt(timeFilter);
    const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return taskDate >= cutoffDate;
  });

  // Nach Suchbegriff filtern
  const searchFilteredTasks = timeFilteredTasks.filter(task =>
    task.titel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.gebaeude.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await setData("users", editingUser.id, userForm);
      } else {
        await addData("users", userForm);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ email: '', username: '', rolle: 'bewohner', gebaeude: [], name: '' });
      await loadAll();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      email: '',
      username: '',
      rolle: 'bewohner',
      gebaeude: [],
      name: ''
    });
    setEditingUser(null);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      email: user.email || '',
      username: user.username || '',
      rolle: user.rolle || 'bewohner',
      gebaeude: Array.isArray(user.gebaeude) ? user.gebaeude : (user.gebaeude ? [user.gebaeude] : []),
      name: user.name || ''
    });
    setShowUserModal(true);
  };

  const handleNewUser = () => {
    resetUserForm();
    setShowUserModal(true);
  };

  const handleBuildingToggle = (buildingName) => {
    setUserForm(prev => ({
      ...prev,
      gebaeude: prev.gebaeude.includes(buildingName)
        ? prev.gebaeude.filter(b => b !== buildingName)
        : [...prev.gebaeude, buildingName]
    }));
  };

  // Arbeitszeit berechnen
  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, totalMinutes: Math.floor(diffMs / (1000 * 60)) };
  };

  // Gesamtstatistiken
  const totalMinutes = searchFilteredTasks.reduce((sum, task) => {
    const duration = calculateDuration(task.gestartet, task.beendet);
    return sum + duration.totalMinutes;
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Mitarbeiter-Statistiken
  const mitarbeiterStats = serviceMitarbeiter.map(mitarbeiter => {
    const mitarbeiterTasks = searchFilteredTasks.filter(t => t.zugewiesen === mitarbeiter.email);
    const mitarbeiterMinutes = mitarbeiterTasks.reduce((sum, task) => {
      const duration = calculateDuration(task.gestartet, task.beendet);
      return sum + duration.totalMinutes;
    }, 0);
    return {
      ...mitarbeiter,
      tasks: mitarbeiterTasks.length,
      totalMinutes: mitarbeiterMinutes,
      hours: Math.floor(mitarbeiterMinutes / 60),
      minutes: mitarbeiterMinutes % 60
    };
  }).filter(m => m.tasks > 0);

  // CSV Export
  const exportTimeData = () => {
    const columns = [
      { key: 'titel', label: 'Aufgabe' },
      { key: 'gebaeude', label: 'Gebäude' },
      { key: 'zugewiesen', label: 'Service-Mitarbeiter' },
      { key: 'gestartet', label: 'Beginn' },
      { key: 'beendet', label: 'Ende' },
      { key: 'dauer', label: 'Arbeitszeit (Min)' },
      { key: 'serviceKommentar', label: 'Kommentar' }
    ];

    const exportData = searchFilteredTasks.map(task => {
      const duration = calculateDuration(task.gestartet, task.beendet);
      return {
        ...task,
        gestartet: new Date(task.gestartet).toLocaleString('de-DE'),
        beendet: new Date(task.beendet).toLocaleString('de-DE'),
        dauer: duration.totalMinutes
      };
    });

    exportCSV('zeiterfassung-admin', columns, exportData);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard title="Nutzer" value={users.length} icon={Users} color="blue" />
                <StatsCard title="Gebäude" value={buildings.length} icon={Building} color="green" />
                <StatsCard title="Offene Aufgaben" value={tasks.filter(t => t.status === 'offen').length} icon={ClipboardList} color="yellow" />
                <StatsCard title="Nachrichten" value={nachrichten.filter(n => !n.beantwortet).length} icon={MessageSquare} color="red" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="keos-card">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Neueste Aufgaben</h3>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{task.titel}</p>
                        <p className="text-sm text-slate-600">{task.gebaeude}</p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="keos-card">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Unbeantw. Nachrichten</h3>
                <div className="space-y-3">
                  {nachrichten.filter(n => !n.beantwortet).slice(0, 5).map(msg => (
                    <div key={msg.id} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-900 line-clamp-2">{msg.text}</p>
                      <p className="text-xs text-slate-500 mt-1">Von: {msg.von}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'timetracking':
        return (
          <Timesheet />
        );

      case 'users':
        return <UserManagement users={users} buildings={buildings} loadAll={loadAll} />;

      case 'buildings':
        return <BuildingManagement buildings={buildings} users={users} loadAll={loadAll} role="admin" currentUser={auth.currentUser} />;

      case 'tasks':
        return <TaskManagement tasks={tasks} buildings={buildings} users={users} loadAll={loadAll} currentUser={auth.currentUser} role="admin" />;

      case 'messages':
        return <MessagesManagement nachrichten={nachrichten} loadAll={loadAll} />;

      case 'orders':
        return <OrdersManagement bestellungen={bestellungen} loadAll={loadAll} currentUser={auth.currentUser} role="admin" />;

      case 'settings':
        return <SettingsManagement settings={settings} setSettings={setSettings} />;

      default:
        return (
          <div className="text-center py-12">
            <ClipboardList size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Bereich in Entwicklung</h3>
            <p className="text-slate-600">Dieser Bereich wird bald verfügbar sein.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role="admin"
        user={auth.currentUser}
        onLogout={() => signOut(auth)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 pb-24 md:pb-8">
          {renderContent()}
        </main>
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} role="admin" />
    </div>
  );
}

// Service Dashboard Component
function ServiceDashboard({ user, tasks, meldungen, buildings, users, bestellungen, loadAll }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [taskToFinish, setTaskToFinish] = useState(null);
  const [finishingTask, setFinishingTask] = useState(null);
  const [taskComment, setTaskComment] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const [timeFilter, setTimeFilter] = useState('');
  const [dateRange, setDateRange] = useState('week'); // week, month, all
  const [taskFilter, setTaskFilter] = useState('');

  const myTasks = tasks.filter(t => t.zugewiesen === user?.email);
  const filteredTasks = myTasks.filter(task =>
    task.gebaeude?.toLowerCase().includes(taskFilter.toLowerCase()) ||
    task.titel?.toLowerCase().includes(taskFilter.toLowerCase())
  );

  // Laufzeit berechnen
  const calculateDuration = (startTime, endTime = null) => {
    if (!startTime) return "Nicht gestartet";

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const startTask = async (taskId) => {
    const startTime = new Date().toISOString();
    await setData("tasks", taskId, {
      status: "wird bearbeitet",
      gestartet: startTime
    });
    await loadAll();
  };

  const openFinishModal = (task) => {
    setFinishingTask(task);
    setTaskComment('');
  };

  const finishTask = async () => {
    if (!taskComment.trim()) return;

    setSavingTask(true);
    const endTime = new Date().toISOString();
    await setData("tasks", finishingTask.id, {
      status: "erledigt",
      beendet: endTime,
      serviceKommentar: taskComment
    });

    setFinishingTask(null);
    setTaskComment('');
    setSavingTask(false);
    await loadAll();
  };

  const closeFinishModal = () => {
    setFinishingTask(null);
  };

  // Zeiterfassung Funktionen
  const getWorkingHours = () => {
    const completedTasks = myTasks.filter(t => t.status === 'erledigt' && t.gestartet && t.beendet);

    // Datum Filter
    const now = new Date();
    const filteredTasksForTime = completedTasks.filter(task => {
      const endDate = new Date(task.beendet);
      if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return endDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return endDate >= monthAgo;
      }
      return true; // all
    });

    // Text Filter
    const searchFiltered = filteredTasksForTime.filter(task =>
      task.titel?.toLowerCase().includes(timeFilter.toLowerCase()) ||
      task.gebaeude?.toLowerCase().includes(timeFilter.toLowerCase())
    );

    return searchFiltered.map(task => {
      const start = new Date(task.gestartet);
      const end = new Date(task.beendet);
      const durationMs = end - start;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      return {
        ...task,
        duration: `${hours}h ${minutes}m`,
        durationHours: hours + minutes / 60,
        startFormatted: start.toLocaleDateString('de-DE') + ' ' + start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        endFormatted: end.toLocaleDateString('de-DE') + ' ' + end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      };
    });
  };

  const getTotalHours = () => {
    const workingHours = getWorkingHours();
    const total = workingHours.reduce((sum, task) => sum + task.durationHours, 0);
    const hours = Math.floor(total);
    const minutes = Math.floor((total % 1) * 60);
    return `${hours}h ${minutes}m`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Dashboard</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatsCard title="Meine Aufgaben" value={myTasks.length} icon={ClipboardList} color="blue" />
                <StatsCard title="Offen" value={myTasks.filter(t => t.status === 'offen').length} icon={AlertCircle} color="red" />
                <StatsCard title="In Bearbeitung" value={myTasks.filter(t => t.status === 'wird bearbeitet').length} icon={Clock} color="yellow" />
              </div>
            </div>

            {/* My Tasks */}
            <div className="keos-card">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Meine Aufgaben</h3>
              <div className="space-y-3">
                {myTasks.slice(0, 10).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{task.titel}</h4>
                      <p className="text-sm text-slate-600 mt-1">{task.beschreibung}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Building size={12} />
                          <span>{task.gebaeude}</span>
                        </span>
                        <span>Erstellt: {new Date(task.erstellt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Meine Aufgaben</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Nach Gebäude oder Titel filtern..."
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="keos-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aufgabe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gebäude</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Arbeitszeit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service-Kommentar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">{task.titel}</div>
                            <div className="text-sm text-slate-500 line-clamp-2">{task.beschreibung}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {task.gebaeude}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {task.status === 'erledigt' && task.gestartet && task.beendet ? (
                            <div>
                              <div className="font-medium text-slate-900">
                                {calculateDuration(task.gestartet, task.beendet)}
                              </div>
                              <div className="text-xs">
                                Start: {new Date(task.gestartet).toLocaleString('de-DE')}
                              </div>
                              <div className="text-xs">
                                Ende: {new Date(task.beendet).toLocaleString('de-DE')}
                              </div>
                            </div>
                          ) : task.status === 'wird bearbeitet' && task.gestartet ? (
                            <div>
                              <div className="font-medium text-blue-600">
                                Läuft: {calculateDuration(task.gestartet)}
                              </div>
                              <div className="text-xs">
                                Start: {new Date(task.gestartet).toLocaleString('de-DE')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Nicht gestartet</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {task.serviceKommentar ? (
                            <div className="max-w-xs">
                              <p className="line-clamp-2">{task.serviceKommentar}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {task.status === 'offen' && (
                            <button
                              onClick={() => startTask(task.id)}
                              style={{
                                backgroundColor: 'white',
                                color: '#15505d',
                                border: '2px solid #15505d',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#15505d';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#15505d';
                              }}
                            >
                              Aufgabe starten
                            </button>
                          )}
                          {task.status === 'wird bearbeitet' && (
                            <button
                              onClick={() => openFinishModal(task)}
                              style={{
                                backgroundColor: 'white',
                                color: '#16a34a',
                                border: '2px solid #16a34a',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#16a34a';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#16a34a';
                              }}
                            >
                              Aufgabe beenden
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'timetracking':
        const workingHours = getWorkingHours();
        const totalHours = getTotalHours();

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Zeiterfassung</h2>

              {/* Filter und Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <div className="lg:col-span-2">
                  <input
                    type="text"
                    placeholder="Nach Aufgabe oder Gebäude suchen..."
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="keos-input"
                  />
                </div>
                <div>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="keos-input"
                  >
                    <option value="week">Letzte 7 Tage</option>
                    <option value="month">Letzte 30 Tage</option>
                    <option value="all">Alle Zeiten</option>
                  </select>
                </div>
                <div className="keos-card bg-[#15505d] text-white">
                  <div className="text-center">
                    <p className="text-sm opacity-90">Gesamtzeit</p>
                    <p className="text-2xl font-bold">{totalHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Zeiterfassung Tabelle */}
            <div className="keos-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aufgabe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gebäude</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Beginn</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ende</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Arbeitszeit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kommentar</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {workingHours.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                          <Clock size={48} className="mx-auto mb-4 text-slate-300" />
                          <p className="text-lg font-medium">Keine Zeiterfassung gefunden</p>
                          <p className="text-sm">Beenden Sie Aufgaben um Arbeitszeiten zu erfassen</p>
                        </td>
                      </tr>
                    ) : (
                      workingHours.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">{task.titel}</p>
                              <p className="text-sm text-slate-500 line-clamp-2">{task.beschreibung}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Building size={16} className="text-slate-400" />
                              <span className="text-sm text-slate-900">{task.gebaeude}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-slate-900 font-medium">{task.startFormatted.split(' ')[1]}</p>
                              <p className="text-slate-500">{task.startFormatted.split(' ')[0]}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-slate-900 font-medium">{task.endFormatted.split(' ')[1]}</p>
                              <p className="text-slate-500">{task.endFormatted.split(' ')[0]}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <Clock size={14} className="mr-1" />
                              {task.duration}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {task.serviceKommentar || '-'}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Zusammenfassung */}
            {workingHours.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  title="Erledigte Aufgaben"
                  value={workingHours.length}
                  icon={CheckCircle}
                  color="green"
                />
                <StatsCard
                  title="Durchschnitt/Aufgabe"
                  value={workingHours.length > 0 ?
                    `${Math.round(workingHours.reduce((sum, t) => sum + t.durationHours, 0) / workingHours.length * 10) / 10}h` :
                    '0h'
                  }
                  icon={Clock}
                  color="blue"
                />
                <StatsCard
                  title="Gesamtzeit"
                  value={totalHours}
                  icon={ClipboardList}
                  color="purple"
                />
              </div>
            )}
          </div>
        );

      case 'orders':
        return <OrdersManagement bestellungen={bestellungen} loadAll={loadAll} currentUser={user} role="service" />;

      default:
        return (
          <div className="text-center py-12">
            <ClipboardList size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Bereich in Entwicklung</h3>
            <p className="text-slate-600">Dieser Bereich wird bald verfügbar sein.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role="service"
        user={user}
        onLogout={() => signOut(auth)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          {renderContent()}
        </main>
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} role="service" />

      {/* Task Finish Modal */}
      {finishingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Aufgabe beenden</h3>
                <button
                  onClick={closeFinishModal}
                  className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900">{finishingTask.titel}</h4>
                <p className="text-sm text-slate-600 mt-1">{finishingTask.beschreibung}</p>
                <p className="text-xs text-slate-500 mt-2">Gebäude: {finishingTask.gebaeude}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Service-Kommentar *
                </label>
                <textarea
                  value={taskComment}
                  onChange={(e) => setTaskComment(e.target.value)}
                  placeholder="Beschreiben Sie die durchgeführten Arbeiten..."
                  className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#15505d] focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeFinishModal}
                  className="keos-button keos-button-secondary"
                >
                  Abbrechen
                </button>
                <button
                  onClick={finishTask}
                  disabled={!taskComment.trim() || savingTask}
                  className="keos-button keos-button-primary"
                >
                  {savingTask ? "Speichere..." : "Aufgabe beenden"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Verwalter Dashboard Component
function VerwalterDashboard({ user, tasks, meldungen, buildings, users, nachrichten, bestellungen, loadAll }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Verwalter kann mehrere Gebäude haben
  const currentUser = users.find(u => u.email === user?.email);
  const userBuildings = Array.isArray(currentUser?.gebaeude) ? currentUser.gebaeude : (currentUser?.gebaeude ? [currentUser.gebaeude] : []);

  // Gebäude basierend auf Nutzer-Zuweisung oder alter Verwalter-Feld
  const myBuildings = buildings.filter(b =>
    b.verwalter === user?.email ||
    (userBuildings.length > 0 && userBuildings.includes(b.name))
  );

  const myTasks = tasks.filter(t => myBuildings.some(b => b.name === t.gebaeude));
  const myReports = meldungen.filter(m => myBuildings.some(b => b.name === m.gebaeude));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Verwalter Dashboard</h2>
              <p className="text-slate-600">Übersicht über Ihre verwalteten Gebäude</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <StatsCard title="Meine Gebäude" value={myBuildings.length} icon={Building} color="blue" />
                <StatsCard title="Aufgaben" value={myTasks.length} icon={ClipboardList} color="green" />
                <StatsCard title="Meldungen" value={myReports.length} icon={MessageSquare} color="yellow" />
              </div>
            </div>

            {/* Buildings Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Meine Gebäude</h3>
                <Building size={20} className="text-slate-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBuildings.map(building => (
                  <div key={building.id} className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-[#15505d] rounded-lg flex items-center justify-center">
                        <Building size={20} className="text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-900">{building.name}</h4>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{building.adresse}</p>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span className="bg-white px-2 py-1 rounded-full">{building.einheiten} Einheiten</span>
                      <span className="bg-white px-2 py-1 rounded-full">{myTasks.filter(t => t.gebaeude === building.name).length} Aufgaben</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'buildings':
        return <BuildingManagement buildings={myBuildings} users={users} loadAll={loadAll} role="verwalter" currentUser={user} />;

      case 'tasks':
        return <TaskManagement tasks={myTasks} buildings={myBuildings} users={users} loadAll={loadAll} currentUser={user} role="verwalter" />;

      case 'reports':
        return <ReportsManagement meldungen={myReports} buildings={myBuildings} users={users} loadAll={loadAll} currentUser={user} role="verwalter" />;

      case 'messages':
        return <MessagesManagement nachrichten={nachrichten} loadAll={loadAll} />;

      case 'orders':
        return <OrdersManagement bestellungen={bestellungen} loadAll={loadAll} currentUser={user} role="verwalter" />;

      default:
        return (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Bereich in Entwicklung</h3>
            <p className="text-slate-600">Dieser Bereich wird bald verfügbar sein.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role="verwalter"
        user={user}
        onLogout={() => signOut(auth)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 pb-24 md:pb-8">
          {renderContent()}
        </main>
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} role="verwalter" />
    </div>
  );
}

// Bewohner Dashboard Component
function BewohnerDashboard({ user, tasks, meldungen, buildings, users, loadAll }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedBuilding, setScannedBuilding] = useState(null);

  const myReports = meldungen.filter(m => m.ersteller === user?.email);
  
  // Get resident's accessible buildings and filter tasks
  const currentUserData = users.find(u => u.email === user?.email);
  const residentBuildings = Array.isArray(currentUserData?.gebaeude) ? currentUserData.gebaeude : (currentUserData?.gebaeude ? [currentUserData.gebaeude] : []);
  const myTasks = tasks.filter(t => 
    t.ersteller === user?.email || 
    t.betrifft === user?.email ||
    (residentBuildings.length > 0 && residentBuildings.includes(t.gebaeude))
  );

  const handleQRScan = (qrData) => {
    setScannedBuilding(qrData);
    setShowQRScanner(false);
    // Redirect to the building's public page or show building info
    window.open(qrData.url, '_blank');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Bewohner Dashboard</h2>
                  <p className="text-slate-600">Ihre Meldungen und Aufgaben im Überblick</p>
                </div>
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="bg-[#15505d] text-white px-4 py-2 rounded-lg hover:bg-[#0f3d47] transition-colors flex items-center space-x-2"
                >
                  <QrCode size={16} />
                  <span>QR Code scannen</span>
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <StatsCard title="Meine Meldungen" value={myReports.length} icon={MessageSquare} color="blue" />
                <StatsCard title="Aufgaben" value={myTasks.length} icon={ClipboardList} color="green" />
                <StatsCard title="Offen" value={myReports.filter(r => r.status === 'offen').length} icon={AlertCircle} color="red" />
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Meine Meldungen</h3>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="bg-[#15505d] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0f3d47] transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Neue Meldung</span>
                </button>
              </div>
              <div className="space-y-4">
                {myReports.slice(0, 5).map(report => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{report.titel}</h4>
                      <p className="text-sm text-slate-600 mt-1">{report.beschreibung}</p>
                      <p className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
                        <Clock size={12} />
                        <span>Erstellt: {new Date(report.erstellt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <div className="ml-6">
                      <StatusBadge status={report.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'reports':
        return <ReportsManagement meldungen={meldungen} buildings={buildings} users={users} loadAll={loadAll} currentUser={user} role="bewohner" />;

      case 'tasks':
        return <TaskManagement tasks={tasks} buildings={buildings} users={users} loadAll={loadAll} currentUser={user} role="bewohner" />;

      default:
        return (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Bereich in Entwicklung</h3>
            <p className="text-slate-600">Dieser Bereich wird bald verfügbar sein.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role="bewohner"
        user={user}
        onLogout={() => signOut(auth)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 pb-24 md:pb-8">
          {renderContent()}
        </main>
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} role="bewohner" />

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRCodeScanner 
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)} 
        />
      )}
    </div>
  );
}

/* =======================
   APP SHELL
   ======================= */
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  // Public building deep-link: render public page for /building/:id regardless of auth
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  if (path.startsWith('/run-recurring')) {
    return <RecurringCron />;
  }
  if (path.startsWith('/building/')) {
    const buildingId = path.split('/')[2] || '';
    return <PublicBuildingPage buildingId={buildingId} />;
  }
  const [buildings, setBuildings] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meldungen, setMeldungen] = useState([]);
  const [nachrichten, setNachrichten] = useState([]);
  const [bestellungen, setBestellungen] = useState([]);
  const [settings, setSettings] = useState({ supportPhone: "", supportMail: "" });
  const [loading, setLoading] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (usr) => {
      if (usr) {
        setUser(usr);
        const res = await getByField("users", "email", usr.email);
        setRole(res[0]?.rolle || "");
      } else {
        setUser(null);
        setRole("");
      }
    });
    return unsub;
  }, []);

  useEffect(() => { if (user) loadAll(); }, [user, role]);

  async function loadAll() {
    setLoading(true);
    setBuildings(await getAll("gebaeude"));
    setUsers(await getAll("users"));
    setTasks(await getAll("tasks"));
    setMeldungen(await getAll("meldungen"));
    setNachrichten(await getAll("nachrichten"));
    setBestellungen(await getAll("bestellungen"));
    const s = await getDoc(doc(db, "settings", "main"));
    setSettings(s.exists() ? s.data() : { supportPhone: "", supportMail: "" });
    setLoading(false);
  }

  async function sendeNachricht(text) {
    setSendingMsg(true);
    await addData("nachrichten", { text, von: user?.email || "-", zeit: new Date().toISOString(), beantwortet: false });
    setSendingMsg(false);
    setMsgModal(false);
    await loadAll();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Content */}
      {!user ? (
        <Login users={users} />
      ) : (
        <>
          {role === "admin" && (
            <AdminPanel
              users={users}
              buildings={buildings}
              tasks={tasks}
              meldungen={meldungen}
              nachrichten={nachrichten}
              bestellungen={bestellungen}
              settings={settings}
              loadAll={loadAll}
              setSettings={setSettings}
            />
          )}
          {role === "service" && (
            <ServiceDashboard
              user={user}
              tasks={tasks}
              meldungen={meldungen}
              buildings={buildings}
              users={users}
              bestellungen={bestellungen}
              loadAll={loadAll}
            />
          )}
          {role === "verwalter" && (
            <VerwalterDashboard
              user={user}
              tasks={tasks}
              meldungen={meldungen}
              buildings={buildings}
              users={users}
              nachrichten={nachrichten}
              bestellungen={bestellungen}
              loadAll={loadAll}
            />
          )}
          {role === "bewohner" && (
            <BewohnerDashboard
              user={user}
              tasks={tasks}
              meldungen={meldungen}
              buildings={buildings}
              users={users}
              loadAll={loadAll}
            />
          )}
        </>
      )}

      {user && settings && (
        <>
          <KontaktBar
            supportPhone={settings.supportPhone}
            supportMail={settings.supportMail}
            onSendMessage={() => setMsgModal(true)}
          />
          <NachrichtModal
            open={msgModal}
            onClose={() => setMsgModal(false)}
            onSend={sendeNachricht}
            sending={sendingMsg}
          />
        </>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#15505d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-bold text-[#15505d]">Lade Daten...</p>
            <p className="text-sm text-slate-600 mt-2">Bitte warten Sie einen Moment</p>
          </div>
        </div>
      )}
    </div>
  );
}