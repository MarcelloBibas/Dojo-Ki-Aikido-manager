
import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Student, View } from './types';
import { StudentList } from './components/StudentList';
import { StudentDetail } from './components/StudentDetail';
import { Dashboard } from './components/Dashboard';
import { SunIcon, MoonIcon, UserPlusIcon, ChartBarIcon, UsersIcon } from './components/Icons';
import { subscribeToStudents, addStudent, updateStudent } from './services/studentService';
import { isFirebaseConfigured } from './firebase.config';
import { FirebaseSetup } from './components/FirebaseSetup';

const App: React.FC = () => {
  // Theme handling
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  
  // Data state
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Firebase Subscription
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToStudents((data) => {
      setStudents(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleSaveStudent = async (student: Student) => {
    try {
        const existing = students.find(s => s.id === student.id);
        
        if (existing) {
            await updateStudent(student);
        } else {
            // Remove o ID temporário e deixa o Firestore criar um novo
            const { id, ...data } = student;
            await addStudent(data);
        }
        setCurrentView('list');
    } catch (error) {
        console.error("Error saving student", error);
        alert("Erro ao salvar aluno.");
    }
  };

  const handleDeletePhoto = async (studentId: string, photoIndex: number) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const newPhotos = [...student.photos];
      newPhotos.splice(photoIndex, 1);
      
      const updatedStudent = { ...student, photos: newPhotos };
      try {
          await updateStudent(updatedStudent);
      } catch (error) {
          console.error("Error deleting photo", error);
          alert("Erro ao deletar foto.");
      }
  };

  const handleAddStudent = () => {
      setSelectedStudentId(null);
      setCurrentView('detail');
  };

  const handleSelectStudent = (id: string) => {
      setSelectedStudentId(id);
      setCurrentView('detail');
  };

  const getEmptyStudent = (): Student => ({
      id: Date.now().toString(), // Temporary ID
      firstName: '',
      lastName: '',
      dob: '',
      address: { street: '', number: '', complement: '' },
      phone: '',
      startDate: new Date().toISOString().split('T')[0],
      photos: [],
      exams: [],
      payments: [],
      status: 'Active'
  });

  const selectedStudent = useMemo(() => 
      students.find(s => s.id === selectedStudentId) || getEmptyStudent(),
  [students, selectedStudentId]);

  // Render: Se não estiver configurado, mostra a tela de setup
  if (!isFirebaseConfigured()) {
      return <FirebaseSetup />;
  }

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dojo-blue-600"></div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-dojo-blue-600">Dojo Manager</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setCurrentView('dashboard')} className={`p-2 rounded-md ${currentView === 'dashboard' ? 'bg-dojo-blue-50 dark:bg-dojo-blue-900/50 text-dojo-blue-600 dark:text-dojo-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            <ChartBarIcon className="h-6 w-6" />
                        </button>
                        <button onClick={() => setCurrentView('list')} className={`p-2 rounded-md ${currentView === 'list' ? 'bg-dojo-blue-50 dark:bg-dojo-blue-900/50 text-dojo-blue-600 dark:text-dojo-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                            <UsersIcon className="h-6 w-6" />
                        </button>
                        <button onClick={handleAddStudent} className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <UserPlusIcon className="h-6 w-6" />
                        </button>
                        <button
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {currentView === 'dashboard' && <Dashboard students={students} />}
                {currentView === 'list' && (
                    <StudentList 
                        students={students} 
                        onSelectStudent={handleSelectStudent} 
                    />
                )}
                {currentView === 'detail' && (
                    <StudentDetail 
                        student={selectedStudent} 
                        onSave={handleSaveStudent} 
                        onBack={() => setCurrentView('list')}
                        onDeletePhoto={handleDeletePhoto}
                    />
                )}
            </main>
        </div>
    </div>
  );
};

export default App;
