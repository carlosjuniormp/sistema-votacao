import { NextRequest, NextResponse } from 'next/server';
import { registrarVoto, verificarVotoEmPergunta } from '@/lib/db/votacao';
import { verificarSessao, marcarComoVotado } from '@/lib/db/eleitores';

export async function POST(request: NextRequest) {
  try {
    const { token, perguntaId, opcaoId } = await request.json();
    
    if (!token || !perguntaId || !opcaoId) {
      return NextResponse.json(
        { error: 'Parâmetros incompletos' },
        { status: 400 }
      );
    }
    
    // Verificar se a sessão é válida
    const sessao = await verificarSessao(token);
    
    if (!sessao) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada' },
        { status: 401 }
      );
    }
    
    const eleitorId = sessao.eleitor_id;
    
    // Verificar se o eleitor já votou nesta pergunta
    const jaVotou = await verificarVotoEmPergunta(eleitorId, perguntaId);
    
    if (jaVotou) {
      return NextResponse.json(
        { error: 'Você já votou nesta pergunta' },
        { status: 403 }
      );
    }
    
    // Registrar o voto
    const sucesso = await registrarVoto(eleitorId, perguntaId, opcaoId);
    
    if (!sucesso) {
      return NextResponse.json(
        { error: 'Erro ao registrar voto' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Voto registrado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao registrar voto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
