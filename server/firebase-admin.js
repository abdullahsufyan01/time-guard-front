import admin from "firebase-admin";

// Initialize Firebase Admin SDK
// Note: In production, use environment variables for credentials
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  })
});

export async function setPasswordForUser(uid, newPassword) {
  try {
    await admin.auth().updateUser(uid, { password: newPassword });
    console.log("Passwort geändert für User:", uid);
    return { success: true, message: "Passwort erfolgreich geändert" };
  } catch (error) {
    console.error("Fehler beim Ändern des Passworts:", error);
    return { success: false, error: error.message };
  }
}

export async function createUser(email, password, displayName) {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
    });
    console.log("Benutzer erstellt:", userRecord.uid);
    return { success: true, uid: userRecord.uid };
  } catch (error) {
    console.error("Fehler beim Erstellen des Benutzers:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUser(uid) {
  try {
    await admin.auth().deleteUser(uid);
    console.log("Benutzer gelöscht:", uid);
    return { success: true, message: "Benutzer erfolgreich gelöscht" };
  } catch (error) {
    console.error("Fehler beim Löschen des Benutzers:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserByEmail(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return { success: true, user: userRecord };
  } catch (error) {
    console.error("Fehler beim Abrufen des Benutzers:", error);
    return { success: false, error: error.message };
  }
}

export { admin };