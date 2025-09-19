interface User {
  username: string;
}

interface Color { 
  r: number; 
  g: number; 
  b: number; 
}

interface WorkData {
  id: string;
  name: string;
  imageData: string; // base64 encoded image
  colorHistory: Color[];
  currentColor: Color | null;
  dominantColors: Color[];
  savedAt: string;
}

// Simulate network delay to mimic a real database call
const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

const USERS_KEY = 'color-picker-users';
const WORK_DATA_KEY = 'color-picker-work-data';

// --- Private Helper Functions ---

const getUsers = (): Record<string, string> => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  } catch (e) {
    console.error("Failed to parse users from localStorage", e);
    return {};
  }
};

const saveUsers = (users: Record<string, string>): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getUserWorkData = (username: string): Record<string, WorkData> => {
  try {
    const allWorkData = localStorage.getItem(WORK_DATA_KEY);
    const workDataByUser = allWorkData ? JSON.parse(allWorkData) : {};
    return workDataByUser[username] || {};
  } catch (e) {
    console.error("Failed to parse work data from localStorage", e);
    return {};
  }
};

const saveUserWorkData = (username: string, workData: Record<string, WorkData>): void => {
  try {
    const allWorkData = localStorage.getItem(WORK_DATA_KEY);
    const workDataByUser = allWorkData ? JSON.parse(allWorkData) : {};
    workDataByUser[username] = workData;
    localStorage.setItem(WORK_DATA_KEY, JSON.stringify(workDataByUser));
  } catch (e) {
    console.error("Failed to save work data to localStorage", e);
  }
};

// --- Public AuthService ---

export const authService = {
  async login(username: string, password: string): Promise<User> {
    await delay(500); // Simulate network latency
    const users = getUsers();
    if (users[username] && users[username] === password) {
      return { username };
    }
    throw new Error('Invalid username or password.');
  },

  async signup(username: string, password: string): Promise<User> {
    await delay(500);
    const users = getUsers();
    if (users[username]) {
      throw new Error('Username already exists.');
    }
    users[username] = password;
    saveUsers(users);
    return { username };
  },

  async googleSignup(): Promise<User> {
    await delay(500);
    const users = getUsers();
    let username: string;
    let attempts = 0;
    // Ensure unique username in case of collision
    do {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      username = `google_user_${randomId}`;
      attempts++;
    } while (users[username] && attempts < 10);
    
    if (users[username]) {
        throw new Error("Could not generate a unique Google username.");
    }

    users[username] = `simulated_google_password_${Date.now()}`;
    saveUsers(users);
    return { username };
  },
};

// --- Public Work Data Service ---

export const workDataService = {
  async saveWork(username: string, workData: Omit<WorkData, 'id' | 'savedAt'>): Promise<WorkData> {
    await delay(300);
    
    const id = `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const savedWork: WorkData = {
      ...workData,
      id,
      savedAt: new Date().toISOString(),
    };
    
    const userWorkData = getUserWorkData(username);
    userWorkData[id] = savedWork;
    saveUserWorkData(username, userWorkData);
    
    return savedWork;
  },

  async loadUserWorks(username: string): Promise<WorkData[]> {
    await delay(300);
    
    const userWorkData = getUserWorkData(username);
    return Object.values(userWorkData).sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
  },

  async deleteWork(username: string, workId: string): Promise<void> {
    await delay(200);
    
    const userWorkData = getUserWorkData(username);
    delete userWorkData[workId];
    saveUserWorkData(username, userWorkData);
  },
};

export type { User, Color, WorkData };
