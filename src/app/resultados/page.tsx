'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OpcaoResultado {
  id: number;
  pergunta_id: number;
  texto: string;
  ordem: number;
  votos: number;
  percentual: string;
}

interface ResultadoPergunta {
  id: number;
  texto: string;
  ordem: number;
  opcoes: OpcaoResultado[];
  total_votos: number;
}

export default function ResultadosPage() {
  const [resultados, setResultados] = useState<ResultadoPergunta[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const router = useRouter();

  // Função para buscar resultados
  const buscarResultados = async () => {
    try {
      const response = await fetch('/api/resultados');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar resultados');
      }

      setResultados(data.resultados);
      setErro(null);
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  // Buscar resultados ao carregar a página e a cada 5 segundos
  useEffect(() => {
    buscarResultados();
    
    // Configurar atualização periódica
    const intervalo = setInterval(() => {
      buscarResultados();
    }, 5000); // Atualizar a cada 5 segundos
    
    // Limpar intervalo ao desmontar o componente
    return () => clearInterval(intervalo);
  }, []);

  // Exibir mensagem de carregamento
  if (carregando && !resultados.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <p className="text-lg">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  // Exibir mensagem de erro se houver
  if (erro && !resultados.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Erro</h1>
          <p className="text-red-600 mb-4">{erro}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">Resultados da Votação</h1>
          <p className="text-center text-gray-600 mb-4">
            Resultados atualizados em tempo real
          </p>
          <div className="flex justify-center mb-4">
            <button
              onClick={buscarResultados}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Atualizar Agora
            </button>
          </div>
        </div>

        {resultados.map((resultado) => (
          <div key={resultado.id} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">{resultado.texto}</h2>
            <p className="text-gray-600 mb-4">
              Total de votos: <span className="font-semibold">{resultado.total_votos}</span>
            </p>

            <div className="space-y-4">
              {resultado.opcoes.map((opcao) => (
                <div key={opcao.id} className="border rounded-md p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{opcao.texto}</span>
                    <span className="font-semibold">
                      {opcao.votos} votos ({opcao.percentual}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{ width: `${opcao.percentual}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 mr-4"
          >
            Voltar ao Início
          </button>
          <button
            onClick={() => router.push('/relatorio')}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Ver Relatório Completo
          </button>
        </div>
      </div>
    </div>
  );
}
