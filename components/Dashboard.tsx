
import React from 'react';
import { Student, Rank } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RANKS_ORDERED } from '../constants';

interface DashboardProps {
  students: Student[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57', '#ffc658', '#8dd1e1', '#d0ed57'];

export const Dashboard: React.FC<DashboardProps> = ({ students }) => {
    
    const getLastMonthDateRange = () => {
        const now = new Date();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: firstDayLastMonth, end: lastDayLastMonth };
    };
    
    const { start: lastMonthStart, end: lastMonthEnd } = getLastMonthDateRange();

    const revenueLastMonth = students
        .flatMap(s => s.payments)
        .filter(p => {
            const paymentDate = new Date(p.date + 'T00:00:00');
            return paymentDate >= lastMonthStart && paymentDate <= lastMonthEnd;
        })
        .reduce((sum, p) => sum + p.amount, 0);

    const newStudentsLastMonth = students.filter(s => {
        const startDate = new Date(s.startDate + 'T00:00:00');
        return startDate >= lastMonthStart && startDate <= lastMonthEnd;
    }).length;

    const activeStudents = students.filter(s => s.status === 'Active').length;
    const professorCount = students.filter(s => s.status === 'Professor').length;
    // const inactiveStudents = students.length - activeStudents - professorCount;
    
    // Include Professors in rank distribution as they are technically active on the mat
    const rankDistribution = RANKS_ORDERED.map(rank => {
        const count = students.filter(s => (s.status === 'Active' || s.status === 'Professor') && s.exams.length > 0 && [...s.exams].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].rank === rank).length;
        return { name: rank, value: count };
    }).filter(d => d.value > 0);

    const monthlyRevenueData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear();
        const firstDay = new Date(year, d.getMonth(), 1);
        const lastDay = new Date(year, d.getMonth() + 1, 0);
        
        const revenue = students
            .flatMap(s => s.payments)
            .filter(p => {
                const paymentDate = new Date(p.date + 'T00:00:00');
                return paymentDate >= firstDay && paymentDate <= lastDay;
            })
            .reduce((sum, p) => sum + p.amount, 0);
            
        return { name: `${month}/${year}`, Receita: revenue };
    }).reverse();


  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-dojo-blue-700 dark:text-dojo-blue-400">Dashboard - Mês Anterior ({lastMonthStart.toLocaleString('default', { month: 'long' })} {lastMonthStart.getFullYear()})</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Receita do Mês Anterior</h2>
          <p className="text-3xl font-bold text-green-500">R$ {revenueLastMonth.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Novos Alunos no Mês Anterior</h2>
          <p className="text-3xl font-bold text-dojo-blue-500">{newStudentsLastMonth}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total de Alunos Ativos</h2>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-yellow-500">{activeStudents}</p>
            {professorCount > 0 && (
                 <span className="text-sm text-gray-500 dark:text-gray-400">(+ {professorCount} Professores)</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Receita Mensal (Últimos 6 meses)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700"/>
              <XAxis dataKey="name" className="text-xs fill-current text-gray-600 dark:text-gray-400"/>
              <YAxis className="text-xs fill-current text-gray-600 dark:text-gray-400"/>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  borderColor: '#4B5563',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              <Bar dataKey="Receita" fill="#1b7dff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Distribuição de Graduações (Ativos + Professores)</h2>
           <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rankDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                className="text-xs"
              >
                {rankDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                    borderColor: '#4B5563',
                    color: '#F9FAFB'
                }}
              />
              <Legend/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
