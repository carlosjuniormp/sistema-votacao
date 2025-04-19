import { NextRequest, NextResponse } from 'next/server';
import { executeRun } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Ler o arquivo SQL de migração
    const sqlPath = path.join(process.cwd(), 'migrations', '0001_initial.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o script SQL
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      const result = await executeRun(statement);
      if (!result.success) {
        throw new Error(`Falha ao executar: ${statement}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Banco de dados inicializado com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao inicializar banco de dados',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
