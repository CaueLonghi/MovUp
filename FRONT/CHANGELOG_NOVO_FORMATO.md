# 🎉 Changelog - Novo Formato de API

## Data: 21/10/2025

---

## 📦 O Que Foi Alterado?

### Backend (`AI/root.py`)

#### ✨ Novo formato de resposta da API

A função `collect_analysis_results()` agora retorna:

```python
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
    "analysis_details": [...],  # Frame-by-frame (compatibilidade)
    "worst_frames": [...],
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

#### 🔧 Alterações específicas:

1. ✅ **Campo `analysis`**: Formato agregado com contadores por tipo
2. ✅ **Campo `analysis_details`**: Frame-by-frame para compatibilidade
3. ✅ **Campo `worst_frames`**: Array com piores frames de cada tipo
4. ✅ **Campo `total_duration_seconds`**: Adicionado ao summary
5. ✅ **Logs de debug**: Print do JSON completo na resposta

---

### Frontend

#### `useVideoUpload.js`

**Antes:**
```javascript
const { analysis = [], summary = {}, worst_frames = [] } = apiResponse;
```

**Depois:**
```javascript
const { 
  analysis = [],           // Agregado (novo)
  analysis_details = [],   // Frame-by-frame (compatibilidade)
  summary = {}, 
  worst_frames = [] 
} = apiResponse;

// Usa analysis_details para manter compatibilidade
const frameData = analysis_details.length > 0 ? analysis_details : [];
```

**Mudanças:**
- ✅ Detecta e usa `analysis_details` para dados frame-by-frame
- ✅ Mantém formato agregado em `analysis_aggregated`
- ✅ Adiciona `total_duration_seconds`
- ✅ Logs de debug com emojis 📥✅

#### `useReportData.js`

**Mudanças:**
- ✅ Comentários explicando o novo formato
- ✅ Logs detalhados de processamento
- ✅ Suporte para ambos os formatos (novo e legado)
- ✅ Fallback automático para formato antigo

---

## 🎯 Benefícios

### 1. **Formato Agregado**
- Dados resumidos por tipo de problema
- Fácil de usar em dashboards
- Menos processamento no frontend

### 2. **Compatibilidade Total**
- Frontend continua funcionando normalmente
- Suporte para formato legado
- Transição suave sem breaking changes

### 3. **Debugging Melhorado**
- Logs detalhados no backend
- Logs com emojis no frontend
- Fácil rastreamento de dados

### 4. **Flexibilidade**
- Dois formatos disponíveis
- Use o que for mais conveniente
- Fácil migração futura

---

## 🚀 Como Usar

### No Frontend

#### Acessar dados agregados:
```javascript
const aggregatedData = reportData.analysis_aggregated;

// Exemplo: Pegar dados de overstride
const overstrideData = aggregatedData.find(item => item.overstride);
console.log('Frames com erro:', overstrideData.overstride['Número de frames com erro']);
console.log('Frames com sucesso:', overstrideData.overstride['Número de frames com sucesso']);
```

#### Acessar dados frame-by-frame (padrão):
```javascript
const frameData = reportData.analysis; // Array de frames

// Filtrar por tipo
const overstrideFrames = frameData.filter(f => f.issue_type === 'overstride');
console.log('Total de frames com overstride:', overstrideFrames.length);
```

#### Acessar piores frames:
```javascript
const worstFrames = reportData.worst_frames;

// Pegar pior frame de overstride
const worstOverstride = worstFrames.find(f => f.error_type === 'overstride');
console.log('Pior frame:', worstOverstride.frame_number);
console.log('Imagem:', worstOverstride.image_path);
```

---

## 📊 Estrutura de Dados Detalhada

### Campos Principais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | string | Status da análise ("success") |
| `analysis` | array | **NOVO**: Formato agregado por tipo |
| `analysis_details` | array | Detalhes frame-by-frame |
| `worst_frames` | array | Piores frames de cada tipo |
| `summary` | object | Resumo geral da análise |

### Tipos de Issues

- `posture`: Problemas de postura
- `overstride`: Problemas de overstride
- `visibility`: Problemas de visibilidade baixa

---

## 🔍 Como Testar

1. **Iniciar o backend:**
   ```bash
   cd AI
   python root.py
   ```

2. **Fazer upload de um vídeo:**
   - Acesse o frontend
   - Faça upload de um vídeo
   - Aguarde a análise

3. **Verificar logs:**
   
   **Console do Backend (Terminal):**
   ```
   ========== RESULTADO DA ANÁLISE ==========
   {
     "status": "success",
     "analysis": [...],
     ...
   }
   ==========================================
   ```
   
   **Console do Frontend (Browser DevTools):**
   ```
   📥 API Response received: {...}
   ✅ Transformed data: {...}
   📊 useReportData: useEffect triggered
   ```

4. **Verificar relatório:**
   - Relatório deve exibir normalmente
   - Todas as seções devem aparecer
   - Imagens dos piores frames devem carregar

---

## ⚠️ Importante

### Compatibilidade

- ✅ **Código antigo continua funcionando**
- ✅ **Nenhum breaking change**
- ✅ **Fallback automático**

### Migração Futura

Se quiser usar o formato agregado no futuro:

```javascript
// Em vez de:
const frameData = reportData.analysis;

// Use:
const aggregatedData = reportData.analysis_aggregated;
```

---

## 📚 Documentação Adicional

Veja também:
- `API_FORMAT_DOCUMENTATION.md` - Documentação completa do formato
- Backend: `AI/root.py` - Função `collect_analysis_results()`
- Frontend: `FRONT/src/hooks/useVideoUpload.js`
- Frontend: `FRONT/src/hooks/useReportData.js`

---

## 🐛 Troubleshooting

### Problema: "Formato antigo ainda aparece"

**Solução:**
1. Reinicie o servidor backend
2. Limpe o cache do browser (Ctrl+Shift+R)
3. Verifique os logs do console

### Problema: "Relatório não exibe dados"

**Solução:**
1. Verifique o console do browser
2. Confirme que `analysis_details` existe na resposta
3. Verifique se há erros no console

### Problema: "Imagens não carregam"

**Solução:**
1. Verifique se o servidor está rodando
2. Confirme que as pastas `out/` existem
3. Verifique o caminho da imagem no `image_path`

---

**Autor**: AI Assistant  
**Data**: 21/10/2025  
**Versão**: 1.0.0

