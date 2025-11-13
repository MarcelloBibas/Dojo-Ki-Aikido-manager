import * as firebaseApp from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// PASSO 1: Cole as chaves do seu projeto Firebase abaixo.
// Você encontra isso no Console do Firebase logo após registrar o app web.
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyAzwgIdBtHAG3FopQGpCs3hMj-d0WWgLos",
  authDomain: "dojo-ki-aikido-manager.firebaseapp.com",
  projectId: "dojo-ki-aikido-manager",
  storageBucket: "dojo-ki-aikido-manager.firebasestorage.app",
  messagingSenderId: "607600179210",
  appId: "1:607600179210:web:9a99bc4b22699f6cf207f3",
  measurementId: "G-25XS7HX8ZV"
};

// Lógica para verificar se o usuário configurou
// Retorna TRUE se as chaves NÃO FOREM as de exemplo (ou seja, se estiver configurado)
export const isFirebaseConfigured = () => {
  return !firebaseConfig.projectId.includes("SEU_PROJECT_ID") && 
         !firebaseConfig.apiKey.includes("SUA_API_KEY_AQUI");
};

// Inicializa o Firebase
// Utilizando cast 'as any' para evitar erros de tipagem caso o ambiente TS não detecte corretamente os exports do módulo
const app = (firebaseApp as any).initializeApp(firebaseConfig);

// Inicializa o Firestore (Banco de Dados)
export const db = getFirestore(app);