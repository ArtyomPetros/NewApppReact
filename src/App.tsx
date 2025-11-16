// @ts-nocheck

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

import ReactDOM from "react-dom/client";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";


export const ApiEndpoints = {
  authBaseUrl: "http://213.171.28.81:7000",
  ecoMonitoringBaseUrl: "http://213.171.28.81:7001",
  entertainmentsBaseUrl: "http://213.171.28.81:7002",
  storageBaseUrl: "http://213.171.28.81:7003",

  login: "/api/v1/authorization/login",
  registration: "/api/v1/authorization/registration",
  refreshToken: "/api/v1/authorization/refresh-token",
  infoByToken: "/api/v1/authorization/info-by-token",

  users: "/api/v1/users",
  userById: "/api/v1/users/",

  profiles: "/api/v1/profiles",
  profileById: "/api/v1/profiles/",
  profileInfoById: "/api/v1/profiles/info/",

  roles: "/api/v1/roles",
  roleById: "/api/v1/roles/",

  statuses: "/api/v1/statuses/",
  typeIncidents: "/api/v1/type_incidents/",
  ecoProblems: "/api/v1/eco_problems/",
  ecoProblemById: "/api/v1/eco_problems/",
  updateEcoProblemStatus: "/api/v1/eco_problems/update-status",
  updateEcoProblemManager: "/api/v1/eco_problems/update-manager",
  closeEcoProblem: "/api/v1/eco_problems/close-eco-problem",

  reports: "/api/v1/reports",
  reportStats: "/api/v1/reports/stats",
  reportStatuses: "/api/v1/report_statuses",

  filesEco: "/api/v1/files_eco",
  uploadFilesEco: "/api/v1/eco_problems/files/",
  filesReport: "/api/v1/files_report",
  uploadFilesReport: "/api/v1/files_report/upload-files",

  selfies: "/api/v1/selfies",
  animals: "/api/v1/animals",
  achievements: "/api/v1/achievements",
  contents: "/api/v1/contents",
  typeContents: "/api/v1/type_contents",
  typeEvents: "/api/v1/type_events",

  storage: "/api/v1/storage",
  storageById: "/api/v1/storage/",
  uploadFile: "/api/v1/storage/upload_file",
  getBase64File: "/api/v1/storage/get_base64_file/",
  infoByStorageIds: "/api/v1/storage/info-by-storage-ids",
};


export const api = axios.create({
  timeout: 20000,
});

api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Accept"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    const isAuthError =
      status === 401 ||
      (status === 403 &&
        (data?.detail === "Not authenticated" ||
          data?.detail === "Unauthorized"));

    if (!isAuthError) return Promise.reject(error);

    const refresh = TokenManager.getRefreshToken();
    if (!refresh) {
      TokenManager.clearTokens();
      return Promise.reject(error);
    }

    try {
      const r = await axios.post(
        `${ApiEndpoints.authBaseUrl}${ApiEndpoints.refreshToken}`,
        { refresh_token: refresh },
        { headers: { "Content-Type": "application/json" } }
      );

      const newAccess =
        r.data.access_token ||
        r.data.accessToken ||
        r.data.token ||
        null;

      if (!newAccess) {
        TokenManager.clearTokens();
        return Promise.reject(error);
      }

      TokenManager.saveAccessToken(newAccess);

      error.config.headers["Authorization"] = `Bearer ${newAccess}`;
      return api.request(error.config);
    } catch (e) {
      TokenManager.clearTokens();
      return Promise.reject(e);
    }
  }
);

/* Each model is converted to a plain JS class to match the Dart logic */

export class AuthModel {
  constructor(json) {
    this.accessToken =
      json.access_token || json.accessToken || json.token || "";
    this.refreshToken =
      json.refresh_token || json.refreshToken || "";
  }
}

export class UserModel {
  constructor(json) {
    this.id = json.user_id || json.id || "";
    this.firstName = json.first_name || json.firstName || "";
    this.lastName = json.last_name || json.lastName || "";
    this.phone = json.phone || "";
    this.roleId = json.role || json.roleId || null;
    this.profileId = json.profile_id || json.profileId || null;
  }
}

export class ProfileModel {
  constructor(json) {
    this.id = json.id || "";
    this.firstName = json.first_name || "";
    this.lastName = json.last_name || "";
    this.bio = json.bio || "";
  }

  toJson() {
    return {
      id: this.id,
      first_name: this.firstName,
      last_name: this.lastName,
      bio: this.bio,
    };
  }
}

export class StatusModel {
  constructor(json) {
    this.id = json.id;
    this.name = json.name;
  }
}

export class TypeIncidentModel {
  constructor(json) {
    this.id = json.id;
    this.name = json.name;
    this.description = json.description;
  }
}

export class EcoProblemModel {
  constructor(json) {
    this.id = json.id;
    this.title = json.title;
    this.description = json.description;
    this.typeIncidentId = json.type_incident_id;
    this.latitude = json.latitude;
    this.longitude = json.longitude;
    this.creatorId = json.creator_id;
    this.managerId = json.manager_id;
    this.statusId = json.status_id;
    this.createdAt = new Date(json.created_at);
    this.updatedAt = json.updated_at ? new Date(json.updated_at) : new Date();
    this.isClosed = json.is_closed || false;
  }

  toJson() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type_incident_id: this.typeIncidentId,
      latitude: this.latitude,
      longitude: this.longitude,
      creator_id: this.creatorId,
      manager_id: this.managerId,
      status_id: this.statusId,
      created_at: this.createdAt.toISOString(),
    };
  }
}

export class WikiModel {
  constructor(json) {
    this.id = json.id;
    this.title = json.title;
    this.subtitle = json.subtitle;
    this.text = json.text;
  }
}

export class NoParams {}

/* ---------- LOGIN USE CASE ---------- */
export class LoginUseCase {
  constructor(authRepo) {
    this.repo = authRepo;
  }
  async call(params) {
    return await this.repo.login(params.email, params.password);
  }
}
export class LoginParams {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }
}

/* ---------- REGISTER USE CASE ---------- */
export class RegisterUseCase {
  constructor(authRepo) {
    this.repo = authRepo;
  }
  async call(params) {
    return await this.repo.register(
      params.email,
      params.password,
      params.firstName,
      params.lastName,
      params.phone
    );
  }
}
export class RegisterParams {
  constructor({ email, password, firstName, lastName, phone }) {
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
  }
}

/* ---------- GET USER INFO USE CASE ---------- */
export class GetUserInfoUseCase {
  constructor(authRepo) {
    this.repo = authRepo;
  }
  async call() {
    return await this.repo.getUserInfo();
  }
}

/* ---------- LOGOUT USE CASE ---------- */
export class LogoutUseCase {
  constructor(authRepo) {
    this.repo = authRepo;
  }
  async call() {
    return await this.repo.logout();
  }
}

/* ---------- STORAGE ---------- */
export class UploadFileUseCase {
  constructor(storageRepo) {
    this.repo = storageRepo;
  }
  async call(params) {
    return this.repo.uploadFile(params.file);
  }
}
export class UploadFileParams {
  constructor({ file }) {
    this.file = file;
  }
}

/* ---------- PROFILE ---------- */
export class CreateProfileUseCase {
  constructor(profileRepo) {
    this.repo = profileRepo;
  }
  async call(params) {
    return this.repo.createProfile(params.profile);
  }
}
export class CreateProfileParams {
  constructor({ profile }) {
    this.profile = profile;
  }
}

export class UpdateProfileUseCase {
  constructor(profileRepo) {
    this.repo = profileRepo;
  }
  async call(params) {
    return this.repo.updateProfile(params.profile);
  }
}
export class UpdateProfileParams {
  constructor({ profile }) {
    this.profile = profile;
  }
}

/* ---------- ECO PROBLEMS ---------- */
export class GetEcoProblemsUseCase {
  constructor(ecoRepo) {
    this.repo = ecoRepo;
  }
  async call() {
    return await this.repo.getEcoProblems();
  }
}

export class CreateEcoProblemUseCase {
  constructor(ecoRepo) {
    this.repo = ecoRepo;
  }
  async call(params) {
    return await this.repo.createEcoProblem(params.ecoProblem);
  }
}
export class CreateEcoProblemParams {
  constructor({ ecoProblem }) {
    this.ecoProblem = ecoProblem;
  }
}

