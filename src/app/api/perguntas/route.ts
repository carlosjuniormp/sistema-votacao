import { NextRequest, NextResponse } from 'next/server';
import { buscarPerguntas, buscarOpcoesVoto } from '@/lib/db/votacao';

export async function GET(request: NextRequest) {
  try {
    // Buscar todas as perguntas ativas
    const perguntas = await buscarPerguntas();
    
    // Para cada pergunta, buscar suas opções de voto
    const perguntasComOpcoes = await Promise.all(
      perguntas.map(async (pergunta) => {
        const opcoes = await buscarOpcoesVoto(pergunta.id);
        return {
          ...pergunta,
          opcoes
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      perguntas: perguntasComOpcoes
    });
    
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
