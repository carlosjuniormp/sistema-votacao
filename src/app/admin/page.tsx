'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [resultadoTeste, setResultadoTeste] = useState<any>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [eleitorImportado, setEleitorImportado] = useState<boolean>(false);
  const [eleitorNome, setEleitorNome] = useState<string>('');
  const [eleitorId, setEleitorId] = useState<string>('');
  const router = useRouter();

  // Função para executar testes
  const executarTestes = async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      const response = await fetch('/api/testes');
      const data = await response.json();
      
      setResultadoTeste(data);
    } catch (error: any) {
      setErro(error.message || 'Erro ao executar testes');
    } finally {
      setCarregando(false);
    }
  };

  // Função para importar eleitor de teste
  const importarEleitor = async () => {
    if (!eleitorNome || !eleitorId) {
      setErro('Preencha o nome e identificação do eleitor');
      return;
    }
    
    setCarregando(true);
    setErro(null);
    
    try {
      const response = await fetch('/api/admin/importar-eleitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: eleitorNome,
          identificacao: eleitorId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar eleitor');
      }
      
      setEleitorImportado(true);
      setEleitorNome('');
      setEleitorId('');
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  // Função para inicializar banco de dados
  const inicializarBancoDados = async () => {
    setCarregando(true);
    setErro(null);
    
    try {
      const response = await fetch('/api/admin/inicializar-db', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao inicializar banco de dados');
      }
      
      alert('Banco de dados inicializado com sucesso!');
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">Administração do Sistema</h1>
          <p className="text-center text-gray-600 mb-4">
            Ferramentas para gerenciamento do sistema de votação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Testes do Sistema</h2>
            <p className="mb-4">Execute testes para verificar se todas as funcionalidades estão operando corretamente.</p>
            
            <button
              onClick={executarTestes}
              disabled={carregando}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {carregando ? 'Executando...' : 'Executar Testes'}
            </button>
            
            {resultadoTeste && (
              <div className={`p-4 rounded-md mb-4 ${resultadoTeste.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className={resultadoTeste.success ? 'text-green-700' : 'text-red-700'}>
                  {resultadoTeste.message}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Timestamp: {new Date(resultadoTeste.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Importar Eleitor</h2>
            <p className="mb-4">Adicione eleitores ao sistema para teste.</p>
            
            <div className="mb-4">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="nome"
                value={eleitorNome}
                onChange={(e) => setEleitorNome(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do eleitor"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="identificacao" className="block text-sm font-medium text-gray-700 mb-1">
                Identificação
              </label>
              <input
                type="text"
                id="identificacao"
                value={eleitorId}
                onChange={(e) => setEleitorId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Número de identificação"
              />
            </div>
            
            <button
              onClick={importarEleitor}
              disabled={carregando || !eleitorNome || !eleitorId}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {carregando ? 'Importando...' : 'Importar Eleitor'}
            </button>
            
            {eleitorImportado && (
              <div className="p-4 bg-green-100 text-green-700 rounded-md mt-4">
                Eleitor importado com sucesso!
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-bold mb-4">Inicialização do Sistema</h2>
          <p className="mb-4">Inicialize o banco de dados com as tabelas e dados necessários.</p>
          
          <button
            onClick={inicializarBancoDados}
            disabled={carregando}
            className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            {carregando ? 'Inicializando...' : 'Inicializar Banco de Dados'}
          </button>
          
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
            <p className="font-semibold">Atenção:</p>
            <p>Esta operação irá resetar o banco de dados e criar as tabelas necessárias. Todos os dados existentes serão perdidos.</p>
          </div>
        </div>

        {erro && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mt-6">
            {erro}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}
