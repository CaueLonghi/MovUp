# ✅ Resumo do Formato Final da API

## 📦 Formato Simplificado - Apenas Agregado

O backend agora envia **apenas** o formato agregado, sem `analysis_details`.

---

## 🔄 JSON Retornado pela API

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

## 📊 Estrutura dos Dados

### Campo `analysis`

Array com 3 objetos (um para cada tipo de problema):

```javascript
[
  { posture: { ... } },
  { overstride: { ... } },
  { baixa_visibilidade: { ... } }
]
```

### Cada tipo contém:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Número de frames com erro` | number | Quantidade de frames com problema |
| `Número de frames com sucesso` | number | Quantidade de frames sem problema |
| `worst_frame_number` | number | Número do frame com pior erro (0 se não há erros) |
| `image_path` | string | Caminho da imagem do pior frame ("" se não há erros) |

---

## 💻 Como o Frontend Processa

### 1. `useVideoUpload.js`

Extrai dados do formato agregado e cria array de worst_frames:

```javascript
// Extract data from aggregated format
const postureData = analysis.find(item => item.posture)?.posture || {};
const overstrideData = analysis.find(item => item.overstride)?.overstride || {};
const visibilityData = analysis.find(item => item.baixa_visibilidade)?.baixa_visibilidade || {};

// Create worst_frames array
worst_frames: [
  ...(postureData.worst_frame_number > 0 ? [{
    error_type: 'posture',
    frame_number: postureData.worst_frame_number,
    image_path: postureData.image_path,
    description: 'Pior frame de postura detectado'
  }] : []),
  // ... similar for overstride and visibility
]
```

### 2. `useReportData.js`

Processa cada item do array de análise:

```javascript
processedData.analysis.forEach(item => {
  // Check for posture data
  if (item.posture && item.posture['Número de frames com erro'] > 0) {
    const section = createAnalysisSection('posture', item.posture, processedData);
    if (section) sections.push(section);
  }
  
  // Similar for overstride and visibility
});
```

---

## 🎯 Exemplo de Uso

### Acessar dados de um tipo específico:

```javascript
// Get overstride data
const overstrideData = reportData.analysis.find(item => item.overstride)?.overstride;

if (overstrideData) {
  console.log('Frames com erro:', overstrideData['Número de frames com erro']);
  console.log('Frames com sucesso:', overstrideData['Número de frames com sucesso']);
  
  if (overstrideData.worst_frame_number > 0) {
    console.log('Pior frame:', overstrideData.worst_frame_number);
    console.log('Imagem:', overstrideData.image_path);
  }
}
```

### Verificar se há problemas:

```javascript
reportData.analysis.forEach(item => {
  if (item.posture && item.posture['Número de frames com erro'] > 0) {
    console.log('⚠️ Problemas de postura detectados!');
  }
  if (item.overstride && item.overstride['Número de frames com erro'] > 0) {
    console.log('⚠️ Problemas de overstride detectados!');
  }
  if (item.baixa_visibilidade && item.baixa_visibilidade['Número de frames com erro'] > 0) {
    console.log('⚠️ Problemas de visibilidade detectados!');
  }
});
```

---

## ✨ Benefícios

1. **Simples**: Apenas um formato, fácil de entender
2. **Compacto**: Menos dados trafegados na rede
3. **Eficiente**: Dados já agregados, menos processamento no frontend
4. **Claro**: Estrutura óbvia e intuitiva

---

## 🔍 Logs para Debug

### Console do Browser:

```
📥 API Response received: {...}
✅ Transformed data: {...}
📊 useReportData: useEffect triggered
🔄 useReportData: Starting data processing
📋 Analysis data: {...}
🔍 Creating analysis sections from aggregated data
✅ Analysis sections created: 1
```

### Console do Backend:

Pode adicionar print no `analyze_video` endpoint para ver o JSON completo.

---

## 📝 Checklist

- ✅ Backend envia formato agregado em `analysis`
- ✅ Sem campo `analysis_details`
- ✅ Frontend extrai dados do formato agregado
- ✅ Frontend cria array `worst_frames` a partir dos dados agregados
- ✅ Seções de análise são criadas corretamente
- ✅ Imagens dos piores frames carregam corretamente
- ✅ Logs de debug em todo o fluxo

---

**Última atualização**: 21/10/2025

