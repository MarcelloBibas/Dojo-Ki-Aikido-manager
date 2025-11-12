
import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Student, Rank, View } from './types';
import { StudentList } from './components/StudentList';
import { StudentDetail } from './components/StudentDetail';
import { Dashboard } from './components/Dashboard';
import { SunIcon, MoonIcon, UserPlusIcon, ChartBarIcon, UsersIcon } from './components/Icons';

// Mock Data
const createInitialStudents = (): Student[] => [
    {
        id: '1',
        firstName: 'Carlos',
        lastName: 'Gracie',
        dob: '1985-05-15',
        address: { street: 'Rua das Flores', number: '123', complement: 'Apto 4' },
        phone: '11987654321',
        startDate: '2022-01-20',
        photos: [`https://picsum.photos/seed/1/400/400`],
        exams: [{ id: 'e1', date: '2023-11-10', rank: Rank.Kyu1 }],
        payments: [
            { id: 'p1', date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString().split('T')[0], amount: 150.00 },
            { id: 'p2', date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], amount: 150.00 }
        ],
        status: 'Active',
    },
    {
        id: '2',
        firstName: 'Helio',
        lastName: 'Silva',
        dob: '1992-11-30',
        address: { street: 'Avenida Principal', number: '456', complement: '' },
        phone: '21912345678',
        startDate: '2021-03-10',
        photos: [`https://picsum.photos/seed/2/400/400`],
        exams: [{ id: 'e2', date: '2023-08-15', rank: Rank.Shodan }],
        payments: [
             { id: 'p3', date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], amount: 180.00 }
        ],
        status: 'Active',
    },
    {
        id: '3',
        firstName: 'Royce',
        lastName: 'Mendes',
        dob: '1998-02-20',
        address: { street: 'Travessa da Luta', number: '789', complement: 'Casa B' },
        phone: '31988887777',
        startDate: '2023-07-01',
        photos: [`https://picsum.photos/seed/3/400/400`],
        exams: [{ id: 'e3', date: '2023-12-20', rank: Rank.Kyu3 }],
        payments: [],
        status: 'Inactive',
    },
];

const App: React.FC = () => {
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
    const [students, setStudents] = useLocalStorage<Student[]>('dojo-students', createInitialStudents());
    const [currentView, setCurrentView] = useState<View>('list');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const handleSelectStudent = (id: string) => {
        setSelectedStudentId(id);
        setCurrentView('detail');
    };

    const handleSaveStudent = (updatedStudent: Student) => {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        setCurrentView('list');
        setSelectedStudentId(null);
    };

    const handleAddNewStudent = () => {
        const newStudent: Student = {
            id: Date.now().toString(),
            firstName: 'Novo',
            lastName: 'Aluno',
            dob: '',
            address: { street: '', number: '', complement: '' },
            phone: '',
            startDate: new Date().toISOString().split('T')[0],
            photos: [],
            exams: [],
            payments: [],
            status: 'Active',
        };
        setStudents(prev => [...prev, newStudent]);
        setSelectedStudentId(newStudent.id);
        setCurrentView('detail');
    };
    
    const handleDeletePhoto = (studentId: string, photoIndex: number) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const updatedPhotos = s.photos.filter((_, index) => index !== photoIndex);
                return { ...s, photos: updatedPhotos };
            }
            return s;
        }));
    };

    const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

    const renderContent = () => {
        switch (currentView) {
            case 'detail':
                return selectedStudent ? (
                    <StudentDetail 
                        student={selectedStudent} 
                        onSave={handleSaveStudent} 
                        onBack={() => setCurrentView('list')} 
                        onDeletePhoto={handleDeletePhoto}
                    />
                ) : null;
            case 'dashboard':
                return <Dashboard students={students} />;
            case 'list':
            default:
                return <StudentList students={students} onSelectStudent={handleSelectStudent} />;
        }
    };

    return (
        <div className="w-screen h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col antialiased">
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-20">
                <h1 className="text-xl md:text-2xl font-bold text-dojo-blue-700 dark:text-dojo-blue-400">Dojo Ki Aikido Manager</h1>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button onClick={() => setCurrentView('list')} title="Alunos" className={`p-2 rounded-full ${currentView === 'list' ? 'bg-dojo-blue-100 dark:bg-dojo-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <UsersIcon className="h-6 w-6 text-dojo-blue-600 dark:text-dojo-blue-400"/>
                    </button>
                    <button onClick={() => setCurrentView('dashboard')} title="Dashboard" className={`p-2 rounded-full ${currentView === 'dashboard' ? 'bg-dojo-blue-100 dark:bg-dojo-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <ChartBarIcon className="h-6 w-6 text-dojo-blue-600 dark:text-dojo-blue-400"/>
                    </button>
                    <button onClick={handleAddNewStudent} title="Adicionar Aluno" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <UserPlusIcon className="h-6 w-6 text-dojo-blue-600 dark:text-dojo-blue-400"/>
                    </button>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        {theme === 'light' ? <MoonIcon className="h-6 w-6"/> : <SunIcon className="h-6 w-6"/>}
                    </button>
                </div>
            </header>
            <main className="flex-1 overflow-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
