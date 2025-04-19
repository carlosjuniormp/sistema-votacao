import { NextRequest, NextResponse } from 'next/server';
import { buscarPerguntas, buscarOpcoesVoto, contarVotosPorOpcao, contarTotalVotos } from '@/lib/db/votacao';

export async function GET(request: NextRequest) {
  try {
    // Verificar formato solicitado (padrão é JSON)
    const formato = request.nextUrl.searchParams.get('formato') || 'json';
    
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
    
    // Retornar no formato solicitado
    if (formato === 'csv') {
      // Gerar CSV
      let csv = 'Pergunta,Opção,Votos,Percentual\n';
      
      resultados.forEach(resultado => {
        resultado.opcoes.forEach(opcao => {
          csv += `"${resultado.texto}","${opcao.texto}",${opcao.votos},${opcao.percentual}%\n`;
        });
        csv += `"${resultado.texto}","TOTAL",${resultado.total_votos},100%\n\n`;
      });
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=relatorio-votacao.csv'
        }
      });
    } else {
      // Formato JSON (padrão)
      return NextResponse.json({
        success: true,
        data_geracao: new Date().toISOString(),
        resultados
      });
    }
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
