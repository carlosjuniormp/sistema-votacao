import { NextRequest, NextResponse } from 'next/server';
import { verificarSessao } from '@/lib/db/eleitores';

export async function GET(request: NextRequest) {
  try {
    // Obter token da query string
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
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
    
    return NextResponse.json({
      success: true,
      eleitor_id: sessao.eleitor_id
    });
    
  } catch (error) {
    console.error('Erro na verificação de sessão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
