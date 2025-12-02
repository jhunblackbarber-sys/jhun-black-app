# 📦 COMANDOS GIT - Jhun Black Barber

## 🎯 Para fazer Push do código para seu GitHub

### Opção 1: Se você já clonou o repositório antes

```bash
# Entre na pasta do projeto
cd jhun-black-app

# Puxe as últimas mudanças (se houver)
git pull origin main

# COPIE TODOS os arquivos do Emergent para esta pasta
# (você vai fazer download manual dos arquivos)

# Veja o que mudou
git status

# Adicione todos os arquivos
git add .

# Faça commit
git commit -m "✨ Deploy completo - Jhun Black Barber PWA"

# Envie para GitHub
git push origin main
```

---

### Opção 2: Se é a primeira vez

```bash
# Clone seu repositório
git clone https://github.com/jhunblackbarber-sys/jhun-black-app.git

# Entre na pasta
cd jhun-black-app

# COPIE TODOS os arquivos do Emergent para esta pasta

# Configure seu usuário Git (se ainda não fez)
git config user.name "Seu Nome"
git config user.email "seu-email@exemplo.com"

# Adicione todos os arquivos
git add .

# Faça commit
git commit -m "✨ Deploy completo - Jhun Black Barber PWA"

# Envie para GitHub
git push origin main
```

---

## 📁 ARQUIVOS QUE VOCÊ PRECISA COPIAR:

Faça download manual de cada arquivo do Emergent e coloque no repositório local:

### Backend (pasta `/app/backend/`):
- `server.py`
- `requirements.txt`
- `.env` (crie localmente, NÃO comite para GitHub)

### Frontend (pasta `/app/frontend/`):
- `package.json`
- `tailwind.config.js`
- `postcss.config.js`
- `.env` (crie localmente, NÃO comite para GitHub)
- `public/` (toda pasta)
  - `index.html`
  - `manifest.json`
  - `service-worker.js`
- `src/` (toda pasta)
  - `index.js`
  - `index.css`
  - `App.js`
  - `App.css`
  - `components/ui/` (todos os componentes)
  - `pages/` (todas as páginas)
    - `LandingPage.jsx`
    - `BookingFlow.jsx`
    - `AdminLogin.jsx`
    - `AdminDashboard.jsx`

### Raiz (pasta `/app/`):
- `.gitignore`
- `railway.json`
- `vercel.json`
- `README.md`
- `GUIA_DEPLOY_GRATUITO.md`

---

## 🔧 CRIAR ARQUIVOS .ENV LOCALMENTE

**NÃO comite arquivos .env no GitHub!**

### Backend (`.env` na pasta backend/):
```env
MONGO_URL="sua-string-mongodb-aqui"
DB_NAME="jhun_barber"
CORS_ORIGINS="*"
ADMIN_PASSWORD="jhun2025"
```

### Frontend (`.env` na pasta frontend/):
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## ✅ VERIFICAR ANTES DE COMITAR

```bash
# Ver o que vai ser commitado
git status

# Ver diferenças
git diff

# Verificar se .env NÃO aparece (deve estar no .gitignore)
# Se aparecer arquivos .env, NÃO comite!
```

---

## 🆘 RESOLVER PROBLEMAS COMUNS

### Erro: "fatal: not a git repository"
```bash
git init
git remote add origin https://github.com/jhunblackbarber-sys/jhun-black-app.git
```

### Erro: "Permission denied (publickey)"
- Configure SSH keys no GitHub ou use HTTPS
- https://docs.github.com/pt/authentication

### Erro: "rejected because the remote contains work"
```bash
git pull origin main --rebase
git push origin main
```

### Precisa desfazer último commit?
```bash
git reset --soft HEAD~1
```

---

## 💡 DICAS

1. **Sempre** faça `git pull` antes de começar a trabalhar
2. **Nunca** comite arquivos `.env`
3. **Sempre** verifique `git status` antes de commitar
4. Use mensagens de commit descritivas
5. Commits pequenos e frequentes são melhores

---

## 📚 COMANDOS ÚTEIS

```bash
# Ver histórico de commits
git log --oneline

# Ver branches
git branch

# Criar nova branch
git checkout -b nome-da-branch

# Voltar para branch main
git checkout main

# Ver diferenças de um arquivo específico
git diff arquivo.js

# Descartar mudanças locais
git checkout -- arquivo.js

# Atualizar repositório local
git fetch origin

# Ver status resumido
git status -s
```

---

**Pronto para commitar?** Siga os passos da Opção 1 ou 2 acima! 🚀
