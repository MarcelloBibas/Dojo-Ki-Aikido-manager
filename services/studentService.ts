
import { db } from '../firebase.config';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Student } from '../types';

const COLLECTION_NAME = 'students';

// Inscreve-se para receber atualizações em tempo real dos alunos
export const subscribeToStudents = (onUpdate: (students: Student[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME)); // Pode adicionar orderBy se desejar
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const students = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id, // Garante que o ID local seja o ID do documento do Firebase
    } as Student));
    onUpdate(students);
  }, (error) => {
    console.error("Erro ao buscar alunos:", error);
  });

  return unsubscribe;
};

// Adiciona um novo aluno
export const addStudent = async (student: Omit<Student, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), student);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao adicionar aluno: ", e);
    throw e;
  }
};

// Atualiza um aluno existente
export const updateStudent = async (student: Student): Promise<void> => {
  try {
    const studentRef = doc(db, COLLECTION_NAME, student.id);
    // Remove o ID do objeto antes de salvar para não duplicar dado dentro do documento
    const { id, ...data } = student;
    await updateDoc(studentRef, data as any);
  } catch (e) {
    console.error("Erro ao atualizar aluno: ", e);
    throw e;
  }
};

// (Opcional) Remove um aluno
export const deleteStudent = async (studentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, studentId));
  } catch (e) {
    console.error("Erro ao deletar aluno: ", e);
    throw e;
  }
};
