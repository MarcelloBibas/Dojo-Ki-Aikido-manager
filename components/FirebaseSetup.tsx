
import React from 'react';

export const FirebaseSetup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-3xl w-full space-y-8 border border-gray-200 dark:border-gray-700 my-8">
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-3xl font-bold text-dojo-blue-600 dark:text-dojo-blue-400">
            Configuração Inicial
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Siga os passos abaixo para conectar seu banco de dados.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna 1: Obter Credenciais */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                    <span className="bg-dojo-blue-100 text-dojo-blue-800 text-sm font-bold px-2.5 py-0.5 rounded dark:bg-dojo-blue-900 dark:text-dojo-blue-300 mr-2">1</span>
                    Obter Credenciais
                </h2>
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 dark:text-gray-300 marker:font-bold">
                    <li>
                        No Firebase, dê um nome ao app (ex: "Dojo") e clique em <strong>Registrar app</strong>.
                        <br/><em className="text-xs text-gray-500">(Não marque "Firebase Hosting")</em>
                    </li>
                    <li>
                        Copie as chaves dentro de <code>const firebaseConfig = {'{...}'}</code>.
                    </li>
                    <li>
                        Abra o arquivo <code>firebase.config.ts</code> neste projeto.
                    </li>
                    <li>
                        Cole suas chaves substituindo os valores de exemplo.
                    </li>
                </ol>
                <div className="bg-gray-900 p-3 rounded text-xs font-mono text-green-400 overflow-x-auto">
{`apiKey: "AIzaSy...",
authDomain: "seu-app.firebaseapp.com",
projectId: "seu-app",
...`}
                </div>
            </div>

            {/* Coluna 2: Configurar Banco de Dados */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                    <span className="bg-dojo-blue-100 text-dojo-blue-800 text-sm font-bold px-2.5 py-0.5 rounded dark:bg-dojo-blue-900 dark:text-dojo-blue-300 mr-2">2</span>
                    Ativar Banco de Dados
                </h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Se você não fizer isso, o app dará erro de "permissão negada" ou "banco não encontrado".
                    </p>
                </div>
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 dark:text-gray-300 marker:font-bold">
                    <li>No menu lateral do Firebase, clique em <strong>Criação</strong> {'>'} <strong>Firestore Database</strong>.</li>
                    <li>Clique no botão <strong>Criar banco de dados</strong>.</li>
                    <li>Local: Escolha <code>southamerica-east1</code> (BR) ou <code>nam5</code> (EUA).</li>
                    <li>
                        <strong>IMPORTANTE:</strong> Escolha <strong>Iniciar no modo de teste</strong>.
                    </li>
                    <li>Clique em <strong>Criar</strong>/Ativar.</li>
                </ol>
            </div>
        </div>

        <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            Aguardando alteração no arquivo <code>firebase.config.ts</code>...
          </p>
        </div>
      </div>
    </div>
  );
};
