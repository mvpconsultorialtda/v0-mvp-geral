
const { getAdminAuth } = require('@/lib/firebase-admin');

async function setAdminRole() {
  const uid = '4rONNEP4iQMNSpR1WZPII5VNEr43';
  console.log(`Attempting to set admin role for UID: ${uid}`);
  
  try {
    const auth = getAdminAuth();
    await auth.setCustomUserClaims(uid, { role: 'admin' });
    console.log(`Successfully set admin claim for UID: ${uid}`);
  } catch (error) {
    console.error('Error setting custom claim:', error);
    process.exit(1); // Exit with an error code
  }
}

setAdminRole();
