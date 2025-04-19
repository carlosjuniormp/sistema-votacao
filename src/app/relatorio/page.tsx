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

interface RelatorioData {
  data_geracao: string;
  resultados: ResultadoPergunta[];
}

export default function RelatorioPage() {
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const router = useRouter();

  // Buscar dados do relatório
  useEffect(() => {
    const buscarRelatorio = async () => {
      try {
        const response = await fetch('/api/relatorio');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao buscar relatório');
        }

        setRelatorio(data);
        setErro(null);
      } catch (error: any) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarRelatorio();
  }, []);

  // Função para baixar relatório em CSV
  const baixarCSV = () => {
    window.location.href = '/api/relatorio?formato=csv';
  };

  // Exibir mensagem de carregamento
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <p className="text-lg">Gerando relatório...</p>
        </div>
      </div>
    );
  }

  // Exibir mensagem de erro se houver
  if (erro || !relatorio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Erro</h1>
          <p className="text-red-600 mb-4">{erro || 'Não foi possível gerar o relatório'}</p>
          <button
            onClick={() => router.push('/resultados')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Voltar aos Resultados
          </button>
        </div>
      </div>
    );
  }

  // Formatar data de geração
  const dataFormatada = new Date(relatorio.data_geracao).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">Relatório de Votação</h1>
          <p className="text-center text-gray-600 mb-4">
            Gerado em: {dataFormatada}
          </p>
          <div className="flex justify-center mb-4 space-x-4">
            <button
              onClick={baixarCSV}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Baixar CSV
            </button>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Imprimir Relatório
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Resumo da Votação</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Pergunta</th>
                <th className="border p-2 text-center">Total de Votos</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.resultados.map((resultado) => (
                <tr key={`resumo-${resultado.id}`}>
                  <td className="border p-2">{resultado.texto}</td>
                  <td className="border p-2 text-center">{resultado.total_votos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {relatorio.resultados.map((resultado) => (
          <div key={resultado.id} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">{resultado.texto}</h2>
            <p className="text-gray-600 mb-4">
              Total de votos: <span className="font-semibold">{resultado.total_votos}</span>
            </p>

            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Opção</th>
                  <th className="border p-2 text-center">Votos</th>
                  <th className="border p-2 text-center">Percentual</th>
                </tr>
              </thead>
              <tbody>
                {resultado.opcoes.map((opcao) => (
                  <tr key={opcao.id}>
                    <td className="border p-2">{opcao.texto}</td>
                    <td className="border p-2 text-center">{opcao.votos}</td>
                    <td className="border p-2 text-center">{opcao.percentual}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-4">
              {resultado.opcoes.map((opcao) => (
                <div key={`grafico-${opcao.id}`} className="border rounded-md p-4">
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
            onClick={() => router.push('/resultados')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Voltar aos Resultados
          </button>
        </div>
      </div>
    </div>
  );
}
