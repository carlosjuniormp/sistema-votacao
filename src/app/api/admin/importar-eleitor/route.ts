import { NextRequest, NextResponse } from 'next/server';
import { executeRun } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Importar eleitor
    const { nome, identificacao } = await request.json();
    
    if (!nome || !identificacao) {
      return NextResponse.json(
        { error: 'Nome e identificação são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Inserir eleitor no banco de dados
    const result = await executeRun(
      'INSERT INTO eleitores (nome, identificacao, ja_votou) VALUES (?, ?, 0)',
      [nome, identificacao]
    );
    
    if (!result.success) {
      throw new Error('Falha ao inserir eleitor');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Eleitor importado com sucesso',
      eleitor_id: result.lastInsertId
    });
    
  } catch (error) {
    console.error('Erro ao importar eleitor:', error);
    return NextResponse.json(
      { error: 'Erro ao importar eleitor' },
      { status: 500 }
    );
  }
}
