db.users.updateOne(
  { email: 'comptable.t0@techcorp.tn' },
  { $set: { password: '$2b$10$V1jRyX9n5zbiE9lFq4SXse2n7W7RnlWhlde1H/E.wdzGC4FbU19Jm' } }
);

db.users.findOne(
  { email: 'comptable.t0@techcorp.tn' },
  { password: 1, email: 1, _id: 0 }
);
