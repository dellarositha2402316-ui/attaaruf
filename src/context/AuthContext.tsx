import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentSubmission } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginAdmin: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginGoogle: () => Promise<void>;
  loginStudent: (displayName: string, className: string, school: string) => Promise<void>;
  logout: () => void;
  updateUserStats: (statsUpdate: Partial<User['stats']>) => void;
  saveSubmission: (submission: Omit<StudentSubmission, 'id' | 'userId' | 'studentName' | 'createdAt'>) => void;
  getAllSubmissions: () => StudentSubmission[];
  getAllStudents: () => User[];
  deleteStudent: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'kalamuna_current_user_session';
const ALL_USERS_KEY = 'kalamuna_all_users_store';
const SUBMISSIONS_KEY = 'kalamuna_all_submissions_store';

// Default initial demo students for teacher gradebook
const INITIAL_STUDENTS: User[] = [
  {
    id: 'std-1',
    username: 'ahmad_fauzan',
    displayName: 'Ahmad Fauzan Al-Faruq',
    email: 'ahmad.fauzan@mtsn.sch.id',
    role: 'student',
    className: 'Kelas 7A',
    school: 'MTs Negeri 1 Kota Malang',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-15T08:00:00Z',
    lastLogin: '2026-10-28T09:30:00Z',
    stats: {
      totalSpeakingPractices: 8,
      averageScore: 92,
      vocabMastered: 24,
      dialoguesCompleted: 3,
      quizScore: 95,
    },
  },
  {
    id: 'std-2',
    username: 'aisyah_zahra',
    displayName: 'Aisyah Putri Azzahra',
    email: 'aisyah.zahra@mtsn.sch.id',
    role: 'student',
    className: 'Kelas 7B',
    school: 'MTs Negeri 1 Kota Malang',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-18T10:15:00Z',
    lastLogin: '2026-10-29T04:10:00Z',
    stats: {
      totalSpeakingPractices: 6,
      averageScore: 89,
      vocabMastered: 20,
      dialoguesCompleted: 2,
      quizScore: 88,
    },
  },
  {
    id: 'std-3',
    username: 'muhammad_rayhan',
    displayName: 'M. Rayhan Pratama',
    email: 'rayhan.p@mtsn.sch.id',
    role: 'student',
    className: 'Kelas 7A',
    school: 'MTs Negeri 1 Kota Malang',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-20T11:20:00Z',
    lastLogin: '2026-10-27T13:45:00Z',
    stats: {
      totalSpeakingPractices: 4,
      averageScore: 78,
      vocabMastered: 16,
      dialoguesCompleted: 1,
      quizScore: 80,
    },
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize storage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }

      const storedAll = localStorage.getItem(ALL_USERS_KEY);
      if (!storedAll) {
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(INITIAL_STUDENTS));
      }
    } catch (e) {
      console.error('Error loading auth from localStorage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      // Also update in all users directory
      const allUsers = getAllStudents();
      const existingIdx = allUsers.findIndex((u) => u.id === user.id);
      if (existingIdx >= 0) {
        allUsers[existingIdx] = user;
      } else {
        allUsers.push(user);
      }
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  };

  const loginAdmin = async (username: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // Explicit requested credentials:
    // username: laladmin
    // paswordnya :11lala04
    if (username.trim() === 'laladmin' && pass === '11lala04') {
      const adminUser: User = {
        id: 'admin-laladmin',
        username: 'laladmin',
        displayName: 'Ustadzah Lala (Guru Pengampu)',
        email: 'laladmin@kemenag.go.id',
        role: 'admin',
        school: 'Kementerian Agama RI - MTs Negeri',
        className: 'Guru Bahasa Arab',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        createdAt: '2026-01-01T00:00:00Z',
        lastLogin: new Date().toISOString(),
        stats: {
          totalSpeakingPractices: 0,
          averageScore: 100,
          vocabMastered: 40,
          dialoguesCompleted: 5,
          quizScore: 100,
        },
      };
      saveCurrentUser(adminUser);
      return { success: true };
    }

    return { success: false, error: 'Username atau password admin salah! Gunakan username: laladmin dan password: 11lala04' };
  };

  const loginGoogle = async () => {
    // Standard Google Sign-In user experience
    const randomId = 'google-' + Math.random().toString(36).substring(2, 9);
    const googleUser: User = {
      id: randomId,
      username: 'siswa_google',
      displayName: 'Santri / Siswa Google',
      email: 'siswa.mts7@gmail.com',
      role: 'student',
      school: 'MTs Negeri Terpadu',
      className: 'Kelas 7',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      stats: {
        totalSpeakingPractices: 1,
        averageScore: 85,
        vocabMastered: 8,
        dialoguesCompleted: 1,
        quizScore: 0,
      },
    };
    saveCurrentUser(googleUser);
  };

  const loginStudent = async (displayName: string, className: string, school: string) => {
    const studentId = 'std-' + Date.now().toString(36);
    const newStudent: User = {
      id: studentId,
      username: displayName.toLowerCase().replace(/\s+/g, '_') || 'siswa_baru',
      displayName: displayName || 'Siswa MTs',
      role: 'student',
      className: className || 'Kelas 7A',
      school: school || 'MTs Negeri 1',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      stats: {
        totalSpeakingPractices: 0,
        averageScore: 0,
        vocabMastered: 0,
        dialoguesCompleted: 0,
        quizScore: 0,
      },
    };
    saveCurrentUser(newStudent);
  };

  const logout = () => {
    saveCurrentUser(null);
  };

  const updateUserStats = (statsUpdate: Partial<User['stats']>) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      stats: {
        ...currentUser.stats,
        ...statsUpdate,
      },
    };
    saveCurrentUser(updatedUser);
  };

  const saveSubmission = (submissionData: Omit<StudentSubmission, 'id' | 'userId' | 'studentName' | 'createdAt'>) => {
    if (!currentUser) return;
    const submissionId = 'sub-' + Date.now();
    const newSub: StudentSubmission = {
      ...submissionData,
      id: submissionId,
      userId: currentUser.id,
      studentName: currentUser.displayName,
      createdAt: new Date().toISOString(),
    };

    const currentSubmissions = getAllSubmissions();
    currentSubmissions.unshift(newSub);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(currentSubmissions));

    // Update user stats
    const userSubs = currentSubmissions.filter((s) => s.userId === currentUser.id);
    const avg = Math.round(
      userSubs.reduce((acc, curr) => acc + (curr.evaluation.score || 0), 0) / userSubs.length
    );

    updateUserStats({
      totalSpeakingPractices: userSubs.length,
      averageScore: avg,
    });
  };

  const getAllSubmissions = (): StudentSubmission[] => {
    try {
      const data = localStorage.getItem(SUBMISSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const getAllStudents = (): User[] => {
    try {
      const data = localStorage.getItem(ALL_USERS_KEY);
      return data ? JSON.parse(data) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  };

  const deleteStudent = (userId: string) => {
    const students = getAllStudents().filter((s) => s.id !== userId);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(students));
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'laladmin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isLoading,
        loginAdmin,
        loginGoogle,
        loginStudent,
        logout,
        updateUserStats,
        saveSubmission,
        getAllSubmissions,
        getAllStudents,
        deleteStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