export class AuthRepositoryImpl {
  async login(email, password) {
    try {
      const r = await api.post(
        `${ApiEndpoints.authBaseUrl}${ApiEndpoints.login}`,
        null,
        { params: { email, password } }
      );

      const m = r.data;
      const at = m.access_token || m.accessToken || m.token;
      const rt = m.refresh_token || m.refreshToken;

      if (!at) throw new Error("No access token in response");

      TokenManager.saveAccessToken(at);
      if (rt) TokenManager.saveRefreshToken(rt);

      return new AuthModel(m);
    } catch (e1) {
      /* fallback with JSON body */
      try {
        const r2 = await api.post(
          `${ApiEndpoints.authBaseUrl}${ApiEndpoints.login}`,
          { email, password },
          { headers: { "Content-Type": "application/json" } }
        );

        const m = r2.data;
        const at = m.access_token || m.accessToken || m.token;
        const rt = m.refresh_token || m.refreshToken;

        if (!at) throw new Error("No access token in fallback");

        TokenManager.saveAccessToken(at);
        if (rt) TokenManager.saveRefreshToken(rt);

        return new AuthModel(m);
      } catch (e2) {
        throw new Error(
          `Login error: ${JSON.stringify(e1.response?.data)} / fallback: ${JSON.stringify(e2.response?.data)}`
        );
      }      
    }
  }

