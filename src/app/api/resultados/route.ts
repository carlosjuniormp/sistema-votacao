import { NextRequest, NextResponse } from 'next/server';
import { buscarPerguntas, buscarOpcoesVoto, contarVotosPorOpcao, contarTotalVotos } from '@/lib/db/votacao';

export async function GET(request: NextRequest) {
  try {
    // Buscar todas as perguntas ativas
    const perguntas = await buscarPerguntas();
    
    // Para cada pergunta, buscar suas opções de voto e contagem de votos
    const resultados = await Promise.all(
      perguntas.map(async (pergunta) => {
        const opcoes = await buscarOpcoesVoto(pergunta.id);
        const contagemVotos = await contarVotosPorOpcao(pergunta.id);
        const totalVotos = await contarTotalVotos(pergunta.id);
        
        // Mapear opções com contagem de votos
        const opcoesComVotos = opcoes.map(opcao => {
          const contagem = contagemVotos.find(v => v.opcao_id === opcao.id);
          return {
            ...opcao,
            votos: contagem ? contagem.total : 0,
            percentual: totalVotos > 0 ? ((contagem ? contagem.total : 0) / totalVotos * 100).toFixed(2) : '0.00'
          };
        });
        
        return {
          ...pergunta,
          opcoes: opcoesComVotos,
          total_votos: totalVotos
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      resultados
    });
    
  } catch (error) {
    console.error('Erro ao buscar resultados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
