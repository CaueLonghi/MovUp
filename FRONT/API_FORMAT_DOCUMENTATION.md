# 📊 Documentação do Novo Formato da API

## Visão Geral

A API retorna dados no **formato agregado** - informações resumidas por tipo de problema:

1. **Formato Agregado** (`analysis`) - Dados resumidos por tipo de problema
   - Número de frames com erro
   - Número de frames com sucesso
   - Pior frame detectado
   - Caminho da imagem do pior frame

---

## 🔄 Formato da Resposta da API

### Estrutura Completa

```json
{
  "status": "success",
  "analysis": [
    {
      "posture": {
        "Número de frames com erro": 0,
        "Número de frames com sucesso": 354,
        "worst_frame_number": 0,
        "image_path": ""
      }
    },
    {
      "overstride": {
        "Número de frames com erro": 8,
        "Número de frames com sucesso": 346,
        "worst_frame_number": 318,
        "image_path": "out/min_heel/frame_000318.jpg"
      }
    },
    {
      "baixa_visibilidade": {
        "Número de frames com erro": 0,
        "Número de frames com sucesso": 354,
        "worst_frame_number": 0,
        "image_path": ""
      }
    }
  ],
  "summary": {
    "total_frames": 354,
    "fps": 29.91549295774648,
    "total_duration_seconds": 11.833333333333332,
    "posture_issues_count": 0,
    "overstride_issues_count": 8,
    "visibility_issues_count": 0
  }
}
```

---

## 📝 Campos Explicados

### `analysis` (Formato Agregado - NOVO)

Array com 3 objetos, um para cada tipo de problema:

- **posture**: Problemas de postura
- **overstride**: Problemas de overstride  
- **baixa_visibilidade**: Problemas de visibilidade

Cada objeto contém:
- `Número de frames com erro`: Quantidade de frames com o problema
- `Número de frames com sucesso`: Quantidade de frames sem o problema
- `worst_frame_number`: Número do frame com pior erro
- `image_path`: Caminho da imagem do pior frame

### `summary`

Resumo geral da análise:

```javascript
{
  total_frames: 354,            // Total de frames analisados
  fps: 29.91549295774648,       // FPS do vídeo
  total_duration_seconds: 11.83, // Duração total em segundos
  posture_issues_count: 0,      // Contador de problemas de postura
  overstride_issues_count: 8,   // Contador de problemas de overstride
  visibility_issues_count: 0    // Contador de problemas de visibilidade
}
```

---

## 🎯 Como o Frontend Usa os Dados

### 1. `useVideoUpload.js`

Transforma a resposta da API:

```javascript
const transformApiResponse = (apiResponse) => {
  const { 
    analysis = [],     // Formato agregado
    summary = {}
  } = apiResponse;
  
  // Extract data from aggregated format
  const postureData = analysis.find(item => item.posture)?.posture || {};
  const overstrideData = analysis.find(item => item.overstride)?.overstride || {};
  const visibilityData = analysis.find(item => item.baixa_visibilidade)?.baixa_visibilidade || {};
  
  return {
    status: apiResponse.status,
    analysis: analysis,  // Dados agregados
    total_frames: summary.total_frames,
    fps: summary.fps,
    total_duration_seconds: summary.total_duration_seconds,
    analysis_summary: {
      posture_issues: summary.posture_issues_count,
      overstride_issues: summary.overstride_issues_count,
      visibility_issues: summary.visibility_issues_count
    },
    worst_frames: [
      // Constrói array de worst_frames a partir dos dados agregados
      ...
    ]
  };
};
```

### 2. `useReportData.js`

Processa os dados agregados:

```javascript
// NEW FORMAT: analysis é um array de objetos [{ posture: {...} }, { overstride: {...} }, ...]
const sections = [];

processedData.analysis.forEach(item => {
  // Check for posture data
  if (item.posture && item.posture['Número de frames com erro'] > 0) {
    const section = createAnalysisSection('posture', item.posture, processedData);
    if (section) sections.push(section);
  }
  
  // Check for overstride data
  if (item.overstride && item.overstride['Número de frames com erro'] > 0) {
    const section = createAnalysisSection('overstride', item.overstride, processedData);
    if (section) sections.push(section);
  }
  
  // Check for visibility data
  if (item.baixa_visibilidade && item.baixa_visibilidade['Número de frames com erro'] > 0) {
    const section = createAnalysisSection('visibility', item.baixa_visibilidade, processedData);
    if (section) sections.push(section);
  }
});
```

---

## 🔍 Logs de Debug

O frontend agora inclui logs detalhados para facilitar o debug:

### Console do Frontend (Browser)

```
📥 API Response received: {...}
✅ Transformed data: {...}
📊 useReportData: useEffect triggered
🔄 useReportData: Starting data processing
📋 Analysis data: {...}
✅ Data processed successfully: {...}
```

### Console do Backend (Python)

```
========== RESULTADO DA ANÁLISE ==========
{
  "status": "success",
  "analysis": [...],
  ...
}
==========================================
```

---

## ✅ Checklist de Compatibilidade

- ✅ Formato agregado (`analysis`) para relatórios resumidos
- ✅ Formato detalhado (`analysis_details`) para análise frame-by-frame
- ✅ Array de piores frames (`worst_frames`)
- ✅ Resumo com contadores (`summary`)
- ✅ Compatibilidade com código legado
- ✅ Logs de debug em todo o fluxo
- ✅ Fallback para formatos antigos

---

## 🚀 Testando

1. Faça upload de um vídeo
2. Verifique o console do backend para o JSON completo
3. Verifique o console do browser para os dados transformados
4. O relatório deve exibir todos os dados corretamente

---

## 📌 Notas Importantes

- O campo `analysis` no frontend **sempre contém** dados frame-by-frame (por compatibilidade)
- O formato agregado está disponível em `analysis_aggregated` para uso futuro
- Todos os componentes existentes continuam funcionando normalmente
- Os logs ajudam a identificar problemas rapidamente

---

**Última atualização**: 21/10/2025