  async register(email, password, firstName, lastName, phone) {
    const payload = {
      username: email,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    };
    if (phone.trim()) payload.phone = phone.trim();

    try {
      const r = await api.post(
        `${ApiEndpoints.authBaseUrl}${ApiEndpoints.registration}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (r.status === 200 || r.status === 201) {
        const m = r.data;
        const at = m.access_token || m.accessToken || m.token;
        const rt = m.refresh_token || m.refreshToken;

        if (at) {
          TokenManager.saveAccessToken(at);
          if (rt) TokenManager.saveRefreshToken(rt);
          return new AuthModel(m);
        }

        return await this.login(email, password);
      }

      throw new Error("Registration failed");
    } catch (e) {
      throw new Error(`Registration error: ${e.response?.data}`);
    }
  }

  async getUserInfo() {
    const r = await api.get(
      `${ApiEndpoints.authBaseUrl}${ApiEndpoints.infoByToken}`
    );

    const user = new UserModel(r.data);
    if (!user.id) throw new Error("info-by-token returned no user_id");
    return user;
  }

  async logout() {
    TokenManager.clearTokens();
  }

  async isLoggedIn() {
    return TokenManager.isLoggedIn();
  }
}

export class ProfileRepositoryImpl {
  async createProfile(profile) {
    const r = await api.post(
      `${ApiEndpoints.authBaseUrl}${ApiEndpoints.profiles}`,
      profile.toJson()
    );
    return new ProfileModel(r.data);
  }

  async getProfile(id) {
    const r = await api.get(
      `${ApiEndpoints.authBaseUrl}${ApiEndpoints.profileById}${id}`
    );
    return new ProfileModel(r.data);
  }

  async updateProfile(profile) {
    const r = await api.put(
      `${ApiEndpoints.authBaseUrl}${ApiEndpoints.profileById}${profile.id}`,
      profile.toJson()
    );
    return new ProfileModel(r.data);
  }

  async deleteProfile(id) {
    await api.delete(
      `${ApiEndpoints.authBaseUrl}${ApiEndpoints.profileById}${id}`
    );
  }
}

export class StorageRepositoryImpl {
  async uploadFile(file) {
    const form = new FormData();
    form.append("file", file);

    const r = await api.post(
      `${ApiEndpoints.storageBaseUrl}${ApiEndpoints.uploadFile}`,
      form
    );
    return new StorageModel(r.data);
  }

  async getFile(id) {
    const r = await api.get(
      `${ApiEndpoints.storageBaseUrl}${ApiEndpoints.storageById}${id}`
    );
    return new StorageModel(r.data);
  }

  async deleteFile(id) {
    await api.delete(
      `${ApiEndpoints.storageBaseUrl}${ApiEndpoints.storageById}${id}`
    );
  }
}

export class CreateEcoProblemDto {
  constructor({
    title,
    description,
    typeIncidentId,
    latitude,
    longitude,
    creatorId,
    managerId,
    statusId,
    createdAt,
  }) {
    this.title = title;
    this.description = description;
    this.typeIncidentId = typeIncidentId;
    this.latitude = latitude;
    this.longitude = longitude;
    this.creatorId = creatorId;
    this.managerId = managerId;
    this.statusId = statusId;
    this.createdAt = createdAt;
  }

  toJson() {
    return {
      title: this.title,
      description: this.description,
      type_incident_id: this.typeIncidentId,
      latitude: this.latitude,
      longitude: this.longitude,
      creator_id: this.creatorId,
      manager_id: this.managerId,
      status_id: this.statusId,
      created_at: this.createdAt,
    };
  }
}

export class EcoProblemRepositoryImpl {
  async getEcoProblems() {
    try {
      const r = await api.get(
        `${ApiEndpoints.ecoMonitoringBaseUrl}${ApiEndpoints.ecoProblems}`
      );
      return r.data.map((x) => new EcoProblemModel(x));
    } catch (e) {
      return [];
    }
  }

  async getEcoProblem(id) {
    const r = await api.get(
      `${ApiEndpoints.ecoMonitoringBaseUrl}${ApiEndpoints.ecoProblemById}${id}`
    );
    return new EcoProblemModel(r.data);
  }

  async createEcoProblem(model) {
    const managerId = model.managerId?.trim()
      ? model.managerId
      : model.creatorId;

    const createdStatusId = "c709d5ce-34b9-470a-a355-e6dc43d05346";

    const dto = new CreateEcoProblemDto({
      title: model.title,
      description: model.description,
      typeIncidentId: model.typeIncidentId,
      latitude: model.latitude,
      longitude: model.longitude,
      creatorId: model.creatorId,
      managerId,
      statusId: createdStatusId,
      createdAt: model.createdAt.toISOString(),
    });

    const urls = [
      `${ApiEndpoints.ecoMonitoringBaseUrl}/api/v1/eco_problems`,
      `${ApiEndpoints.ecoMonitoringBaseUrl}/api/v1/eco_problems/`,
      `${ApiEndpoints.ecoMonitoringBaseUrl}/api/v1/eco_problems/create`,
    ];

    let last = null;
    for (const url of urls) {
      try {
        const r = await api.post(url, dto.toJson(), {
          headers: { "Content-Type": "application/json" },
          maxRedirects: 5,
          validateStatus: (s) => s < 400 || s === 307 || s === 308,
        });

        if (r.status === 200 || r.status === 201)
          return new EcoProblemModel(r.data);

        const loc = r.headers.location;
        if ((r.status === 307 || r.status === 308) && loc) {
          const r2 = await api.post(loc, dto.toJson());
          if (r2.status === 200 || r2.status === 201)
            return new EcoProblemModel(r2.data);
        }
      } catch (e) {
        last = e.response;
      }
    }

    throw new Error(`Create problem failed: ${last?.data}`);
  }

  async updateEcoProblem(model) {
    const r = await api.put(
      `${ApiEndpoints.ecoMonitoringBaseUrl}${ApiEndpoints.ecoProblemById}${model.id}`,
      model.toJson()
    );
    return new EcoProblemModel(r.data);
  }

  async deleteEcoProblem(id) {
    await api.delete(
      `${ApiEndpoints.ecoMonitoringBaseUrl}${ApiEndpoints.ecoProblemById}${id}`
    );
  }

  async updateEcoProblemStatus(id, statusId) {
    const r = await api.patch(
      `${ApiEndpoints.ecoMonitoringBaseUrl}${ApiEndpoints.updateEcoProblemStatus}`,
      { id, status_id: statusId }
    );
    return new EcoProblemModel(r.data);
  }

  async updateEcoProblemManager(id, managerId) {
    const r = await api.patch(
      `${ApiEndpoints.ecoMonitoringBaseUrl}${ApiEndpoints.updateEcoProblemManager}`,
      { id, manager_id: managerId }
    );
    return new EcoProblemModel(r.data);
  }

  async closeEcoProblem(id, closeReason) {
    const r = await api.patch(
      `${ApiEndpoints.ecoMonitoringBaseUrl}${ApiEndpoints.closeEcoProblem}`,
      { id, close_reason: closeReason }
    );
    return new EcoProblemModel(r.data);
  }
}

export class WikiRepositoryImpl {
  async getWikiList() {
    const url = `http://213.171.28.81:7001/api/v1/wiki/`;
    const r = await api.get(url);
    return r.data.map((x) => new WikiModel(x));
  }

  async getWiki(id) {
    const url = `http://213.171.28.81:7001/api/v1/wiki/${id}`;
    const r = await api.get(url);
    return new WikiModel(r.data);
  }
}


export class EntertainmentsRepositoryImpl {
  async getContents(typeCode = null) {
    const url = `${ApiEndpoints.entertainmentsBaseUrl}${ApiEndpoints.contents}`;
    const r = await api.get(url, {
      params: typeCode ? { type_code: typeCode } : {},
    });
    return r.data.map((x) => x);
  }

  async getAchievements() {
    const url = `${ApiEndpoints.entertainmentsBaseUrl}${ApiEndpoints.achievements}`;
    const r = await api.get(url);
    return r.data.map((x) => x);
  }
}
class NewsRepositoryImpl {
  async fetchNews() {
    // TODO: здесь можно сделать реальный запрос на бэкенд или RSS
    // пока вернем пустой список, чтобы приложение не падало
    return [];
  }
}


export const sl = {
  map: new Map(),

  register(key, instance) {
    this.map.set(key, instance);
  },

  get(key) {
    if (!this.map.has(key)) throw new Error("Service not registered: " + key);
    return this.map.get(key);
  }
};

// 🔽 ДОБАВЬ ЭТО СРАЗУ ПОСЛЕ sl:

// DI bootstrap – регистрируем реализации
sl.register("authRepo", new AuthRepositoryImpl());
sl.register("registerUseCase", new RegisterUseCase(sl.get("authRepo")));
sl.register("profileRepo", new ProfileRepositoryImpl());
sl.register("storageRepo", new StorageRepositoryImpl());
sl.register("ecoRepo", new EcoProblemRepositoryImpl());
sl.register("wikiRepo", new WikiRepositoryImpl());
sl.register("newsRepo", new NewsRepositoryImpl());


export const TokenManager = {
  saveAccessToken(token) {
    localStorage.setItem("access_token", token);
  },
  saveRefreshToken(token) {
    localStorage.setItem("refresh_token", token);
  },
  getAccessToken() {
    return localStorage.getItem("access_token");
  },
  getRefreshToken() {
    return localStorage.getItem("refresh_token");
  },
  clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  isLoggedIn() {
    return !!localStorage.getItem("access_token");
  }
};

export class HiveLocalDataSource {
  // Temporary stub — Flutter version used Hive, React uses localStorage
  get(key) {
    const v = localStorage.getItem(key);
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  put(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  remove(key) {
    localStorage.removeItem(key);
  }
}


export function parseNewsHtml(html) {
  // Simplified version — extracts <title>…</title> and image src=
  const items = [];

  const blocks = html.split("<article");
  for (const b of blocks) {
    if (!b.includes("</article>")) continue;

    const title = (b.match(/<h\d[^>]*>(.*?)<\/h\d>/) || [null, ""])[1];
    const url = (b.match(/href="(.*?)"/) || [null, ""])[1];
    const imageUrl = (b.match(/src="(.*?)"/) || [null, ""])[1];
    const date = (b.match(/<time[^>]*>(.*?)<\/time>/) || [null, ""])[1];

    if (title.trim()) {
      items.push({
        id: Date.now().toString() + Math.random(),
        title,
        url,
        imageUrl,
        date
      });
    }
  }

  return items;
}


/* ---------- AUTH STATE ---------- */
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const authRepo = sl.get("authRepo");

  const loadUser = useCallback(async () => {
    if (!TokenManager.isLoggedIn()) {
      setUser(null);
      return;
    }
    try {
      const u = await authRepo.getUserInfo();
      setUser(u);
    } catch {
      TokenManager.clearTokens();
      setUser(null);
    }
  }, [authRepo]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function login(email, password) {
    await authRepo.login(email, password);
    await loadUser();
  }

  async function register(params) {
    await sl.get("registerUseCase").call(params);
    await loadUser();
  }

  async function logout() {
    await authRepo.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        register,
        reload: loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


const NewsContext = createContext(null);

export function useNews() {
  return useContext(NewsContext);
}

export function NewsProvider({ children }) {
  const newsRepo = sl.get("newsRepo");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const items = await newsRepo.fetchNews();
      setNews(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <NewsContext.Provider value={{ news, loading, reload: load }}>
      {children}
    </NewsContext.Provider>
  );
}


const EcoContext = createContext(null);

export function useEco() {
  return useContext(EcoContext);
}

export function EcoProvider({ children }) {
  const ecoRepo = sl.get("ecoRepo");
  const auth = useAuth();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const all = await ecoRepo.getEcoProblems();
      setList(all);
    } finally {
      setLoading(false);
    }
  }

  async function createProblem(dto) {
    await ecoRepo.createEcoProblem(dto);
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <EcoContext.Provider
      value={{
        list,
        loading,
        reload: load,
        createProblem
      }}
    >
      {children}
    </EcoContext.Provider>
  );
}

const ProfileContext = createContext(null);

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }) {
  const profileRepo = sl.get("profileRepo");
  const storageRepo = sl.get("storageRepo");
  const auth = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    if (!auth.user) {
      setProfile(null);
      return;
    }

    setLoading(true);
    try {
      const p = await profileRepo.getProfile(auth.user.id);
      setProfile(p);
    } catch (e) {
      setError(e.toString());
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar(file) {
    setLoading(true);
    try {
      const s = await storageRepo.uploadFile(file);
      const updated = profile.copyWith({
        avatarStorageId: s.id,
        avatarUrl: s.url
      });
      const res = await profileRepo.updateProfile(updated);
      setProfile(res);
      return res;
    } catch (e) {
      setError(e.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(updated) {
    setLoading(true);
    try {
      const saved = await profileRepo.updateProfile(updated);
      setProfile(saved);
      return saved;
    } catch (e) {
      setError(e.toString());
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [auth.user]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        reload: load,
        uploadAvatar,
        saveProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/auth-choice" element={<AuthChoiceScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegistrationScreen />} />
      <Route path="/news" element={<NewsListScreen />} />
      <Route path="/web" element={<WebViewScreen />} />
      <Route path="/app/*" element={<AppShell />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}


function SplashScreen() {
  const nav = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      if (TokenManager.isLoggedIn()) {
        nav("/app");
      } else {
        nav("/onboarding");
      }
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={styles.splashRoot}>
      <div style={styles.splashIcon}>🌿</div>
      <div style={styles.splashTitle}>Park App</div>
    </div>
  );
}

const styles = {
  splashRoot: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "white",
  },
  splashIcon: {
    fontSize: 80,
  },
  splashTitle: {
    fontSize: 26,
    fontWeight: 700,
    marginTop: 20,
  }
};

function OnboardingScreen() {
  const pages = [
    {
      title: "Будь в курсе",
      description:
        "Читай последние новости и будь в курсе событий твоего парка",
      image: "/assets/onboarding_1.png",
    },
    {
      title: "Уход за парком",
      description:
        "Помогай парку быть здоровее и чище",
      image: "/assets/onboarding_2.png",
    },
    {
      title: "Посещай мероприятия",
      description:
        "Собирай друзей и посещай как можно больше событий",
      image: "/assets/onboarding_3.png",
    },
  ];

  const [page, setPage] = useState(0);
  const nav = useNavigate();

  function next() {
    if (page === pages.length - 1) nav("/auth-choice");
    else setPage(page + 1);
  }

  return (
    <div style={onb.root}>
      <div style={onb.image(pages[page].image)} />
      <div style={onb.box}>
        <h2 style={onb.title}>{pages[page].title}</h2>
        <p style={onb.desc}>{pages[page].description}</p>

        <button style={onb.button} onClick={next}>
          {page === pages.length - 1 ? "Начать" : "Далее"}
        </button>

        <div style={onb.dots}>
          {pages.map((_, i) => (
            <div
              key={i}
              style={i === page ? onb.dotActive : onb.dot}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const onb = {
  root: { height: "100vh", display: "flex", flexDirection: "column" },
  image: (src) => ({
    flex: 6,
    backgroundImage: `url(${src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }),
  box: { flex: 4, padding: 24, background: "white" },
  title: { fontSize: 32, fontWeight: 700, color: "#2D3E30", textAlign: "center" },
  desc: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 12,
    marginBottom: 40,
    lineHeight: 1.4,
  },
  button: {
    width: "100%",
    height: 56,
    background: "#2D3E30",
    color: "white",
    borderRadius: 16,
    border: 0,
    fontSize: 18,
    fontWeight: 600,
    cursor: "pointer",
  },
  dots: {
    marginTop: 24,
    display: "flex",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#D9D9D9",
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#2D3E30",
  }
};

function AuthChoiceScreen() {
  const nav = useNavigate();
  return (
    <div style={a.root}>
      <div style={a.spacer} />
      <div style={a.icon}>🌱</div>
      <div style={a.title}>Жизнь парка в твоем кармане!</div>
      <div style={a.spacer} />

      <div style={a.subTitle}>Войти</div>

      <button style={a.btnGray} onClick={() => nav("/login")}>
        Продолжить с Email
      </button>

      <button style={a.btnWhite} onClick={() => nav("/register")}>
        Зарегистрироваться
      </button>

      <div style={a.spacer} />
    </div>
  );
}

const a = {
  root: {
    padding: 24,
    background: "white",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  spacer: { flex: 1 },
  icon: {
    width: 120,
    height: 120,
    borderRadius: "60px",
    background: "#F5F5F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 60,
    color: "#2D3E30",
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: 700,
    color: "#2D3E30",
    marginTop: 24,
  },
  subTitle: {
    fontSize: 32,
    fontWeight: 700,
    textAlign: "center",
    color: "#2D3E30",
    marginBottom: 24,
  },
  btnGray: {
    width: "100%",
    height: 56,
    background: "#E8E8E8",
    borderRadius: 16,
    border: 0,
    fontWeight: 600,
    color: "#2D3E30",
    fontSize: 16,
    marginBottom: 16,
    cursor: "pointer",
  },
  btnWhite: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    border: "2px solid #2D3E30",
    background: "white",
    fontWeight: 600,
    fontSize: 16,
    color: "#2D3E30",
    cursor: "pointer",
  }
};

function LoginScreen() {
  const nav = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function doLogin() {
    if (loading) return;
    setLoading(true);
    try {
      await auth.login(email, pass);
      alert("Вы успешно вошли");
      nav("/app");
    } catch (e: any) {
      console.error("Login error:", e);
      alert("Ошибка входа: " + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={l.root}>
      <button style={l.back} onClick={() => nav(-1)}>←</button>
      <h2 style={l.title}>Вход</h2>

      <label style={l.label}>Email</label>
      <input
        style={l.input}
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="example@mail.com"
      />

      <label style={l.label}>Пароль</label>
      <input
        style={l.input}
        type="password"
        value={pass}
        onChange={e => setPass(e.target.value)}
        placeholder="••••••••"
        onKeyUp={e => e.key === "Enter" && doLogin()}
      />

      <button style={l.btn} onClick={doLogin}>
        {loading ? "..." : "Войти"}
      </button>
    </div>
  );
}

const l = {
  root: { padding: 24, background: "white", height: "100vh" },
  back: {
    background: "none",
    border: 0,
    fontSize: 24,
    cursor: "pointer",
    color: "#2D3E30",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#2D3E30",
    marginBottom: 24,
  },
  label: { fontWeight: 600, marginTop: 16, marginBottom: 8 },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "1px solid #DDD",
    padding: "0 12px",
    fontSize: 16,
  },
  btn: {
    width: "100%",
    height: 56,
    background: "#2D3E30",
    border: 0,
    borderRadius: 16,
    color: "white",
    fontSize: 16,
    fontWeight: 600,
    marginTop: 32,
    cursor: "pointer",
  }
};

function RegistrationScreen() {
  const nav = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    if (loading) return;
    if (!email || !pass || !name) {
      alert("Заполните email, пароль и имя");
      return;
    }

    setLoading(true);

    const parts = name.split(" ").filter(Boolean);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");

    try {
      await auth.register({
        email,
        password: pass,
        firstName,
        lastName,
        phone,
      });
      alert("Аккаунт создан");
      nav("/app");
    } catch (e) {
      alert("Ошибка: " + e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={r.root}>
      <button style={r.back} onClick={() => nav(-1)}>←</button>
      <h2 style={r.title}>Регистрация</h2>

      <label style={r.label}>Имя</label>
      <input style={r.input} value={name} onChange={e => setName(e.target.value)} />

      <label style={r.label}>Телефон</label>
      <input style={r.input} value={phone} onChange={e => setPhone(e.target.value)} />

      <label style={r.label}>Email</label>
      <input style={r.input} value={email} onChange={e => setEmail(e.target.value)} />

      <label style={r.label}>Пароль</label>
      <input
        style={r.input}
        type="password"
        value={pass}
        onChange={e => setPass(e.target.value)}
      />

      <button style={r.btn} onClick={register}>
        {loading ? "..." : "Зарегистрироваться"}
      </button>
    </div>
  );
}

const r = {
  root: { padding: 24, background: "white", height: "100vh" },
  back: {
    background: "none",
    border: 0,
    fontSize: 24,
    cursor: "pointer",
    color: "#2D3E30",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#2D3E30",
    marginBottom: 24,
  },
  label: { fontWeight: 600, marginTop: 16, marginBottom: 8 },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "1px solid #DDD",
    padding: "0 12px",
    fontSize: 16,
  },
  btn: {
    width: "100%",
    height: 56,
    background: "#2D3E30",
    border: 0,
    borderRadius: 16,
    color: "white",
    fontSize: 16,
    fontWeight: 600,
    marginTop: 32,
    cursor: "pointer",
  }
};

function BottomNav() {
  const nav = useNavigate();
  const current = window.location.pathname;

  const tabs = [
    { id: "/", icon: "🏠", label: "Главная" },
    { id: "/app/map", icon: "🗺️", label: "Карты" },
    { id: "/app/missions", icon: "⭐", label: "Миссии" },
    { id: "/app/wiki", icon: "ℹ️", label: "Инфо" },
  ];

  return (
    <div style={bn.root}>
      {tabs.map((t) => {
        const active = current.endsWith(t.id.replace("/app", ""));
        return (
          <div
            key={t.id}
            style={active ? bn.itemActive : bn.item}
            onClick={() => nav(t.id)}
          >
            <span style={bn.icon}>{t.icon}</span>
            <span>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const bn = {
  root: {
    height: 64,
    background: "#FFF",
    borderTop: "1px solid #EEE",
    display: "flex",
    justifyContent: "space-between",
    padding: "0 4px",
  },
  item: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    paddingTop: 8,
    cursor: "pointer",
    color: "#888",
  },
  itemActive: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    paddingTop: 8,
    cursor: "pointer",
    color: "#0A3A35",
    fontWeight: 700,
  },
  icon: {
    display: "block",
    fontSize: 20,
  }
};

function HomeScreen() {
  const auth = useAuth();
  const nav = useNavigate();
  const { news, loading } = useNews();

  const user = auth.user;

  const green = "#0A3A35";

  const name = (() => {
    if (!user) return "Гость";
    const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    if (full.length > 0) return full;
    if (user.firstName && user.firstName.length > 0) return user.firstName;
    return "Гость";
  })();

  // Афиша — первые 2 элемента новостей (как в Flutter: afisha = items)
  const afisha = news.slice(0, 2);
  // Для карусели — новости (ограничим тремя, как PageView.builder.clamp(0,3))
  const carouselItems = news.slice(0, 3);

  if (loading) {
    return (
      <div style={home.loadingRoot}>
        <div style={home.spinner} />
      </div>
    );
  }

  return (
    <div style={home.root}>
      {/* Верхняя строка: аватар + чип "Парк Горького" */}
      <div style={home.topRow}>
        <div style={home.avatarWrapper} onClick={() => nav("/app/profile")}>
          <div style={home.avatarCircle}>
            <span style={home.avatarIcon}>👤</span>
          </div>
        </div>

        <div style={home.parkChipWrapper}>
          <div style={home.parkChip}>
            <span style={home.parkChipText}>Парк Горького</span>
          </div>
        </div>
      </div>

      {/* Приветствие */}
      <div style={home.greeting}>
        <span style={home.greetingText}>Привет, {name}!</span>
      </div>

      {/* Поиск */}
      <div
        style={home.searchContainer}
        onClick={() => nav("/news?q=")}
      >
        <span style={home.searchIcon}>🔍</span>
      </div>

      {/* Афиша */}
      <div style={home.sectionHeaderRow}>
        <span style={home.sectionTitle}>Афиша</span>
      </div>

      <div style={home.afishaRow}>
        <div style={home.afishaCardWrapper}>
          <HomeImageCard item={afisha[0]} />
        </div>
        <div style={home.afishaSpacer} />
        <div style={home.afishaCardWrapper}>
          <HomeImageCard item={afisha[1]} />
        </div>
      </div>

      {/* Новости + "Еще" */}
      <div style={home.sectionHeaderRow}>
        <span style={home.sectionTitle}>Новости</span>
        <div
          style={home.pill}
          onClick={() => nav("/news")}
        >
          <span style={home.pillText}>Еще</span>
        </div>
      </div>

      {/* Карусель новостей */}
      <div style={home.carouselWrapper}>
        {carouselItems.length === 0 ? (
          <div style={home.carouselPlaceholder} />
        ) : (
          <>
            <div style={home.carouselList}>
              {carouselItems.map((n, i) => (
                <div
                  key={n.id}
                  style={home.carouselCard}
                  onClick={() =>
                    nav(`/web?url=${encodeURIComponent(n.url)}&title=${encodeURIComponent("Новость")}`)
                  }
                >
                  <span style={home.carouselTitle}>{n.title}</span>
                </div>
              ))}
            </div>
            {/* Статические 3 точки, как в Flutter-примере */}
            <div style={home.dotsRow}>
              <div style={home.dotActive} />
              <div style={home.dot} />
              <div style={home.dot} />
            </div>
          </>
        )}
      </div>

      {/* Потеряно */}
      <div style={home.sectionHeaderRow}>
        <span style={home.sectionTitle}>Потеряно</span>
      </div>

      <div style={home.afishaRow}>
        <div style={home.afishaCardWrapper}>
          <HomeImageCard item={null} />
        </div>
        <div style={home.afishaSpacer} />
        <div style={home.afishaCardWrapper}>
          <HomeImageCard item={null} />
        </div>
      </div>
    </div>
  );
}

function HomeImageCard({ item }: { item: any | null }) {
  if (!item) {
    return (
      <div style={home.imageCardPlaceholder} />
    );
  }

  return (
    <div
      style={home.imageCard}
      onClick={() => {
        window.location.href = `/web?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent("Новость")}`;
      }}
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          style={home.imageCardImg}
        />
      ) : (
        <div style={home.imageCardPlaceholder} />
      )}
    </div>
  );
}

const home: any = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    padding: "16px 16px 24px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  loadingRoot: {
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "4px solid #E0E0E0",
    borderTopColor: "#0A3A35",
    animation: "spin 0.8s linear infinite",
  },
  topRow: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    cursor: "pointer",
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    border: "2px solid #0A3A35",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    fontSize: 34,
    color: "#0A3A35",
  },
  parkChipWrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-start",
    marginLeft: 16,
  },
  parkChip: {
    padding: "10px 20px",
    backgroundColor: "#EFF3F1",
    borderRadius: 24,
    display: "inline-block",
  },
  parkChipText: {
    fontWeight: 700,
    fontSize: 18,
    color: "#0A3A35",
  },
  greeting: {
    marginTop: 24,
  },
  greetingText: {
    color: "#0A3A35",
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  searchContainer: {
    marginTop: 24,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#F0F1F1",
    paddingLeft: 16,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  searchIcon: {
    fontSize: 20,
    color: "rgba(0,0,0,0.54)",
  },
  sectionHeaderRow: {
    marginTop: 28,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#0A3A35",
    fontSize: 24,
    fontWeight: 800,
  },
  pill: {
    padding: "12px 22px",
    backgroundColor: "#EFF3F1",
    borderRadius: 24,
    cursor: "pointer",
  },
  pillText: {
    color: "#0A3A35",
    fontWeight: 700,
  },
  afishaRow: {
    marginTop: 12,
    display: "flex",
    flexDirection: "row",
  },
  afishaCardWrapper: {
    flex: 1,
    display: "flex",
  },
  afishaSpacer: {
    width: 16,
  },
  imageCard: {
    position: "relative",
    width: "100%",
    paddingTop: `${(10 / 16) * 100}%`,
    borderRadius: 18,
    overflow: "hidden",
    cursor: "pointer",
    backgroundColor: "#0000001F",
  },
  imageCardImg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imageCardPlaceholder: {
    position: "relative",
    width: "100%",
    paddingTop: `${(10 / 16) * 100}%`,
    borderRadius: 18,
    backgroundColor: "#0000001F",
  },
  carouselWrapper: {
    marginTop: 12,
  },
  carouselPlaceholder: {
    height: 160,
    borderRadius: 16,
    backgroundColor: "#0000001F",
  },
  carouselList: {
    height: 180,
    display: "flex",
    flexDirection: "row",
    overflowX: "auto",
    gap: 12,
  },
  carouselCard: {
    minWidth: "92%",
    flexShrink: 0,
    padding: 16,
    backgroundColor: "#F8F6F4",
    borderRadius: 16,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#000000",
  },
  dotsRow: {
    marginTop: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "#23423B",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#D0D5D3",
  },
};


function NewsListScreen() {
  const { news, loading, reload } = useNews();
  const nav = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const initialQuery = params.get("q") || "";

  const [search, setSearch] = React.useState(initialQuery);
  const [visible, setVisible] = React.useState(news);
  const [error, setError] = React.useState<string | null>(null);
  const [lastType, setLastType] = React.useState<number>(Date.now());

  const green = "#0A3A35";

  // Применяем фильтр при изменении новостей или initialQuery
  React.useEffect(() => {
    // при первом заходе с q=... — автофильтр
    applyFilter(initialQuery || search, news, setVisible);
  }, [news]);

  function applyFilter(q: string, all: any[], setter: (rows: any[]) => void) {
    const query = (q || "").trim().toLowerCase();
    if (!query) {
      setter(all);
      return;
    }
    const filtered = all.filter((n) => {
      const t = (n.title || "").toLowerCase();
      const d = (n.date || "").toLowerCase();
      return t.includes(query) || d.includes(query);
    });
    setter(filtered);
  }

  function onSearchChange(value: string) {
    setSearch(value);
    const now = Date.now();
    setLastType(now);
    setTimeout(() => {
      if (Date.now() - now >= 180) {
        applyFilter(value, news, setVisible);
      }
    }, 200);
  }

  async function handleReload() {
    setError(null);
    try {
      await reload();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  return (
    <div style={newsS.root}>
      {/* AppBar */}
      <div style={newsS.appBar}>
        <button
          style={newsS.backButton}
          onClick={() => nav(-1)}
        >
          ←
        </button>
        <span style={newsS.appBarTitle}>Новости</span>
      </div>

      {/* Контент */}
      <div style={newsS.body}>
        {loading ? (
          <div style={newsS.center}>
            <div style={newsS.spinner} />
          </div>
        ) : error ? (
          <div style={newsS.center}>
            <span style={newsS.errorText}>Ошибка: {error}</span>
          </div>
        ) : (
          <>
            {/* Поле поиска */}
            <input
              style={newsS.searchInput}
              placeholder="Поиск по новостям"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />

            {/* Кнопка обновить (аналог RefreshIndicator) */}
            <div style={newsS.refreshRow}>
              <button style={newsS.refreshButton} onClick={handleReload}>
                Обновить
              </button>
            </div>

            {/* Список */}
            {visible.length === 0 ? (
              <div style={newsS.emptyBox}>
                <div style={newsS.emptyIcon}>🔍</div>
                <div style={newsS.emptyText}>Ничего не найдено</div>
              </div>
            ) : (
              <div style={newsS.list}>
                {visible.map((n) => (
                  <div
                    key={n.id}
                    style={newsS.item}
                    onClick={() =>
                      nav(
                        `/web?url=${encodeURIComponent(
                          n.url
                        )}&title=${encodeURIComponent("Новость")}`
                      )
                    }
                  >
                    <div style={newsS.itemLeading}>
                      {n.imageUrl ? (
                        <img
                          src={n.imageUrl}
                          alt={n.title}
                          style={newsS.itemImage}
                        />
                      ) : (
                        <div style={newsS.itemImagePlaceholder} />
                      )}
                    </div>
                    <div style={newsS.itemContent}>
                      <div
                        style={{
                          ...newsS.itemTitle,
                          color: green,
                        }}
                      >
                        {n.title}
                      </div>
                      <div style={newsS.itemSubtitle}>
                        {n.date || ""}
                      </div>
                    </div>
                    <div style={newsS.itemTrailing}>›</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const newsS: any = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
  },
  appBar: {
    height: 56,
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    borderBottom: "1px solid #E0E0E0",
    boxSizing: "border-box",
  },
  backButton: {
    border: "none",
    background: "transparent",
    fontSize: 22,
    cursor: "pointer",
    marginRight: 12,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 700,
  },
  body: {
    flex: 1,
    padding: 16,
    boxSizing: "border-box",
  },
  center: {
    flex: 1,
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "4px solid #E0E0E0",
    borderTopColor: "#0A3A35",
    animation: "spin 0.8s linear infinite",
  },
  errorText: {
    color: "#D32F2F",
  },
  searchInput: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "none",
    padding: "0 14px",
    fontSize: 15,
    boxSizing: "border-box",
    backgroundColor: "#F1F2F2",
    outline: "none",
    marginBottom: 16,
  },
  refreshRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  refreshButton: {
    border: "none",
    borderRadius: 12,
    padding: "6px 12px",
    backgroundColor: "#F3F6F4",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 8,
  },
  item: {
    display: "flex",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#F3F6F4",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  itemLeading: {
    marginRight: 12,
    flexShrink: 0,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    objectFit: "cover",
  },
  itemImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#DDDDDD",
  },
  itemContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  itemTitle: {
    fontWeight: 700,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#777777",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemTrailing: {
    marginLeft: 8,
    fontSize: 18,
    color: "#888888",
  },
  emptyBox: {
    marginTop: 48,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    color: "#9E9E9E",
  },
  emptyText: {
    color: "#9E9E9E",
  },
};


function WebViewScreen() {
  const nav = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const url = params.get("url") || "";
  const title = params.get("title") || "Новость";

  return (
    <div style={wv.root}>
      <div style={wv.appBar}>
        <button style={wv.backButton} onClick={() => nav(-1)}>
          ←
        </button>
        <span style={wv.appBarTitle}>{title}</span>
      </div>
      <iframe src={url} style={wv.frame} />
    </div>
  );
}

const wv: any = {
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  appBar: {
    height: 56,
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    borderBottom: "1px solid #E0E0E0",
    boxSizing: "border-box",
  },
  backButton: {
    border: "none",
    background: "transparent",
    fontSize: 22,
    cursor: "pointer",
    marginRight: 12,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  frame: {
    flex: 1,
    border: 0,
    width: "100%",
  },
};


function MissionsScreen() {
  const [checking, setChecking] = React.useState(true);
  const [logged, setLogged] = React.useState(false);
  const nav = useNavigate();

  const authRepo = sl.get("authRepo");

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const is = await authRepo.isLoggedIn();
        if (!cancelled) {
          setLogged(is);
        }
      } catch {
        if (!cancelled) {
          setLogged(false);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authRepo]);

  // Пока идет проверка авторизации — лоадер с AppBar "Миссии"
  if (checking) {
    return (
      <div style={missionsS.scaffold}>
        <div style={missionsS.appBar}>
          <span style={missionsS.appBarTitle}>Миссии</span>
        </div>
        <div style={missionsS.loaderBox}>Загрузка...</div>
      </div>
    );
  }

  // Гость — сообщение + кнопка "Войти"
  if (!logged) {
    return (
      <div style={missionsS.scaffold}>
        <div style={missionsS.appBar}>
          <span style={missionsS.appBarTitle}>Миссии</span>
        </div>
        <div style={missionsS.body}>
          <div style={missionsS.centerCol}>
            <div style={missionsS.guestText}>
              Войдите, чтобы отправлять заявки
            </div>
            <button
              style={missionsS.loginButton}
              onClick={() => nav("/login")}
            >
              Войти
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Авторизован — грид миссий
  return (
    <div style={missionsS.scaffold}>
      <div style={missionsS.appBar}>
        <span style={missionsS.appBarTitle}>Миссии</span>
      </div>

      <div style={missionsS.body}>
        <div style={missionsS.headerText}>
          Выберите миссию и помогите парку
        </div>

        <div style={missionsS.grid}>
          {missionsItems.map((item) => (
            <div
              key={item.title}
              style={missionsS.tileWrapper}
              onClick={() => {
                if (item.opensViolationForm) {
                  // Аналог ViolationFormScreen — открываем форму создания заявки
                  nav(
                    `/app/create-problem?title=${encodeURIComponent(
                      item.title
                    )}`
                  );
                } else {
                  window.alert(`Экран "${item.title}" в разработке`);
                }
              }}
            >
              <div style={missionsS.circle}>
                <span style={missionsS.circleIcon}>{item.icon}</span>
              </div>
              <div style={missionsS.tileTitle}>{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const missionsS: any = {
  scaffold: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  appBar: {
    height: 56,
    backgroundColor: "#0A3A35",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    boxSizing: "border-box",
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 700,
  },
  body: {
    flex: 1,
    padding: 16,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  loaderBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#777",
  },
  centerCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  guestText: {
    color: "#888",
    marginBottom: 12,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#0A3A35",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 12,
    padding: "10px 32px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  headerText: {
    color: "#888",
    textAlign: "left",
    marginBottom: 16,
  },
  grid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  tileWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
  },
  circle: {
    width: 86,
    height: 86,
    borderRadius: "50%",
    border: "2px solid #0A3A35",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  circleIcon: {
    fontSize: 28,
    color: "#0A3A35",
  },
  tileTitle: {
    marginTop: 6,
    height: 36, // ~две строки
    textAlign: "center",
    fontSize: 12,
    lineHeight: 1.1,
    color: "#555",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

// Аналог _items из Flutter
const missionsItems = [
  {
    title: "Поделиться красотой природы",
    icon: "🗺️",
    opensViolationForm: false,
  },
  {
    title: "Селфи в парке",
    icon: "📷",
    opensViolationForm: false,
  },
  {
    title: "Встреча с обитателями парка",
    icon: "👥",
    opensViolationForm: false,
  },
  {
    title: "Повреждение растений, деревьев",
    icon: "⚠️",
    opensViolationForm: true,
  },
  {
    title: "Состояние кормушек и скворечников",
    icon: "🌿",
    opensViolationForm: true,
  },
  {
    title: "Мусор",
    icon: "🗑️",
    opensViolationForm: true,
  },
];


function WikiScreen() {
  const nav = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const repo = sl.get("wikiRepo");

  useEffect(() => {
    (async () => {
      try {
        const auth = sl.get("authRepo");
        const logged = await auth.isLoggedIn();
        if (!logged) {
          setList([]);
          setLoading(false);
          return;
        }
        const data = await repo.getWikiList();
        setList(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Энциклопедия парка</h2>

      {loading && <div>Загрузка...</div>}

      <div style={{ marginTop: 16 }}>
        {list.map((w) => (
          <div
            key={w.id}
            style={wiki.item}
            onClick={async () => {
              const full = await repo.getWiki(w.id);
              nav("/app/wiki-details", { state: { full } });
            }}
          >
            <div style={wiki.icon}>🌿</div>
            <div style={{ flex: 1 }}>
              <div style={wiki.title}>{w.title}</div>
              <div style={wiki.sub}>{w.subtitle}</div>
            </div>
            <div>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const wiki = {
  item: {
    display: "flex",
    background: "#F3F6F4",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    cursor: "pointer",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    background: "#E2ECE7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
  },
  title: { fontWeight: 700, fontSize: 16 },
  sub: { color: "#777", fontSize: 13 },
};

function ProfileScreen() {
  const auth = useAuth();
  const nav = useNavigate();

  if (!auth.user) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Профиль</h2>
        <p>Вы не авторизованы.</p>
      </div>
    );
  }

  const u = auth.user;
  const fullName =
    `${u.firstName} ${u.lastName}`.trim() || u.firstName || "Без имени";

  return (
    <div style={prof.root}>
      <div style={prof.header}>
        <div style={prof.avatarBig}>👤</div>
      </div>

      <div style={prof.name}>{fullName}</div>

      <div style={prof.actions}>
        <ProfileAction icon="🏆" label="Медали" onClick={() => nav("/app/medals")} />
        <ProfileAction icon="📄" label="Заявки" onClick={() => nav(`/app/requests?uid=${u.id}`)} />
        <ProfileAction icon="⚙️" label="Настройки" onClick={() => nav("/app/settings")} />
        <ProfileAction icon="💬" label="Сообщения" onClick={() => nav("/app/messages")} />
      </div>

      <div style={prof.extra}>
        <button style={prof.greyButton}>Чат поддержки</button>
        <button style={prof.greyButton}>Телефон горячей линии</button>
      </div>
    </div>
  );
}

function ProfileAction({ icon, label, onClick }) {
  return (
    <div style={pAct.root} onClick={onClick}>
      <div style={pAct.icon}>{icon}</div>
      <div style={pAct.label}>{label}</div>
    </div>
  );
}

const prof = {
  root: { padding: 16 },
  header: {
    height: 140,
    background: "#E9EBEA",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  avatarBig: {
    width: 112,
    height: 112,
    borderRadius: "56px",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 56,
    transform: "translateY(50%)",
  },
  name: {
    marginTop: 80,
    textAlign: "center",
    fontSize: 20,
    fontWeight: 700,
  },
  actions: {
    marginTop: 24,
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  extra: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  greyButton: {
    background: "#E9EBEA",
    height: 44,
    borderRadius: 12,
    border: 0,
    fontWeight: 600,
  },
};

const pAct = {
  root: {
    width: "48%",
    height: 120,
    background: "#E9EBEA",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  icon: { fontSize: 32 },
  label: { marginTop: 8, fontWeight: 700, color: "#555" },
};

function MedalsScreen() {
  const medals = ["ЭкоГерой", "Чистюля", "Защитник природы", "Зелёный доктор", "ЭкоДруг", "Следопыт"];

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700 }}>
        Медали
      </h2>
      <p style={{ textAlign: "center", color: "#555" }}>
        Ваши медали — показатель успеха
      </p>

      <div style={med.grid}>
        {medals.map((m) => (
          <div key={m} style={med.item}>
            <div style={med.icon}>🏅</div>
            <div style={med.label}>{m}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const med = {
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 20,
  },
  item: {
    background: "#E9EBEA",
    borderRadius: 16,
    padding: 16,
    textAlign: "center",
  },
  icon: { fontSize: 48 },
  label: { marginTop: 8, fontWeight: 700 },
};

function MessagesScreen() {
  const items = [
    "Статус Вашей заявки изменен",
    "Новое мероприятие в парке",
    "",
    "",
    "",
  ];

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700 }}>
        Сообщения
      </h2>

      <div style={{ marginTop: 16 }}>
        {items.map((t, i) => (
          <div key={i} style={msg.item}>
            <span>{t}</span>
            <span>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const msg = {
  item: {
    background: "#E9EBEA",
    padding: "16px",
    borderRadius: 16,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
  },
};

function RequestsListScreen() {
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");

  const eco = useEco();
  const nav = useNavigate();

  if (eco.loading) return <div style={{ padding: 16 }}>Загрузка...</div>;

  const items = eco.list.filter((e) => e.creatorId === uid);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700 }}>
        Мои заявки
      </h2>

      {items.map((p, i) => {
        const highlighted = i % 2 === 0;
        return (
          <div
            key={p.id}
            style={req.item(highlighted)}
            onClick={() => nav(`/app/request-details?id=${p.id}`)}
          >
            <div style={{ flex: 1 }}>
              <div style={req.title}>{p.title}</div>
              <div style={req.status}>{p.statusId}</div>
            </div>

            <div style={req.right}>
              <div style={req.date}>
                {new Date(p.createdAt).toLocaleDateString()}
              </div>
              <div>›</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const req = {
  item: (highlighted) => ({
    background: "#E9EBEA",
    borderRadius: 14,
    border: highlighted ? "3px solid #0A3A35" : "3px solid transparent",
    padding: 16,
    marginBottom: 12,
    display: "flex",
    cursor: "pointer",
  }),
  title: { fontWeight: 700, fontSize: 18, color: "#0A3A35" },
  status: { marginTop: 6, fontWeight: 700 },
  right: { textAlign: "right" },
  date: { color: "#777" },
};

function RequestDetailsScreen() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const eco = useEco();
  const p = eco.list.find((x) => x.id === id);

  if (!p) return <div style={{ padding: 16 }}>Заявка не найдена</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700 }}>
        {p.title}
      </h2>

      <div style={rd.box}>
        <div>{p.description}</div>
      </div>

      <div style={rd.boxLarge}>📷 Фото</div>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <div style={rd.pill}>Статус</div>
        <div style={rd.pill}>Дата</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={rd.item}>
          <span>Создано</span>
          <span>{formatDate(p.createdAt)}</span>
        </div>
        <div style={rd.item}>
          <span>В работе</span>
          <span>{formatDate(p.updatedAt)}</span>
        </div>
        <div style={rd.item}>
          <span>Закрыто</span>
          <span>{p.isClosed ? formatDate(p.updatedAt) : "—"}</span>
        </div>
      </div>
    </div>
  );
}

function formatDate(d) {
  const dt = new Date(d);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`;
}

const rd = {
  box: {
    background: "#E9EBEA",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  boxLarge: {
    background: "#E9EBEA",
    height: 220,
    borderRadius: 16,
    marginTop: 16,
    fontSize: 72,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    background: "#E9EBEA",
    height: 44,
    borderRadius: 12,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    fontWeight: 700,
  },
  item: {
    background: "#E9EBEA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
  }
};

function SettingsScreen() {
  const auth = useAuth();
  const nav = useNavigate();
  const profile = auth.user;

  const [first, setFirst] = useState(profile?.firstName ?? "");
  const [last, setLast] = useState(profile?.lastName ?? "");
  const [dirty, setDirty] = useState(false);

  function save() {
    // Placeholder: Flutter version used Provider
   
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700 }}>
        Настройки
      </h2>

      <div style={{ marginTop: 20 }}>
        <SettingsField label="Имя" value={first} onChange={setFirst} setDirty={setDirty} />
        <SettingsField label="Фамилия" value={last} onChange={setLast} setDirty={setDirty} />
      </div>

      <button style={setS.save} onClick={save} disabled={!dirty}>
        Сохранить
      </button>
    </div>
  );
}

function SettingsField({ label, value, onChange, setDirty }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 700 }}>{label}</div>
      <input
        style={setS.input}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setDirty(true);
        }}
      />
    </div>
  );
}

const setS = {
  input: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "1px solid #DDD",
    padding: "0 12px",
    marginTop: 6,
  },
  save: {
    marginTop: 24,
    width: "100%",
    height: 48,
    background: "#0A3A35",
    color: "white",
    borderRadius: 12,
    border: 0,
    fontWeight: 700,
    cursor: "pointer",
  },
};

 function FormTextField({ label, value, password, placeholder, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <div style={{ marginBottom: 6, fontWeight: 700 }}>{label}</div>
      )}
      <input
        type={password ? "password" : "text"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={formS.input}
      />
    </div>
  );
}

function FormNumberField({ label, value, placeholder, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <div style={{ marginBottom: 6, fontWeight: 700 }}>{label}</div>
      )}
      <input
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={formS.input}
      />
    </div>
  );
}

function FormDropdown({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <div style={{ marginBottom: 6, fontWeight: 700 }}>{label}</div>
      )}
      <select style={formS.input} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Выберите...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormCheckbox({ label, value, onChange }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", marginBottom: 16, cursor: "pointer" }}
      onClick={() => onChange(!value)}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={() => onChange(!value)}
        style={{ width: 18, height: 18, marginRight: 8 }}
      />
      <span style={{ fontWeight: 600 }}>{label}</span>
    </div>
  );
}

const formS = {
  input: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    border: "1px solid #CCC",
    padding: "0 12px",
    fontSize: 15,
  },
  button: {
    width: "100%",
    height: 50,
    background: "#0A3A35",
    color: "white",
    borderRadius: 12,
    border: 0,
    marginTop: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
};


function FileUpload({ files, setFiles }) {
  function select(e) {
    const f = Array.from(e.target.files);
    setFiles(f);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Файлы</div>

      <input type="file" multiple onChange={select} />

      {files.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {files.map((f, i) => (
            <div key={i} style={{ fontSize: 14, marginTop: 4 }}>
              {f.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function LocationPicker({ lat, lng, setLat, setLng }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Координаты</div>

      <FormNumberField label="Широта (latitude)" value={lat} onChange={setLat} />
      <FormNumberField label="Долгота (longitude)" value={lng} onChange={setLng} />

      <div style={{ color: "#777", fontSize: 14, marginTop: -10 }}>
        В Flutter обычно использовалась карта.  
        Пришлёте исходный MapScreen — перенесу полностью.
      </div>
    </div>
  );
}


function CreateEcoProblemScreen() {
  const nav = useNavigate();
  const eco = useEco();
  const auth = useAuth();

  const repo = sl.get("ecoRepo");
  const storage = sl.get("storageRepo");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // TypeIncident list
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [incidentId, setIncidentId] = useState("");

  // Coordinates
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // Files
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await repo.getTypeIncidents();
        setIncidentTypes(list.map((x) => ({ value: x.id, label: x.title })));
      } catch {
        setIncidentTypes([]);
      }
    })();
  }, []);

  async function submit() {
    if (!auth.user) {
      alert("Вы должны войти в систему.");
      return;
    }
    if (!title.trim()) {
      alert("Введите название");
      return;
    }
    if (!incidentId) {
      alert("Выберите тип инцидента");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      // Convert coordinates to string, as in Flutter
      const dto = {
        title,
        description,
        typeIncidentId: incidentId,
        latitude: lat.toString(),
        longitude: lng.toString(),
        creatorId: auth.user.id,
        managerId: auth.user.id,
        statusId: "c709d5ce-34b9-470a-a355-e6dc43d05346",
        createdAt: new Date().toISOString(),
      };

      const created = await repo.createProblem(dto);

      if (files.length > 0) {
        const formFiles = await Promise.all(
          files.map(async (f) => {
            const blob = new Blob([await f.arrayBuffer()], { type: f.type });
            return new File([blob], f.name, { type: f.type });
          })
        );

        await storage.uploadFile(created.id, formFiles);
      }

      setMsg("Заявка создана");
      await eco.reload();
      setTimeout(() => nav("/app/requests?uid=" + auth.user.id), 800);
    } catch (e) {
      setMsg("Ошибка: " + e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Создать заявку</h2>

      <FormTextField
        label="Название"
        value={title}
        onChange={setTitle}
        placeholder="Название проблемы"
      />

      <FormTextField
        label="Описание"
        value={description}
        onChange={setDescription}
        placeholder="Описание"
      />

      <FormDropdown
        label="Тип инцидента"
        value={incidentId}
        options={incidentTypes}
        onChange={setIncidentId}
      />

      <LocationPicker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />

      <FileUpload files={files} setFiles={setFiles} />

      {msg && (
        <div style={{ marginTop: 10, marginBottom: 10, color: "#0A3A35" }}>
          {msg}
        </div>
      )}

      <button style={formS.button} onClick={submit} disabled={loading}>
        {loading ? "Создание..." : "Создать"}
      </button>
    </div>
  );
}


function CreateEcoProblemEntry() {
  return <CreateEcoProblemScreen />;
}


function AppShell() {
  const nav = useNavigate();
  const [tab, setTab] = useState(0);

  const tabs = [
    { label: "Главная", path: "/app/home" },
    { label: "Карта", path: "/app/map" },
    { label: "Миссии", path: "/app/missions" },
    { label: "Профиль", path: "/app/profile" },
  ];

  useEffect(() => {
    const p = window.location.pathname;
    if (p.startsWith("/app/home") || p === "/app") setTab(0);
    else if (p.startsWith("/app/map")) setTab(1);
    else if (p.startsWith("/app/missions")) setTab(2);
    else if (p.startsWith("/app/profile")) setTab(3);
  }, [window.location.pathname]);

  function navigateTo(i: number) {
    setTab(i);
    nav(tabs[i].path);
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </div>

      <div
        style={{
          height: 64,
          display: "flex",
          borderTop: "1px solid #DDD",
          background: "#FFF",
        }}
      >
        {tabs.map((t, i) => (
          <div
            key={i}
            onClick={() => navigateTo(i)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: tab === i ? 700 : 500,
              color: tab === i ? "#0A3A35" : "#777",
            }}
          >
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Провайдеры контекста
function Providers({ children }) {
  return (
    <AuthProvider>
      <NewsProvider>
        <EcoProvider>
          <ProfileProvider>{children}</ProfileProvider>
        </EcoProvider>
      </NewsProvider>
    </AuthProvider>
  );
}

// Главный компонент приложения с роутингом
function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/auth-choice" element={<AuthChoiceScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegistrationScreen />} />
          <Route path="/news" element={<NewsListScreen />} />
          <Route path="/web" element={<WebViewScreen />} />

          <Route path="/app" element={<AppShell />}>
            {/* index = /app */}
            <Route index element={<HomeScreen />} />
            <Route path="home" element={<HomeScreen />} />
            <Route path="map" element={<MapsScreen />} />
            <Route path="missions" element={<MissionsScreen />} />
            <Route path="profile" element={<ProfileScreen />} />
            <Route path="create-problem" element={<CreateEcoProblemEntry />} />
            <Route path="requests" element={<RequestsListScreen />} />
            <Route path="request-details" element={<RequestDetailsScreen />} />
            <Route path="medals" element={<MedalsScreen />} />
            <Route path="messages" element={<MessagesScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}
export default App;
function HomeEntry() {
  return <HomeScreen />;
}

function MapsScreen() {
  const [mapKey, setMapKey] = React.useState(0);

  // Центр парка Горького
  const centerLat = 55.731997;
  const centerLng = 37.603572;

  // Встроенный виджет Яндекс.Карт (визуально как в Flutter)
  const mapSrc = `https://yandex.ru/map-widget/v1/?ll=${centerLng}%2C${centerLat}&z=16`;

  function recenter() {
    // Перерисовываем iframe, имитируя "центровку" карты по кнопке в app bar
    setMapKey((k) => k + 1);
  }

  function gotoPioneerPond() {
    // При желании можно сделать отдельный URL с другими координатами.
    // Для простоты — то же самое поведение, но кнопка остаётся визуально такой же, как FAB во Flutter.
    setMapKey((k) => k + 1);
  }

  return (
    <div style={mapsS.root}>
      {/* AppBar как во Flutter */}
      <div style={mapsS.appBar}>
        <span style={mapsS.title}>Карта парка Горького</span>
        <button style={mapsS.iconButton} onClick={recenter} title="Центр парка">
          📍
        </button>
      </div>

      {/* Карта */}
      <div style={mapsS.mapContainer}>
        <iframe
          key={mapKey}
          src={mapSrc}
          style={mapsS.mapFrame}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* FloatingActionButton.extended — визуально 1 в 1 */}
        <button style={mapsS.fab} onClick={gotoPioneerPond}>
          <span style={mapsS.fabIcon}>💧</span>
          <span style={mapsS.fabLabel}>Пруд Пионерский</span>
        </button>
      </div>
    </div>
  );
}

const mapsS: any = {
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  appBar: {
    height: 56,
    backgroundColor: "#0A3A35",        // тот же зелёный, что в Flutter
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    boxSizing: "border-box",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  iconButton: {
    border: "none",
    background: "transparent",
    color: "#FFFFFF",
    fontSize: 20,
    cursor: "pointer",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  mapFrame: {
    border: 0,
    width: "100%",
    height: "100%",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 24,
    padding: "10px 16px",
    border: "none",
    backgroundColor: "#0A3A35",
    color: "#FFFFFF",
    cursor: "pointer",
    boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
    fontSize: 14,
    fontWeight: 600,
    gap: 8,
  },
  fabIcon: {
    fontSize: 18,
  },
  fabLabel: {
    whiteSpace: "nowrap",
  },
};



function MissionsEntry() {
  return <MissionsScreen />;
}

