
import React, { useState } from 'react';
import { Student } from '../types';
import { StudentCard } from './StudentCard';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (id: string) => void;
}

export const StudentList: React.FC<StudentListProps> = ({ students, onSelectStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().startsWith(searchTerm.toLowerCase())
  ).sort((a, b) => a.firstName.localeCompare(b.firstName));

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Procurar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-dojo-blue-500 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map(student => (
            <StudentCard key={student.id} student={student} onSelect={onSelectStudent} />
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            <p>Nenhum aluno encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};
