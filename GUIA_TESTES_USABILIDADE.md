# 🏠 SISMOBI - Guia de Testes de Usabilidade

## 📋 **Informações do Sistema**

**Sistema**: SISMOBI - Sistema de Gestão Imobiliária v3.2.0  
**Tecnologia**: React + TypeScript (Frontend) + FastAPI (Backend)  
**Status**: ✅ Pronto para testes  

## 🔑 **Credenciais de Acesso**

- **Email**: admin@sismobi.com
- **Senha**: admin123

## 🎯 **Objetivos dos Testes**

1. **Cadastro e login de usuário**
2. **Busca, filtragem e navegação entre registros**  
3. **Geração, visualização e download de relatórios**
4. **Upload de arquivos e anexos**
5. **Verificar responsividade em desktop e mobile**

---

## 📊 **Dados de Teste Disponíveis**

### 👥 **Inquilinos (6 registros)**
1. **João Silva** - CPF Válido, Status Ativo, Propriedade Associada
2. **Maria Santos** - Sem Propriedade Associada
3. **Carlos Lima** - CPF Fictício (000.000.000-00)
4. **Ana Oliveira** - Status Inativo
5. **Pedro Mendes** - CPF Inválido (formato curto)
6. **Luana Costa** - Sem CPF

### 🏘️ **Propriedades (2 registros)**
1. **Apartamento Centro** - Status: Alugado, Valor: R$ 1.500
2. **Casa Jardim** - Status: Vago, Valor: R$ 1.200

### 💰 **Resumo Financeiro**
- Total de Propriedades: 2
- Total de Inquilinos: 6
- Renda Mensal Total: R$ 7.300
- Propriedades Ocupadas: 1
- Propriedades Vagas: 1

---

## 🧪 **Roteiro de Testes Detalhado**

### **1. TESTE DE LOGIN E ACESSO INICIAL**

**Cenários a Testar:**
- ✅ Login com credenciais válidas
- ❌ Login com credenciais inválidas
- 🔄 Verificar redirecionamento após login
- 📱 Testar em dispositivos móveis

**Passos:**
1. Acesse a URL da aplicação
2. Insira email: `admin@sismobi.com`
3. Insira senha: `admin123`
4. Clique em "Entrar"
5. Verifique se é redirecionado para o dashboard

**Resultados Esperados:**
- Login bem-sucedido
- Dashboard carregado com dados resumidos
- Menu lateral visível e funcional

---

### **2. TESTE DO DASHBOARD**

**Funcionalidades a Verificar:**
- 📊 Cards de resumo (propriedades, inquilinos, renda)
- 📈 Gráficos e estatísticas
- 🧭 Navegação pelo menu lateral
- 📱 Responsividade em diferentes telas

**Dados Esperados:**
- Total de Propriedades: 2
- Total de Inquilinos: 6
- Renda Mensal: R$ 7.300,00
- Propriedades Ocupadas: 1
- Propriedades Vagas: 1

---

### **3. TESTE DE GESTÃO DE INQUILINOS**

**Navegação:** Menu Lateral → "Inquilinos"

**Funcionalidades a Testar:**

#### **3.1 Visualização e Busca**
- 👀 Verificar lista com 6 inquilinos
- 🔍 Testar campo de busca por nome
- 🏷️ Filtrar por status (Ativo/Inativo)
- 🏠 Filtrar por propriedade

#### **3.2 Validações Específicas**
- ✅ **João Silva**: CPF válido, propriedade associada
- ⚠️ **Maria Santos**: Sem propriedade (deve mostrar alerta)
- ❌ **Carlos Lima**: CPF fictício (deve mostrar validação)
- 🔴 **Ana Oliveira**: Status inativo
- ⚠️ **Pedro Mendes**: CPF formato inválido
- ❌ **Luana Costa**: Sem CPF

#### **3.3 Operações CRUD**
- ➕ **Adicionar Novo Inquilino**
  - Testar validação de CPF
  - Testar campos obrigatórios
  - Testar associação com propriedade
- ✏️ **Editar Inquilino Existente**
  - Modificar dados básicos
  - Alterar status
  - Trocar propriedade associada
- 🗑️ **Excluir Inquilino**
  - Confirmar exclusão
  - Verificar atualização da lista

---

### **4. TESTE DE GESTÃO DE PROPRIEDADES**

**Navegação:** Menu Lateral → "Propriedades"

**Funcionalidades a Testar:**

#### **4.1 Visualização**
- 🏠 **Apartamento Centro** (Alugado - R$ 1.500)
- 🏡 **Casa Jardim** (Vago - R$ 1.200)

