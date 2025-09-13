# Situação de Aprendizado - Manutenção de Sistemas
Repositório onde está armazenado o código refatorado para a UC 'Manutenção de Sistemas' do curso 'Desenvolvimento de Sistemas' da turma 'DESI - 2024/1'

## Checklist de Evidências:

| ***Problema reproduzido*** | ***Evidências coletadas*** |
| ------------- | ------------- |
| Lentidão em ```GET /tickets``` | Teste mostrou resposta > 8s (loop CPU-bound). |
| Erros 500 intermitentes | ```PUT /tickets/:id/status``` falhava ~30% das vezes. |
| IDs duplicados | ```POST /tickets``` simultâneos geravam mesmo ID sequencial. |
| Logs sensíveis | ```token=123456``` impresso no console + corpo completo de requisição com dados pessoais. |
| Vazamento de memória | ```setInterval``` inflando variável ```cache``` infinitamente. |
| Schema inconsistente | Campo ```titulo``` inconsistente com o resto do banco de dados. |

## Mapa de Problemas:

**Lentidão** → ```Loop for (2e7)``` bloqueando *CPU*

**Erro 500 intermitente** → ```Math.random()``` em *PUT*

**IDs duplicados** → *ID* baseado em *length* do array

**Exposição de dados sensíveis** → *Log* com *token* fixo e *body* completo

**Inconsistência de schema** → Campo titulo vs *title*

**Falta de validação** → Inserção de dados inválidos em *POST/PUT*

**Vazamento de memória** → *setInterval* adicionando dados ao *cache* sem limpeza

## Plano de Ação:

- Segurança:
  - Remover ```eval``` a favor de filtragens mais seguras.
  - Eliminar *log* de *token*/dados sensíveis.
  - Validar campos obrigatórios e de *status*.
- Disponibilidade:
  - Substituir *IDs* sequenciais por ```UUID```.
  - Tornar erros determinísticos (sem uso de ```Math.random()```).
- Performance:
  - Remover laço *CPU-bound*.
  - Substituir *I/O* síncrono por assíncrono.
  - Reduzir limite de *body* de *50mb* → *1mb*
  - Remover ```setInterval``` desnecessário.
 
Critérios de Aceitação:
  - ```GET /tickets``` < 300ms
  - Sem erros 500 aleatórios.
  - Sem duplicação de *IDs*.
  - *Logs* sem dados sensíveis.
  - *Schema* validado e consistente.

## Tabela de Validação
| Teste | Antes | Depois |
| ----- | ----- | ----- |
| ```GET /tickets``` (sem filtragem) | ~8s | ~12ms |
| ```PUT /tickets/:id/status``` | ~30% de chance de falhar com erro 500. | Sem falhas de ordem aleatória. |
| ```POST /tickets``` concorrentes | IDs Duplicados | *IDs* únicos (*UUID*) |
| *Log* de requisição | Exibe *token* + *corpo* completo | Apenas corpo necessário (sem *token*) |
| Schema | Linguagem inconsistente (*title* e *titulo*) | Apenas *title* (condizente com o resto do código) |
| Vazamento de memória | Crescimento indefinido de *cache* | Eliminado ```setInterval``` e *cache*, sem vazamentos |
