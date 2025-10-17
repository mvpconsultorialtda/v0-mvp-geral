
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.onDeleteList = functions.firestore
    .document('lists/{listId}')
    .onDelete(async (snap, context) => {
        const listId = context.params.listId;
        const db = admin.firestore();
        const storage = admin.storage();

        // Delete all tasks in the list
        const tasksRef = db.collection(`lists/${listId}/tasks`);
        const tasksSnap = await tasksRef.get();
        const batch = db.batch();
        tasksSnap.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Delete all activity in the list
        const activityRef = db.collection(`lists/${listId}/activity`);
        const activitySnap = await activityRef.get();
        const activityBatch = db.batch();
        activitySnap.docs.forEach(doc => {
            activityBatch.delete(doc.ref);
        });
        await activityBatch.commit();

        // Delete all attachments in the list from storage
        const bucket = storage.bucket();
        await bucket.deleteFiles({
            prefix: `attachments/${listId}`
        });

        console.log(`Successfully deleted all data for list ${listId}`);
    });
