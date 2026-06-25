/**
 * controllers/AuthController.js
 * Autentikasi via Google Sign-In.
 *
 * Frontend melakukan Google Sign-In, lalu kirim id_token ke endpoint ini.
 * Backend verifikasi token ke Google, lalu upsert user berdasarkan google_id.
 */
class AuthController {
  constructor() {
    this.users = new User();
  }

  /**
   * POST {action:"login", id_token:"<google id token>"}
   * @param {Object} body
   * @return {Object} data user.
   */
  login(body) {
    var idToken = body.id_token || body.credential;
    if (!idToken) throw ApiError.badRequest('id_token wajib diisi');

    var payload = AuthController.verifyGoogleToken(idToken);

    // Email harus sudah terdaftar di users; tidak membuat user baru.
    var user = this.users.findBy('email', payload.email);
    if (!user) {
      throw ApiError.unauthorized('User tidak terdaftar: ' + payload.email);
    }

    // Sinkronkan data profil Google ke record user.
    var updated = this.users.update(user.id, {
      google_id: payload.sub,
      name: payload.name,
      picture: payload.picture
    });

    return Result.ok({ user: updated });
  }

  /**
   * Resolve user dari id_token sebuah request. Dipakai engine untuk setiap
   * action yang butuh autentikasi (semua kecuali ping/login).
   * @param {Object} payload params (GET) / body (POST) request.
   * @return {Object} record user.
   */
  static authenticate(payload) {
    var idToken = (payload && (payload.id_token || payload.credential)) || '';
    if (!idToken) throw ApiError.unauthorized('id_token wajib diisi');

    var gp = AuthController.verifyGoogleToken(idToken);
    var user = new User().findBy('email', gp.email);
    if (!user) throw ApiError.unauthorized('User tidak terdaftar: ' + gp.email);
    return user;
  }

  /**
   * Verifikasi Google ID token ke endpoint tokeninfo. Hasil verifikasi dicache
   * sebentar (per token) agar tidak fetch ke Google di tiap request.
   * @param {string} idToken
   * @return {Object} payload token (sub, email, name, picture, aud, ...).
   */
  static verifyGoogleToken(idToken) {
    var cache = CacheService.getScriptCache();
    var key = 'gtoken:' + Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, idToken));

    var cached = cache.get(key);
    if (cached) return JSON.parse(cached);

    var url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken);
    var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

    if (res.getResponseCode() !== 200) {
      throw ApiError.unauthorized('Token Google tidak valid');
    }

    var payload = JSON.parse(res.getContentText());

    if (AuthController.CLIENT_ID && payload.aud !== AuthController.CLIENT_ID) {
      throw ApiError.unauthorized('Token bukan untuk aplikasi ini');
    }
    if (payload.email_verified === 'false') {
      throw ApiError.unauthorized('Email Google belum terverifikasi');
    }

    cache.put(key, JSON.stringify(payload), AuthController.TOKEN_CACHE_TTL);
    return payload;
  }
}

/** TTL cache hasil verifikasi token (detik). Token Google berlaku ~1 jam. */
AuthController.TOKEN_CACHE_TTL = 300;

/** Google OAuth Client ID aplikasi. Isi untuk validasi audience token. */
AuthController.CLIENT_ID = '';
