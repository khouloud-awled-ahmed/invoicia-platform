db.users.updateOne(
  { email: 'admin@techcorp.tn' },
  { $set: { password: '$2b$10$V1jRyX9n5zbiE9lFq4SXse2n7W7RnlWhlde1H/E.wdzGC4FbU19Jm' } }
);
