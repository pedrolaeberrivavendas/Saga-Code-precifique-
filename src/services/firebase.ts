import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Ingredient, Recipe, Packaging } from '../types';

// Inicialização do Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling obrigatório da skill Firebase
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Teste de conexão conforme a Skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase offline ou sem conexão direta no momento.");
    }
    return false;
  }
}

// Funções de Autenticação Google
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Erro ao realizar login Google:', error);
    // Se o usuário fechar a popup do Google, não lançar crash
    if (error.code === 'auth/popup-closed-by-user') {
      return null;
    }
    throw error;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Operações do Firestore para Ingredientes
export async function saveIngredientToFirestore(userId: string, ingredient: Ingredient): Promise<void> {
  const docPath = `users/${userId}/ingredients/${ingredient.id}`;
  try {
    const cleanData = {
      ...ingredient,
      userId,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', userId, 'ingredients', ingredient.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function deleteIngredientFromFirestore(userId: string, ingredientId: string): Promise<void> {
  const docPath = `users/${userId}/ingredients/${ingredientId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'ingredients', ingredientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Operações do Firestore para Embalagens
export async function savePackagingToFirestore(userId: string, packaging: Packaging): Promise<void> {
  const docPath = `users/${userId}/packagings/${packaging.id}`;
  try {
    const cleanData = {
      ...packaging,
      userId,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', userId, 'packagings', packaging.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function deletePackagingFromFirestore(userId: string, packagingId: string): Promise<void> {
  const docPath = `users/${userId}/packagings/${packagingId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'packagings', packagingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function subscribeUserPackagings(
  userId: string,
  onUpdate: (packagings: Packaging[]) => void,
  onError?: (err: any) => void
) {
  const collectionPath = `users/${userId}/packagings`;
  const q = query(collection(db, 'users', userId, 'packagings'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Packaging[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Packaging);
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

// Operações do Firestore para Receitas
export async function saveRecipeToFirestore(userId: string, recipe: Recipe): Promise<void> {
  const docPath = `users/${userId}/recipes/${recipe.id}`;
  try {
    const cleanData = {
      ...recipe,
      userId,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', userId, 'recipes', recipe.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function deleteRecipeFromFirestore(userId: string, recipeId: string): Promise<void> {
  const docPath = `users/${userId}/recipes/${recipeId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'recipes', recipeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Inicia escutas em tempo real (onSnapshot) quando logado
export function subscribeUserIngredients(
  userId: string,
  onUpdate: (ingredients: Ingredient[]) => void,
  onError?: (err: any) => void
) {
  const collectionPath = `users/${userId}/ingredients`;
  const q = query(collection(db, 'users', userId, 'ingredients'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Ingredient[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Ingredient);
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

export function subscribeUserRecipes(
  userId: string,
  onUpdate: (recipes: Recipe[]) => void,
  onError?: (err: any) => void
) {
  const collectionPath = `users/${userId}/recipes`;
  const q = query(collection(db, 'users', userId, 'recipes'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Recipe[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Recipe);
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}
