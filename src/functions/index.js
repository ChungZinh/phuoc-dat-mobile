// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.createNewUser = functions.https.onCall(async (data, context) => {
  if (!(context.auth && context.auth.token.admin)) {
    throw new functions.https.HttpsError("permission-denied", "Không có quyền.");
  }

  const { email, password, displayName } = data;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };
  } catch (err) {
    throw new functions.https.HttpsError("internal", err.message);
  }
});
