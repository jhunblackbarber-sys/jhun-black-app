# ⚡ INÍCIO RÁPIDO - Deploy Gratuito em 5 Passos

## 📌 Ordem de Execução:

```
1️⃣ MongoDB Atlas (5 min) 
    ↓
2️⃣ Código no GitHub (10 min)
    ↓
3️⃣ Railway Backend (10 min)
    ↓
4️⃣ Vercel Frontend (5 min)
    ↓
5️⃣ Testar tudo! (5 min)
```

**Total:** ~35 minutos

---

## 1️⃣ MONGODB ATLAS

**O que é:** Seu banco de dados na nuvem (GRATUITO)

1. https://mongodb.com/cloud/atlas/register
2. Criar conta → Login
3. "Build a Database" → **M0 FREE**
4. Criar usuário e senha → **GUARDAR SENHA!**
5. IP Address: `0.0.0.0/0`
6. Connect → Copiar string → **GUARDAR STRING!**

✅ Você terá: `mongodb+srv://usuario:senha@cluster.mongodb.net/`

---

## 2️⃣ GITHUB

**O que é:** Onde fica seu código

### Opção A: Upload Manual (Mais Fácil)

1. Vá em: https://github.com/jhunblackbarber-sys/jhun-black-app
2. Clique em "Add file" → "Upload files"
3. **Arraste TODOS os arquivos do Emergent** (menos pastas `.git`, `node_modules`, `.env`)
4. Commit: "Deploy completo"
5. Upload!

### Opção B: Git Command Line

```bash
git clone https://github.com/jhunblackbarber-sys/jhun-black-app.git
cd jhun-black-app
# Copie todos os arquivos aqui
git add .
git commit -m "Deploy completo"
git push origin main
```

✅ Código no GitHub!

---

## 3️⃣ RAILWAY (Backend)

**O que é:** Roda seu servidor FastAPI (GRATUITO com $5/mês crédito)

1. https://railway.app/ → Login com GitHub
2. "New Project" → "Deploy from GitHub repo"
3. Selecione: `jhunblackbarber-sys/jhun-black-app`
4. Deploy!

### Configurar:

**Settings:**
- Root Directory: `backend`
- Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

**Variables:**
```
MONGO_URL=sua-string-do-mongodb
DB_NAME=jhun_barber
CORS_ORIGINS=*
ADMIN_PASSWORD=jhun2025
PORT=8001
```

**Domains:**
- "Generate Domain" → **COPIAR URL!**

### Testar:
Abra: `https://sua-url.railway.app/api/`  
Deve mostrar: `{"message":"Jhun Black Barber API"}`

✅ Backend funcionando!

---

## 4️⃣ VERCEL (Frontend)

**O que é:** Hospeda seu site/PWA (TOTALMENTE GRATUITO)

1. https://vercel.com/signup → Login com GitHub
2. "Add New..." → "Project"
3. Import: `jhunblackbarber-sys/jhun-black-app`

### Configurar:

- Framework: **Create React App**
- Root Directory: `frontend`
- Build Command: `yarn build`
- Output Directory: `build`

**Environment Variable:**
```
REACT_APP_BACKEND_URL = https://sua-url.railway.app
```
(Cole a URL do Railway do passo 3)

4. "Deploy"!
5. Aguarde 2-3 minutos
6. **COPIAR URL!** (ex: `https://jhun-black-app.vercel.app`)

✅ Site no ar!

---

## 5️⃣ TESTAR

Abra a URL do Vercel no navegador:

### Checklist:
- [ ] Landing page carrega (logo + botão BOOK NOW)
- [ ] Clica em "BOOK NOW"
- [ ] Lista de 13 serviços aparece
- [ ] Seleciona um serviço
- [ ] Calendário funciona
- [ ] Seleciona data e horário
- [ ] Preenche nome e telefone
- [ ] Confirma agendamento
- [ ] Vai em `/admin/login`
- [ ] Login com senha `jhun2025`
- [ ] Dashboard carrega

### Testar no Celular:
1. Abra a URL no Safari (iPhone) ou Chrome (Android)
2. Adicione à tela inicial
3. Abre como app nativo!

✅ **TUDO FUNCIONANDO!**

---

## 🎯 SUAS URLs FINAIS:

Após completar, você terá:

```
🌐 Site Principal (Vercel):
https://jhun-black-app.vercel.app

🔧 API Backend (Railway):
https://seu-app.railway.app

💾 Database (MongoDB Atlas):
Cluster no painel do Atlas
```

---

## 💰 CUSTOS:

| Serviço | Custo |
|---------|-------|
| MongoDB Atlas | $0 (512MB free) |
| Railway | $0-5/mês ($5 crédito) |
| Vercel | $0 |
| **TOTAL** | **$0-5/mês** |

---

## 🆘 DEU ERRO?

### Backend não sobe no Railway:
- ✅ Confirme Root Directory: `backend`
- ✅ Veja logs no Railway (tab "Deployments")
- ✅ Verifique `requirements.txt`

### Frontend não carrega no Vercel:
- ✅ Confirme Root Directory: `frontend`
- ✅ Veja logs no Vercel (tab "Deployments")
- ✅ Verifique `REACT_APP_BACKEND_URL`

### App não carrega serviços:
- ✅ Teste backend direto: `sua-url.railway.app/api/services`
- ✅ Verifique CORS no backend
- ✅ Olhe console do navegador (F12)

### MongoDB não conecta:
- ✅ Senha correta na string?
- ✅ IP `0.0.0.0/0` liberado?
- ✅ String tem `retryWrites=true`?

---

## 📚 DOCUMENTAÇÃO COMPLETA:

Se precisar de mais detalhes, veja:
- `GUIA_DEPLOY_GRATUITO.md` - Guia passo a passo detalhado
- `COMANDOS_GIT.md` - Comandos Git úteis
- `JHUN_BARBER_README.md` - Documentação do app

---

## 🎉 PRONTO!

Seu app está no ar, funcionando e **GRATUITO**!

**Próximo passo:** Compartilhe o link e comece a receber agendamentos! 🚀

Alguma dúvida? Volte aqui no Emergent e peça ajuda!
