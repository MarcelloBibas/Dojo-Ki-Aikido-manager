
import React from 'react';
import { Student, Rank } from '../types';

interface StudentCardProps {
  student: Student;
  onSelect: (id: string) => void;
}

const getPaymentStatus = (student: Student): { text: string; color: string } => {
  const lastPayment = student.payments.length > 0 
    ? new Date(student.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date + 'T00:00:00')
    : null;

  if (!lastPayment) {
    return { text: 'Pendente', color: 'bg-yellow-500' };
  }

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const fifthOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 5);

  if (today.getTime() <= fifthOfThisMonth.getTime()) {
    // Grace period. Payment for last month is required.
    const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    if (lastPayment.getTime() >= firstOfLastMonth.getTime()) {
      return { text: 'Em dia', color: 'bg-green-500' };
    }
  } else {
    // Grace period over. Payment for this month is required.
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (lastPayment.getTime() >= firstOfThisMonth.getTime()) {
      return { text: 'Em dia', color: 'bg-green-500' };
    }
  }
  
  return { text: 'Atrasado', color: 'bg-red-500' };
};

const getHighestRank = (student: Student): Rank => {
    if (student.exams.length === 0) return Rank.None;
    // Assuming RANKS_ORDERED is available or sorting logic is in place
    // A simple sort by date is sufficient here
    const sortedExams = [...student.exams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedExams[0].rank;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onSelect }) => {
  const { text, color } = getPaymentStatus(student);
  const highestRank = getHighestRank(student);

  return (
    <div
      onClick={() => onSelect(student.id)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center space-x-4 cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-dojo-blue-500 transition-all duration-200"
    >
      <img
        src={student.photos[0] || `https://picsum.photos/seed/${student.id}/100/100`}
        alt={`${student.firstName} ${student.lastName}`}
        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{`${student.firstName} ${student.lastName}`}</h3>
          <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${color}`}>{text}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{highestRank}</p>
        <p className={`text-sm font-medium ${student.status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
          {student.status === 'Active' ? 'Ativo' : 'Inativo'}
        </p>
      </div>
    </div>
  );
};
