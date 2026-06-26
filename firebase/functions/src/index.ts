import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const YOUTUBE_API_KEY = functions.config().youtube?.apikey || '';
const ADMIN_EMAIL = 'administrador@pasionroja.cl';

async function logAdminAction(accion: string, coleccion: string, documentId: string, cambios: string) {
  await db.collection('admin_logs').add({
    accion,
    coleccion,
    documentId,
    cambios,
    adminEmail: ADMIN_EMAIL,
    timestamp: Date.now(),
  });
}

exports.checkYoutubeLive = functions.pubsub.schedule('every 5 minutes').onRun(async () => {
  if (!YOUTUBE_API_KEY) {
    console.log('YouTube API key not configured');
    return null;
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UC_EXAMPLE&eventType=live&type=video&key=${YOUTUBE_API_KEY}`
    );
    const data: any = await res.json();

    const isLive = data.items && data.items.length > 0;
    const videoId = isLive ? data.items[0].id.videoId : null;

    await db.collection('config_transmision').doc('actual').set({
      youtubeLiveId: videoId,
      estadoTransmision: isLive ? 'en_vivo' : 'terminado',
      actualizadoEn: Date.now(),
    }, { merge: true });

    console.log(`YouTube check: ${isLive ? 'LIVE' : 'offline'}`);
  } catch (error) {
    console.error('YouTube check failed:', error);
  }

  return null;
});

exports.onMarcadorUpdate = functions.firestore
  .document('partidos_en_vivo/actual')
  .onWrite(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    await logAdminAction(
      'Actualizar marcador',
      'partidos_en_vivo',
      'actual',
      JSON.stringify({ before, after })
    );
  });

exports.onNoticiaCreate = functions.firestore
  .document('noticias/{id}')
  .onCreate(async (snap, context) => {
    await logAdminAction(
      'Crear noticia',
      'noticias',
      context.params.id,
      JSON.stringify({ titulo: snap.data().titulo })
    );
  });
