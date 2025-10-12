import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import admin from 'firebase-admin';

// Extend dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

// Initialize Firebase Admin SDK directly (no .env)
admin.initializeApp({
    credential: admin.credential.cert({
        type: 'service_account',
        project_id: 'keos-40c69',
        private_key_id: 'd9d8f6348c63118da3ea34344f953f9669a69567',
        private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoC6j1118Chjtm\nE1pTH4w7/nUTQN6Zekpu4xnxgq7bcrZwWMGL6658ABOtCCXI9R7JFRXbUMijUB4I\naYgVP7mBu3xO5oCg4eRJU4JuXfklKzvvJIyojf7HlInjt/GDOfk6iz/NSCabKzJI\nPHDfcSAxnwbsxt3L51hTLGlYU2dt8m57oCcyiwoweyLkNAjeqZ6O2EHVEcMai4Dz\nPKAVcIq1RKvzmvRzce8UZSL1vlIYqC/Eq3P42j5PF1YR9dEVAwc8xvKku9nAC6Zq\nJWbcJhwpFDhHrvaQC82ni4B3696GTmkENefP+e5Nb83MsU7Crvll1FHkg/OfjQll\nNE1NkuUzAgMBAAECggEAAot5Dxb1IfqWSBdheDEvPxRF35teWPGXfT0zU3GzZA5v\n7lAEcg/NTPn1uLhb3dw1ws53Z4jo6ocnEpzflMNUnpRliQ6/XA44OFb8aWfcpSnJ\nDDxEMZMhLqwnpvOjkHZxsMV5VwII6G8v5a5qgQnfut6CYkVKkNdVLQVF42XNRz4T\nTpkfEsrOqD3FHu5xo33dUmXl3ZsrUfwKd4g9lCpYnkH97j1h47RUDn9sPoBUJ2hN\ncYtaOOtxma7PNIS5T3xDLim4hz8cShpSQteTDz7JNEQWsa4ue2XJG8j5NV2CbQgO\nytEXRVqb0GkD1Da0k9tK8VxRMVyxNDGTlEN30h9dIQKBgQDls18zUl+ftkOX1YS0\n3EdLjkHJfzd7IK068X76qhVOZL/LhWST7rCE9z5onyU51TArQLU/CTkHrnGnfNmF\ni191XVCMgnnHIjJdXPktQoypMHTGDnVWilyYxidsQoUShnZJ6bPchOoZVDfZcYCf\n5F7F8G88NeyCmYOk/P/os1YVAwKBgQC7SSYxrxaG6EzTHiLcKxhk6/tKzq5zJoUH\nb82gkYi9sqNVi7WLR8XuEiR0rcXKamLwaxALSRFACRyWmFyZ95k3yud1K/bFE1A0\n2vfEfRxZ4r4VPAIxtsDokjuZyZFttenPbnSkkZSGsQV5OVSgG06rsqqsLhRdEi6p\n1cRJTB6AEQKBgEp3Ef/TToi6T8NjRvhTCRHndlBaW6Qg/cfEDoQ4q1uUsdDK18ZV\ndQhGFwdXwHu1Lz52Zcufs8tXtCS2BtaSTkoADGLg0ZXK8kTuJSGVF4Cp4tFqUoPR\nqx8j7hfcoMNWr/ZaOyLcPAAmG0z0zNwI7uiAf68nVBsqpVDRbC0GJnv9AoGALa+r\nbIVMln5Gd12rnU+59KyIMXh3n8luvCCu5ZN66uOP6odZMu/APdIZKIlXbYhEOGe1\nkzswxREz8xyZwklfC/goPDIMUYjjkPE1ba4jY13nhqCL3Hq7VkCN33cHTd8JeTt1\nosuMksrODgNJPIFM0J+V+MiI2SddULq/1i2GZzECgYEAyoaaG1Tvxns0Q/R0tN52\nJO8NGzRoaJEyMqFvUSLbG6WJYSLpARYJ13Ys80s+gizOlWYRe6t9GIsjZSgod9rL\nueSXuWWgZ9MLV0Ki7x0b4WauAWJBXZOvMSt86BzxxY7j5sb2fx1nWyAM3TG5reA0\nOmWNICKll/3j1edct0SZv9Q=\n-----END PRIVATE KEY-----\n`,
        client_email: 'firebase-adminsdk-fbsvc@keos-40c69.iam.gserviceaccount.com',
        client_id: '117851132256570579971',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40keos-40c69.iam.gserviceaccount.com',
        universe_domain: 'googleapis.com',
    }),
});

const db = admin.firestore();

async function shouldExecuteToday(recurringTask) {
	const { startDate, endDate, frequency, nextExecutionAt } = recurringTask;
	const now = dayjs();

	// If nextExecutionAt exists and is in the future, skip
	if (nextExecutionAt) {
		const next = dayjs(nextExecutionAt);
		if (next.isAfter(now.startOf('day'))) return false;
	}

	// Respect date range
	if (startDate && dayjs(startDate).isAfter(now, 'day')) return false;
	if (endDate && dayjs(endDate).isBefore(now, 'day')) return false;

	// Fallback logic based on startDate and frequency
	const anchor = dayjs(startDate || now.toISOString()).startOf('day');
	switch (frequency) {
		case 'daily':
			return true;
		case 'weekly':
			return now.diff(anchor, 'day') % 7 === 0;
		case 'monthly':
			return now.date() === anchor.date();
		default:
			return false;
	}
}

function getNextExecutionAt(current, frequency) {
	const base = dayjs(current || dayjs().toISOString()).startOf('day');
	switch (frequency) {
		case 'daily':
			return base.add(1, 'day').toISOString();
		case 'weekly':
			return base.add(7, 'day').toISOString();
		case 'monthly':
			return base.add(1, 'month').toISOString();
		default:
			return null;
	}
}

async function run() {
	console.log('[Cron] Start recurring task assignment');
	try {
    const snapshot = await db.collection('tasks').where('isRecurring', '==', true).get();
    const recurring = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

		console.log(`[Cron] Found ${recurring.length} recurring tasks`);

		for (const task of recurring) {
			try {
				if (!(await shouldExecuteToday(task))) {
					continue;
				}

				const newTask = {
					...task,
					isRecurring: false,
					status: 'offen',
					erstellt: new Date().toISOString(),
					lastExecutedAt: new Date().toISOString(),
				};
				delete newTask.id;
				delete newTask.nextExecutionAt; // will be set on parent

                const createdRef = await db.collection('tasks').add(newTask);
				console.log(`[Cron] Recurring task created: ${createdRef.id} for "${task.titel}" assigned to ${task.zugewiesen || 'N/A'}`);

				const nextExecutionAt = getNextExecutionAt(task.nextExecutionAt || task.startDate, task.frequency);
                await db.collection('tasks').doc(task.id).update({
					lastExecutedAt: new Date().toISOString(),
					nextExecutionAt,
				});
			} catch (e) {
				console.error(`[Cron] Error processing task ${task.id}:`, e?.message || e);
			}
		}

		console.log('[Cron] Done');
	} catch (e) {
		console.error('[Cron] Failed:', e?.message || e);
		process.exitCode = 1;
	}
}

// Always run when executed via `node index.js`
run()
	.then(() => {
		try { process.exit(0); } catch (_) {}
	})
	.catch(() => {
		try { process.exit(1); } catch (_) {}
	});