#### **4.2 Operações**
- ➕ Adicionar nova propriedade
- ✏️ Editar propriedades existentes
- 🔗 Verificar associação com inquilinos
- 💰 Atualizar valores de aluguel

---

### **5. TESTE DE TRANSAÇÕES E RELATÓRIOS**

**Navegação:** Menu Lateral → "Transações" / "Relatórios"

**Funcionalidades a Testar:**
- ➕ Adicionar receitas e despesas
- 📊 Visualizar relatórios financeiros
- 📅 Filtrar por período
- 💾 Exportar relatórios
- 📈 Verificar cálculos automáticos

---

### **6. TESTE DE SISTEMA DE ALERTAS**

**Navegação:** Menu Lateral → "Alertas"

**Funcionalidades a Testar:**
- 🚨 Alertas automáticos (inquilinos sem propriedade, CPFs inválidos)
- ✅ Marcar alertas como resolvidos
- 🗑️ Excluir alertas

---

### **7. TESTE DE DOCUMENTOS**

**Navegação:** Menu Lateral → "Documentos"

**Funcionalidades a Testar:**
- 📄 Upload de arquivos
- 🏷️ Associar documentos a propriedades/inquilinos
- 👀 Visualizar documentos
- 🗑️ Excluir documentos

---

### **8. TESTE DE CÁLCULOS DE ENERGIA E ÁGUA**

**Navegação:** Menu Lateral → "Energia" / "Água"

**Funcionalidades a Testar:**
- ⚡ Adicionar contas de energia
- 💧 Adicionar contas de água
- 📊 Visualizar histórico de consumo
- 💰 Calcular rateios entre inquilinos

---

### **9. TESTE DE BACKUP E EXPORT**

**Localização:** Header da aplicação

**Funcionalidades a Testar:**
- 💾 Exportar dados (formato JSON)
- 📥 Importar backup
- ✅ Validar integridade dos dados

---

### **10. TESTE DE RESPONSIVIDADE**

**Dispositivos a Testar:**
- 💻 **Desktop** (1920x1080)
- 📱 **Mobile** (375x667)
- 📱 **Tablet** (768x1024)

**Aspectos a Verificar:**
- 🧭 Menu lateral responsivo
- 📊 Tabelas adaptáveis
- 🎛️ Formulários otimizados
- 👆 Touch interactions em mobile

---

## ⚠️ **Cenários de Teste Específicos**

### **Casos de Borda a Testar:**
1. **CPF Inválido**: Tentar cadastrar inquilino com CPF 000.000.000-00
2. **Email Duplicado**: Tentar cadastrar inquilino com email existente
3. **Propriedade Sem Inquilino**: Verificar propriedades vagas
4. **Inquilino Sem Propriedade**: Verificar alertas automáticos
5. **Valores Negativos**: Tentar inserir aluguel com valor negativo
6. **Datas Inválidas**: Testar campos de data com valores incorretos

### **Testes de Performance:**
- ⏱️ Tempo de carregamento inicial
- 🔄 Responsividade ao navegar entre seções
- 📊 Velocidade de geração de relatórios
- 💾 Tempo de export/import de dados

---

## 📝 **Relatório de Testes - Template**

```
SISMOBI - Relatório de Testes de Usabilidade
Data: ___/___/2024
Testador: ________________

=== FUNCIONALIDADES TESTADAS ===

[ ] Login e Autenticação
[ ] Dashboard e Navegação
[ ] Gestão de Inquilinos
[ ] Gestão de Propriedades  
[ ] Transações e Relatórios
[ ] Sistema de Alertas
[ ] Upload de Documentos
[ ] Cálculos de Energia/Água
[ ] Backup e Export
[ ] Responsividade Mobile

=== PROBLEMAS ENCONTRADOS ===

1. _____________________________
2. _____________________________
3. _____________________________

=== SUGESTÕES DE MELHORIA ===

1. _____________________________
2. _____________________________
3. _____________________________

=== AVALIAÇÃO GERAL ===

Usabilidade: [ ] Excelente [ ] Boa [ ] Regular [ ] Ruim
Performance: [ ] Excelente [ ] Boa [ ] Regular [ ] Ruim
Design: [ ] Excelente [ ] Boa [ ] Regular [ ] Ruim

Comentários Gerais:
________________________________
```

---

## 🚀 **Status da Aplicação**

- ✅ **Backend**: FastAPI rodando na porta 8001
- ✅ **Frontend**: React rodando na porta 3000
- ✅ **Banco de Dados**: MongoDB com dados mockados
- ✅ **Build**: Compilação bem-sucedida
- ✅ **APIs**: Todos os endpoints funcionais
- ✅ **Autenticação**: Sistema JWT implementado

**Pronto para testes de usabilidade!** 🎉