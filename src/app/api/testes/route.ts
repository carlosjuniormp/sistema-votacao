import { NextRequest, NextResponse } from 'next/server';
import { executarTestes } from '@/lib/testes';

export async function GET(request: NextRequest) {
  try {
    // Executar testes do sistema
    const resultado = await executarTestes();
    
    return NextResponse.json({
      success: resultado,
      timestamp: new Date().toISOString(),
      message: resultado 
        ? 'Todos os testes foram executados com sucesso!' 
        : 'Alguns testes falharam. Verifique os logs para mais detalhes.'
    });
    
  } catch (error) {
    console.error('Erro ao executar testes:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao executar testes',
        timestamp: new Date().toISOString(),
        success: false
      },
      { status: 500 }
    );
  }
}
