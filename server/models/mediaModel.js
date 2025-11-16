async function createMedia(db, mediaData) {
  const [media] = await db('media').insert(mediaData).returning(['id', 'filename']);
  return media;
}

async function getMediaByUserId(db, userId) {
  const items = await db('media').where({ user_id: userId }).orderBy('created_at', 'desc').select();
  return items;
}

module.exports = { createMedia, getMediaByUserId };
