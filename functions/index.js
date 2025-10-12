const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.createUserWithPassword = functions.https.onCall(async (data, context) => {
  // Nur Admins dürfen Nutzer anlegen!
  // (Einfachheit halber prüfen wir keine Custom Claims in diesem Beispiel)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Nicht angemeldet!');
  }
  if (!data.email || !data.password) {
    throw new functions.https.HttpsError('invalid-argument', 'E-Mail und Passwort erforderlich!');
  }
  // Nutzer anlegen
  try {
    const user = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.name || "",
    });
    return { uid: user.uid, email: user.email };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});