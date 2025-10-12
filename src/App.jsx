import Meldungen from './pages/Meldungen';
import React, { useState, useEffect } from 'react';
import { Users, Building2, Settings, Home, MessageSquare, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, Menu, X } from 'lucide-react';

const App = () => {
  // States
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [meldungen, setMeldungen] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showMeldungModal, setShowMeldungModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [editingMeldung, setEditingMeldung] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('alle');
  const [filterBuilding, setFilterBuilding] = useState('alle');
  const [showPassword, setShowPassword] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize data
  useEffect(() => {
    const initialUsers = [
      { id: 1, name: 'Max Mustermann', email: 'max@example.com', role: 'admin', password: 'admin123', buildings: [] },
      { id: 2, name: 'Anna Schmidt', email: 'anna@example.com', role: 'verwalter', password: 'verwalter123', buildings: [1, 2] },
      { id: 3, name: 'Peter Müller', email: 'peter@example.com', role: 'bewohner', password: 'bewohner123', buildings: [1] },
      { id: 4, name: 'Lisa Weber', email: 'lisa@example.com', role: 'service', password: 'service123', buildings: [] }
    ];

    const initialBuildings = [
      { id: 1, name: 'Hauptgebäude A', address: 'Musterstraße 1, 12345 Berlin', units: 24, manager: 'Anna Schmidt' },
      { id: 2, name: 'Nebengebäude B', address: 'Musterstraße 3, 12345 Berlin', units: 16, manager: 'Anna Schmidt' },
      { id: 3, name: 'Wohnkomplex C', address: 'Beispielweg 5, 12345 Berlin', units: 32, manager: 'Nicht zugewiesen' }
    ];

    const initialMeldungen = [
      { 
        id: 1, 
        title: 'Heizung defekt', 
        description: 'Die Heizung in Wohnung 12 funktioniert nicht mehr.', 
        category: 'Heizung', 
        priority: 'Hoch', 
        status: 'Offen', 
        building: 1, 
        reporter: 'Peter Müller',
        reporterEmail: 'peter@example.com',
        created: '2024-01-15T10:30:00Z',
        updated: '2024-01-15T10:30:00Z'
      },
      { 
        id: 2, 
        title: 'Wasserschaden Keller', 
        description: 'Im Keller ist Wasser eingedrungen, vermutlich durch defekte Leitung.', 
        category: 'Wasser', 
        priority: 'Dringend', 
        status: 'In Bearbeitung', 
        building: 1, 
        reporter: 'Anna Schmidt',
        reporterEmail: 'anna@example.com',
        created: '2024-01-14T14:20:00Z',
        updated: '2024-01-15T09:15:00Z'
      }
    ];

    setUsers(initialUsers);
    setBuildings(initialBuildings);
    setMeldungen(initialMeldungen);
    setCurrentUser(initialUsers[0]); // Admin als Standard
  }, []);

  // Helper functions
  const getBuildingName = (buildingId) => {
    const building = buildings.find(b => b.id === buildingId);
    return building ? building.name : 'Unbekannt';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Offen': return 'status-offen';
      case 'In Bearbeitung': return 'status-bearbeitet';
      case 'Erledigt': return 'status-erledigt';
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

  // Meldung functions
  const handleSaveMeldung = (meldungData) => {
    const now = new Date().toISOString();
    
    if (editingMeldung) {
      setMeldungen(meldungen.map(meldung => 
        meldung.id === editingMeldung.id 
          ? { ...meldungData, id: editingMeldung.id, updated: now }
          : meldung
      ));
    } else {
      const newMeldung = { 
        ...meldungData, 
        id: Date.now(), 
        reporter: currentUser.name,
        reporterEmail: currentUser.email,
        created: now,
        updated: now
      };
      setMeldungen([...meldungen, newMeldung]);
    }
    setShowMeldungModal(false);
    setEditingMeldung(null);
  };

  const handleDeleteMeldung = (meldungId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Meldung löschen möchten?')) {
      setMeldungen(meldungen.filter(meldung => meldung.id !== meldungId));
    }
  };

  const handleStatusChange = (meldungId, newStatus) => {
    const now = new Date().toISOString();
    setMeldungen(meldungen.map(meldung => 
      meldung.id === meldungId 
        ? { ...meldung, status: newStatus, updated: now }
        : meldung
    ));
  };

  // Filter meldungen based on user role
  const getFilteredMeldungen = () => {
    let filtered = meldungen;

    // Role-based filtering
    if (currentUser.role === 'verwalter') {
      filtered = filtered.filter(meldung => currentUser.buildings.includes(meldung.building));
    } else if (currentUser.role === 'bewohner') {
      filtered = filtered.filter(meldung => 
        currentUser.buildings.includes(meldung.building) || meldung.reporterEmail === currentUser.email
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(meldung =>
        meldung.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meldung.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meldung.reporter.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'alle') {
      filtered = filtered.filter(meldung => meldung.status === filterStatus);
    }

    // Building filter
    if (filterBuilding !== 'alle') {
      filtered = filtered.filter(meldung => meldung.building === parseInt(filterBuilding));
    }

    return filtered.sort((a, b) => new Date(b.created) - new Date(a.created));
  };

  // User functions
  const handleSaveUser = (userData) => {
    if (editingUser) {
      setUsers(users.map(user => user.id === editingUser.id ? { ...userData, id: editingUser.id } : user));
    } else {
      const newUser = { ...userData, id: Date.now() };
      setUsers([...users, newUser]);
    }
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Nutzer löschen möchten?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  // Building functions
  const handleSaveBuilding = (buildingData) => {
    if (editingBuilding) {
      setBuildings(buildings.map(building => building.id === editingBuilding.id ? { ...buildingData, id: editingBuilding.id } : building));
    } else {
      const newBuilding = { ...buildingData, id: Date.now() };
      setBuildings([...buildings, newBuilding]);
    }
    setShowBuildingModal(false);
    setEditingBuilding(null);
  };

  const handleDeleteBuilding = (buildingId) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Gebäude löschen möchten?')) {
      setBuildings(buildings.filter(building => building.id !== buildingId));
    }
  };

  // Navigation items based on role - FIXED VERSION
  const getNavigationItems = () => {
    // ADMIN bekommt ALLE Tabs inklusive Meldungen
    if (currentUser && currentUser.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'meldungen', label: 'Meldungen', icon: MessageSquare },
        { id: 'users', label: 'Nutzer', icon: Users },
        { id: 'buildings', label: 'Gebäude', icon: Building2 },
        { id: 'aufgaben', label: 'Aufgaben', icon: Settings },
        { id: 'zeiterfassung', label: 'Zeiterfassung', icon: Settings },
        { id: 'nachrichten', label: 'Nachrichten', icon: Settings },
        { id: 'bestellungen', label: 'Bestellungen', icon: Settings },
        { id: 'einstellungen', label: 'Einstellungen', icon: Settings }
      ];
    }
    
    // VERWALTER bekommt auch Meldungen
    if (currentUser && currentUser.role === 'verwalter') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'meldungen', label: 'Meldungen', icon: MessageSquare },
        { id: 'users', label: 'Nutzer', icon: Users },
        { id: 'buildings', label: 'Gebäude', icon: Building2 }
      ];
    }
    
    // BEWOHNER und SERVICE bekommen auch Meldungen
    return [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'meldungen', label: 'Meldungen', icon: MessageSquare }
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-[#15505d] mr-3" />
              <h1 className="text-xl font-bold text-slate-900">KEOS Objektsprom</h1>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop user info */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900">{currentUser?.name}</div>
                <div className="text-xs text-slate-500 capitalize">{currentUser?.role}</div>
              </div>
              <div className="h-8 w-8 bg-[#15505d] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser?.name?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-[#15505d] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{currentUser?.name}</div>
                  <div className="text-xs text-slate-500 capitalize">{currentUser?.role}</div>
                </div>
              </div>
            </div>
            <nav className="px-4 py-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-[#15505d] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-[#15505d] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="keos-card">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-[#15505d]" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">Nutzer</p>
                        <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="keos-card">
                    <div className="flex items-center">
                      <Building2 className="h-8 w-8 text-[#15505d]" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">Gebäude</p>
                        <p className="text-2xl font-bold text-slate-900">{buildings.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="keos-card">
                    <div className="flex items-center">
                      <MessageSquare className="h-8 w-8 text-[#15505d]" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-600">Meldungen</p>
                        <p className="text-2xl font-bold text-slate-900">{meldungen.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Management */}
            {activeTab === 'users' && (currentUser.role === 'admin' || currentUser.role === 'verwalter') && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-slate-900">Nutzer verwalten</h2>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setShowUserModal(true);
                      }}
                      className="keos-button keos-button-primary flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Neuer Nutzer
                    </button>
                  )}
                </div>

                <div className="keos-card">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">E-Mail</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rolle</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gebäude</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {user.buildings.length > 0 
                                ? user.buildings.map(buildingId => getBuildingName(buildingId)).join(', ')
                                : 'Keine'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingUser(user);
                                    setShowUserModal(true);
                                  }}
                                  className="text-[#15505d] hover:text-[#0f3d47]"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                {currentUser.role === 'admin' && (
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-4 w-4" />
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
              </div>
            )}

            {/* Buildings Management */}
            {activeTab === 'buildings' && (currentUser.role === 'admin' || currentUser.role === 'verwalter') && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-slate-900">Gebäude verwalten</h2>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setEditingBuilding(null);
                        setShowBuildingModal(true);
                      }}
                      className="keos-button keos-button-primary flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Neues Gebäude
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {buildings.map((building) => (
                    <div key={building.id} className="keos-card">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">{building.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingBuilding(building);
                              setShowBuildingModal(true);
                            }}
                            className="text-[#15505d] hover:text-[#0f3d47]"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteBuilding(building.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{building.address}</p>
                      <p className="text-sm text-slate-600 mb-2">Einheiten: {building.units}</p>
                      <p className="text-sm text-slate-600">Verwalter: {building.manager}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meldungen */}
            {activeTab === 'meldungen' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-slate-900">Meldungen</h2>
                  {(currentUser.role === 'bewohner' || currentUser.role === 'verwalter') && (
                    <button
                      onClick={() => {
                        setEditingMeldung(null);
                        setShowMeldungModal(true);
                      }}
                      className="keos-button keos-button-primary flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Neue Meldung
                    </button>
                  )}
                </div>

                {/* Filter */}
                <div className="keos-card mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Suchen</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Titel, Beschreibung oder Melder..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="keos-input pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="keos-input"
                      >
                        <option value="alle">Alle Status</option>
                        <option value="Offen">Offen</option>
                        <option value="In Bearbeitung">In Bearbeitung</option>
                        <option value="Erledigt">Erledigt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Gebäude</label>
                      <select
                        value={filterBuilding}
                        onChange={(e) => setFilterBuilding(e.target.value)}
                        className="keos-input"
                      >
                        <option value="alle">Alle Gebäude</option>
                        {buildings.map((building) => (
                          <option key={building.id} value={building.id}>
                            {building.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Meldungen Liste */}
                <div className="space-y-4">
                  {getFilteredMeldungen().map((meldung) => (
                    <div key={meldung.id} className="keos-card">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{meldung.title}</h3>
                            <span className={`keos-badge ${getStatusColor(meldung.status)}`}>
                              {meldung.status}
                            </span>
                            <span className={`keos-badge ${getPriorityColor(meldung.priority)}`}>
                              {meldung.priority}
                            </span>
                          </div>
                          <p className="text-slate-600 mb-2">{meldung.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <span>Kategorie: {meldung.category}</span>
                            <span>Gebäude: {getBuildingName(meldung.building)}</span>
                            <span>Gemeldet von: {meldung.reporter}</span>
                            <span>Erstellt: {new Date(meldung.created).toLocaleDateString('de-DE')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {(currentUser.role === 'admin' || currentUser.role === 'service') && (
                            <select
                              value={meldung.status}
                              onChange={(e) => handleStatusChange(meldung.id, e.target.value)}
                              className="keos-input text-sm"
                            >
                              <option value="Offen">Offen</option>
                              <option value="In Bearbeitung">In Bearbeitung</option>
                              <option value="Erledigt">Erledigt</option>
                            </select>
                          )}
                          {(currentUser.role === 'admin' || currentUser.role === 'service' || 
                            (currentUser.role === 'verwalter' && currentUser.buildings.includes(meldung.building))) && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingMeldung(meldung);
                                  setShowMeldungModal(true);
                                }}
                                className="keos-button keos-button-secondary"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMeldung(meldung.id)}
                                className="keos-button keos-button-danger"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {getFilteredMeldungen().length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      Keine Meldungen gefunden.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          buildings={buildings}
          onSave={handleSaveUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      )}

      {/* Building Modal */}
      {showBuildingModal && (
        <BuildingModal
          building={editingBuilding}
          users={users}
          onSave={handleSaveBuilding}
          onClose={() => {
            setShowBuildingModal(false);
            setEditingBuilding(null);
          }}
        />
      )}

      {/* Meldung Modal */}
      {showMeldungModal && (
        <MeldungModal
          meldung={editingMeldung}
          buildings={buildings}
          currentUser={currentUser}
          onSave={handleSaveMeldung}
          onClose={() => {
            setShowMeldungModal(false);
            setEditingMeldung(null);
          }}
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal = ({ user, buildings, onSave, onClose, showPassword, setShowPassword }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'bewohner',
    password: user?.password || '',
    buildings: user?.buildings || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleBuildingChange = (buildingId) => {
    const updatedBuildings = formData.buildings.includes(buildingId)
      ? formData.buildings.filter(id => id !== buildingId)
      : [...formData.buildings, buildingId];
    
    setFormData({ ...formData, buildings: updatedBuildings });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {user ? 'Nutzer bearbeiten' : 'Neuer Nutzer'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="keos-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">E-Mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="keos-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rolle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="keos-input"
              >
                <option value="bewohner">Bewohner</option>
                <option value="verwalter">Verwalter</option>
                <option value="service">Service</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Passwort</label>
              <div className="relative">
                <input
                  type={showPassword[user?.id] ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="keos-input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({
                    ...showPassword,
                    [user?.id]: !showPassword[user?.id]
                  })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword[user?.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gebäude ({formData.buildings.length} ausgewählt)
              </label>
              <div className="max-h-32 overflow-y-auto border border-slate-300 rounded-lg p-2 space-y-2">
                {buildings.map((building) => (
                  <label key={building.id} className="flex items-center space-x-2 hover:bg-slate-50 p-1 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.buildings.includes(building.id)}
                      onChange={() => handleBuildingChange(building.id)}
                      className="rounded border-slate-300 text-[#15505d] focus:ring-[#15505d]"
                    />
                    <span className="text-sm text-slate-700">{building.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="keos-button keos-button-secondary"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="keos-button keos-button-primary"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Building Modal Component
const BuildingModal = ({ building, users, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: building?.name || '',
    address: building?.address || '',
    units: building?.units || '',
    manager: building?.manager || 'Nicht zugewiesen'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      units: parseInt(formData.units)
    });
  };

  const managers = users.filter(user => user.role === 'verwalter');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {building ? 'Gebäude bearbeiten' : 'Neues Gebäude'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="keos-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="keos-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Anzahl Einheiten</label>
              <input
                type="number"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                className="keos-input"
                required
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Verwalter</label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="keos-input"
              >
                <option value="Nicht zugewiesen">Nicht zugewiesen</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.name}>
                    {manager.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="keos-button keos-button-secondary"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="keos-button keos-button-primary"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Meldung Modal Component
const MeldungModal = ({ meldung, buildings, currentUser, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: meldung?.title || '',
    description: meldung?.description || '',
    category: meldung?.category || 'Allgemein',
    priority: meldung?.priority || 'Normal',
    status: meldung?.status || 'Offen',
    building: meldung?.building || (currentUser.buildings.length > 0 ? currentUser.buildings[0] : '')
  });

  const categories = [
    'Allgemein', 'Heizung', 'Wasser', 'Elektrik', 'Aufzug', 
    'Reinigung', 'Sicherheit', 'Garten', 'Parkplatz', 'Sonstiges'
  ];

  const priorities = ['Niedrig', 'Normal', 'Hoch', 'Dringend'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      building: parseInt(formData.building)
    });
  };

  // Filter buildings based on user role
  const availableBuildings = currentUser.role === 'admin' || currentUser.role === 'service'
    ? buildings
    : buildings.filter(building => currentUser.buildings.includes(building.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {meldung ? 'Meldung bearbeiten' : 'Neue Meldung'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Titel</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="keos-input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Beschreibung</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="keos-input"
                rows="4"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kategorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="keos-input"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priorität</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="keos-input"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            
            {(currentUser.role === 'admin' || currentUser.role === 'service') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="keos-input"
                >
                  <option value="Offen">Offen</option>
                  <option value="In Bearbeitung">In Bearbeitung</option>
                  <option value="Erledigt">Erledigt</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gebäude</label>
              <select
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="keos-input"
                required
              >
                <option value="">Gebäude auswählen</option>
                {availableBuildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="keos-button keos-button-secondary"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="keos-button keos-button-primary"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;