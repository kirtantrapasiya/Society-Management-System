const numRooms = parseInt(process.env.ROOM_COUNT) || 10; // default 10 rooms
console.log(`Creating ${numRooms} rooms...`);

for (let i = 1; i <= numRooms; i++) {
  await db.collection('rooms').doc(i.toString()).set({
    roomNumber: i.toString(),
    owner: null,
    ownerName: null,
    ownerEmail: null,
    ownerContact: null,
    isActive: null,
    isOwner: null,
    rent: null,
    renterName: null,
    renterUid: null,
    status: "unactive",
    renterContact: null,
    familyMembers: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`Room ${i} created`);
}

// Secretary creation
if (
  process.env.SECRETARY_NAME &&
  process.env.SECRETARY_EMAIL &&
  process.env.SECRETARY_PASSWORD &&
  process.env.SECRETARY_CONTACT
) {
  const userRecord = await auth.createUser({
    email: process.env.SECRETARY_EMAIL.trim().toLowerCase(),
    password: process.env.SECRETARY_PASSWORD,
    displayName: process.env.SECRETARY_NAME.trim(),
  });

  await db.collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    fullName: process.env.SECRETARY_NAME.trim(),
    email: process.env.SECRETARY_EMAIL.trim().toLowerCase(),
    contactNo: process.env.SECRETARY_CONTACT.trim(),
    role: "secretary",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
  });

  console.log(`Secretary '${process.env.SECRETARY_NAME}' created successfully!`);
} else {
  console.log("Secretary env vars not found. Skipping secretary creation.");
}
