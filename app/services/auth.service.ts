import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    User 
  } from 'firebase/auth';
  import { app } from '../firebase';
  
  const auth = getAuth(app);
  
  export const authService = {
    login: async (email: string, password: string) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error) {
        throw error;
      }
    },
  
    logout: async () => {
      try {
        await signOut(auth);
      } catch (error) {
        throw error;
      }
    },
  
    getCurrentUser: (): Promise<User | null> => {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      });
    }
  };