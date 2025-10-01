import { http, HttpResponse } from 'msw';

// Mock database
const mockDb = {
  users: [
    {
      id: 'u_1',
      firstName: 'Ali',
      lastName: 'Khan',
      email: 'ali@example.com',
      role: 'employee',
      kioskNumber: 'K-1001',
      active: true,
      branch: 'Branch 1',
      avatarUrl: '/avatars/ali.jpg',
    },
    {
      id: 'u_2',
      firstName: 'Sara',
      lastName: 'Ahmed',
      email: 'sara@example.com',
      role: 'manager',
      kioskNumber: 'K-1002',
      active: true,
      branch: 'Branch 1',
      avatarUrl: '/avatars/sara.jpg',
    },
    {
      id: 'u_3',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'admin',
      kioskNumber: 'K-1003',
      active: true,
      branch: 'HQ',
      avatarUrl: '/avatars/john.jpg',
    },
  ],
  attendance: [
    {
      id: 'att_1',
      userId: 'u_1',
      date: '2025-09-01',
      clockIn: '09:00',
      clockOut: '17:00',
      durationHours: 8,
      locationIn: { lat: 31.5204, lng: 74.3587, label: 'Office A' },
      locationOut: { lat: 31.5204, lng: 74.3587, label: 'Office A' },
      status: 'present',
    },
    {
      id: 'att_2',
      userId: 'u_2',
      date: '2025-09-01',
      clockIn: '09:15',
      clockOut: '17:30',
      durationHours: 8.25,
      locationIn: { lat: 31.5204, lng: 74.3587, label: 'Office A' },
      locationOut: { lat: 31.5204, lng: 74.3587, label: 'Office A' },
      status: 'late',
    },
  ],
  company: {
    id: 'c_1',
    name: 'ACME Ltd',
    code: 'ACM123',
    timezone: 'Asia/Karachi',
    timeFormat: '24',
    dateFormat: 'DD/MM/YYYY',
    primaryColor: '#0ea5a4',
    logoUrl: '/logo.png',
  },
  invoices: [
    {
      id: 'inv_1',
      date: '2025-07-26',
      type: 'Charge',
      plan: 'Operations hub - Basic',
      amount: 35,
      status: 'Successful',
    },
  ],
};

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    // Mock authentication
    if (email && password) {
      return HttpResponse.json({
        token: 'mock.jwt.token',
        user: {
          id: 'u_3',
          name: 'John Doe',
          email: email,
          role: 'admin',
        },
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Users endpoints
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    let filteredUsers = mockDb.users;

    if (search) {
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.firstName.toLowerCase().includes(search.toLowerCase()) ||
          u.lastName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json({
      data: filteredUsers,
      meta: {
        page,
        limit,
        total: filteredUsers.length,
      },
    });
  }),

  http.get('/api/users/:id', ({ params }) => {
    const user = mockDb.users.find((u) => u.id === params.id);
    if (user) {
      return HttpResponse.json(user);
    }
    return HttpResponse.json({ error: 'User not found' }, { status: 404 });
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    const newUser = {
      id: `u_${mockDb.users.length + 1}`,
      ...(body as object),
    };
    mockDb.users.push(newUser as any);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const body = await request.json();
    const index = mockDb.users.findIndex((u) => u.id === params.id);
    if (index !== -1) {
      mockDb.users[index] = { ...mockDb.users[index], ...(body as object) };
      return HttpResponse.json(mockDb.users[index]);
    }
    return HttpResponse.json({ error: 'User not found' }, { status: 404 });
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const index = mockDb.users.findIndex((u) => u.id === params.id);
    if (index !== -1) {
      mockDb.users.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }
    return HttpResponse.json({ error: 'User not found' }, { status: 404 });
  }),

  // Attendance endpoints
  http.get('/api/attendance', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    let filteredRecords = mockDb.attendance;

    if (from && to) {
      filteredRecords = filteredRecords.filter(
        (r) => r.date >= from && r.date <= to
      );
    }

    return HttpResponse.json({
      data: filteredRecords,
      meta: {
        total: filteredRecords.length,
      },
    });
  }),

  http.get('/api/attendance/:id', ({ params }) => {
    const record = mockDb.attendance.find((r) => r.id === params.id);
    if (record) {
      return HttpResponse.json(record);
    }
    return HttpResponse.json({ error: 'Record not found' }, { status: 404 });
  }),

  http.put('/api/attendance/:id', async ({ params, request }) => {
    const body = await request.json();
    const index = mockDb.attendance.findIndex((r) => r.id === params.id);
    if (index !== -1) {
      mockDb.attendance[index] = { ...mockDb.attendance[index], ...(body as object) };
      return HttpResponse.json(mockDb.attendance[index]);
    }
    return HttpResponse.json({ error: 'Record not found' }, { status: 404 });
  }),

  // Company endpoints
  http.get('/api/company', () => {
    return HttpResponse.json(mockDb.company);
  }),

  http.put('/api/company', async ({ request }) => {
    const body = await request.json();
    mockDb.company = { ...mockDb.company, ...(body as object) };
    return HttpResponse.json(mockDb.company);
  }),

  // Billing endpoints
  http.get('/api/billing/invoices', () => {
    return HttpResponse.json({ data: mockDb.invoices });
  }),

  http.get('/api/billing/subscription', () => {
    return HttpResponse.json({
      plan: 'Operations hub - Basic',
      status: 'active',
      amount: 35,
      nextBillingDate: '2025-08-26',
    });
  }),
];
